# frozen_string_literal: true

class OrdersController < ApplicationController
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

    ActiveRecord::Base.transaction do
      gift_box = GiftBox.create!(
        levels: levels,
        base_price: GiftBox::DEFAULT_BASE_PRICE,
        status: "completed"
      )

      box_levels = (0...levels).map do |level_number|
        gift_box.box_levels.create!(level_number: level_number)
      end

      box_config.each do |level_key, walls|
        level_index = level_key.to_i
        next unless (0...levels).cover?(level_index)

        box_level = box_levels[level_index]
        next unless walls.is_a?(Hash)

        walls.each do |wall_key, entries|
          wall_position = wall_key.to_i
          next unless (0..3).cover?(wall_position)

          Array(entries).each do |entry|
            next unless entry.is_a?(Hash)

            candy_id = entry["candy_id"].to_i
            quantity = entry["quantity"].to_i
            next if candy_id <= 0 || quantity <= 0

            wall_candy = box_level.wall_candies.find_or_initialize_by(
              wall_position: wall_position,
              candy_id: candy_id
            )
            wall_candy.quantity = (wall_candy.quantity || 0) + quantity
            wall_candy.save!
          end
        end
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

    render json: { order_id: order.id, order_number: order.order_number }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages.join(", ") }, status: :unprocessable_entity
  end

  private

  def generate_unique_order_number
    loop do
      candidate = "SN#{SecureRandom.hex(3).upcase}"
      break candidate unless Order.exists?(order_number: candidate)
    end
  end
end

