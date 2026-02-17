# frozen_string_literal: true

class CreateAddresses < ActiveRecord::Migration[6.0]
  def change
    create_table :addresses do |t|
      t.references :order, null: false, foreign_key: true
      t.string :full_name, null: false
      t.string :street, null: false
      t.string :unit
      t.string :city, null: false
      t.string :zip, null: false
      t.text :special_instructions

      t.timestamps
    end
  end
end

