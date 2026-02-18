# frozen_string_literal: true

class OrdersController < ApplicationController
  WALL_CAPACITY_UNITS = [4, 6, 8].freeze
  SIZE_WEIGHT_UNITS = { "small" => 1, "medium" => 2, "large" => 3 }.freeze

  def create
    payload = request.request_parameters || {}

    levels = payload["levels"].to_i
    box_config = payload["box_config"].is_a?(Hash) ? payload["box_config"] : {}
    shipping = payload["shipping"].is_a?(Hash) ? payload["shipping"] : {}

    errors = []
    errors << "levels debe ser 1..3" unless (1..3).cover?(levels)

    shipping["zip"] = shipping["zip"].to_s.strip
    shipping["zip"] = "0000000" if shipping["zip"].blank?

    %w[full_name rut phone email street region commune].each do |field|
      errors << "shipping.#{field} es requerido" if shipping[field].to_s.strip.empty?
    end

    if errors.any?
      return render json: { error: errors.join(", ") }, status: :unprocessable_entity
    end

    order = nil
    requested_entries = []
    requested_totals = Hash.new(0)
    requested_by_wall = Hash.new { |h, k| h[k] = { qty: 0, units: 0 } }

    # Normaliza box_config a una lista de {level_index, wall_position, candy_id, quantity}
    box_config.each do |level_key, walls|
      level_index = level_key.to_i
      next unless (0...levels).cover?(level_index)
      next unless walls.is_a?(Hash)

      walls.each do |wall_key, entries|
        wall_position = wall_key.to_i
        next unless (0..3).cover?(wall_position)

        Array(entries).each do |entry|
          next unless entry.is_a?(Hash)

          candy_id = entry["candy_id"].to_i
          quantity = entry["quantity"].to_i
          next if candy_id <= 0 || quantity <= 0

          requested_entries << {
            level_index: level_index,
            wall_position: wall_position,
            candy_id: candy_id,
            quantity: quantity
          }
          requested_totals[candy_id] += quantity
        end
      end
    end

    ActiveRecord::Base.transaction do
      # Reglas de armado: cada pared con al menos 1 dulce y capacidad por pared.
      required_pairs = []
      (0...levels).each do |level_index|
        (0..3).each do |wall_position|
          required_pairs << [level_index, wall_position]
        end
      end

      required_pairs.each do |(level_index, wall_position)|
        has_any = requested_entries.any? { |e| e[:level_index] == level_index && e[:wall_position] == wall_position }
        unless has_any
          invalid = Order.new
          invalid.errors.add(:base, "Cada pared de cada nivel debe tener al menos 1 dulce (falta Nivel #{level_index + 1}, pared #{wall_position + 1})")
          raise ActiveRecord::RecordInvalid, invalid
        end
      end

      # Bloqueo de stock y validaciones (evita sobreventa y pedidos inválidos si se manipula el payload).
      if requested_entries.any?
        candies_by_id = Candy.lock.where(id: requested_totals.keys).index_by(&:id)
        missing_ids = requested_totals.keys - candies_by_id.keys
        if missing_ids.any?
          invalid = Order.new
          invalid.errors.add(:base, "Hay dulces inválidos en la selección (ids: #{missing_ids.join(', ')})")
          raise ActiveRecord::RecordInvalid, invalid
        end

        requested_entries.each do |entry|
          candy = candies_by_id[entry[:candy_id]]
          level_number = entry[:level_index] + 1

          unless candy.allowed_on_level?(level_number)
            invalid = Order.new
            invalid.errors.add(:base, "El dulce '#{candy.name}' no se puede agregar al nivel #{level_number}")
            raise ActiveRecord::RecordInvalid, invalid
          end

          weight = SIZE_WEIGHT_UNITS[candy.size_category.to_s] || 1
          max_weight = [1, 2, 3][[entry[:level_index].to_i, 2].min]
          if weight > max_weight
            invalid = Order.new
            invalid.errors.add(:base, "El dulce '#{candy.name}' es demasiado grande para el nivel #{level_number}")
            raise ActiveRecord::RecordInvalid, invalid
          end

          key = [entry[:level_index], entry[:wall_position]]
          requested_by_wall[key][:qty] += entry[:quantity].to_i
          requested_by_wall[key][:units] += entry[:quantity].to_i * weight
        end

        requested_by_wall.each do |(level_index, wall_position), stats|
          cap = WALL_CAPACITY_UNITS[[level_index.to_i, 2].min] || WALL_CAPACITY_UNITS[0]
          if stats[:units].to_i > cap.to_i
            invalid = Order.new
            invalid.errors.add(:base, "Excede capacidad en Nivel #{level_index + 1}, pared #{wall_position + 1}")
            raise ActiveRecord::RecordInvalid, invalid
          end
        end

        requested_totals.each do |candy_id, qty|
          candy = candies_by_id[candy_id]
          if candy.stock.to_i < qty.to_i
            invalid = Order.new
            invalid.errors.add(:base, "Stock insuficiente para '#{candy.name}'. Disponible: #{candy.stock}, solicitado: #{qty}")
            raise ActiveRecord::RecordInvalid, invalid
          end
        end

        requested_totals.each do |candy_id, qty|
          candy = candies_by_id[candy_id]
          candy.update!(stock: candy.stock.to_i - qty.to_i)
        end
      end

      gift_box = GiftBox.create!(
        levels: levels,
        base_price: GiftBox::DEFAULT_BASE_PRICE,
        status: "completed"
      )

      box_levels = (0...levels).map do |level_number|
        gift_box.box_levels.create!(level_number: level_number)
      end

      requested_entries.each do |entry|
        box_level = box_levels[entry[:level_index]]

        wall_candy = box_level.wall_candies.find_or_initialize_by(
          wall_position: entry[:wall_position],
          candy_id: entry[:candy_id]
        )
        wall_candy.quantity = (wall_candy.quantity || 0) + entry[:quantity]
        wall_candy.save!
      end

      order = gift_box.build_order(
        status: "created",
        order_number: generate_unique_order_number
      )
      order.save!

      order.create_address!(
        full_name: shipping["full_name"],
        rut: shipping["rut"],
        phone: shipping["phone"],
        email: shipping["email"],
        street: shipping["street"],
        unit: shipping["unit"],
        region: shipping["region"],
        commune: shipping["commune"],
        city: [shipping["commune"], shipping["region"]].compact.join(", "),
        zip: shipping["zip"],
        special_instructions: shipping["special_instructions"]
      )
    end

    send_transfer_email(order)

    render json: { order_id: order.id, order_number: order.order_number }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages.join(", ") }, status: :unprocessable_entity
  end

  private

  def send_transfer_email(order)
    return if order.blank? || order.address.blank? || order.address.email.blank?

    OrderMailer.transfer_instructions(order).deliver_now
  rescue StandardError => e
    Rails.logger.error("No se pudo enviar correo de transferencia para order #{order&.id}: #{e.class} - #{e.message}")
  end

  def generate_unique_order_number
    loop do
      candidate = "SN#{SecureRandom.hex(3).upcase}"
      break candidate unless Order.exists?(order_number: candidate)
    end
  end
end

