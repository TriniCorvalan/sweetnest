class AddChileFieldsToAddresses < ActiveRecord::Migration[6.0]
  def up
    add_column :addresses, :rut, :string
    add_column :addresses, :phone, :string
    add_column :addresses, :region, :string
    add_column :addresses, :commune, :string

    Address.reset_column_information
    Address.find_each do |address|
      rut = extract_value(address.special_instructions, "RUT")
      phone = extract_value(address.special_instructions, "Telefono")
      commune, region = split_city(address.city)

      address.update_columns(
        rut: rut.presence || "SIN-RUT",
        phone: phone.presence || "SIN-TELEFONO",
        region: region.presence || "Sin region",
        commune: commune.presence || "Sin comuna"
      )
    end

    change_column_null :addresses, :rut, false
  end

  def down
    remove_column :addresses, :commune
    remove_column :addresses, :region
    remove_column :addresses, :phone
    remove_column :addresses, :rut
  end

  private

  def extract_value(text, key)
    return "" if text.blank?

    match = text.match(/#{Regexp.escape(key)}:\s*([^|]+)/i)
    match ? match[1].to_s.strip : ""
  end

  def split_city(city)
    parts = city.to_s.split(",").map(&:strip).reject(&:empty?)
    return [parts[0], parts[1]] if parts.length >= 2
    [parts[0], ""]
  end
end
