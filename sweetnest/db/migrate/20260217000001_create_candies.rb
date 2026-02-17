# frozen_string_literal: true

class CreateCandies < ActiveRecord::Migration[6.0]
  def change
    create_table :candies do |t|
      t.string :name, null: false
      t.decimal :price, null: false, precision: 8, scale: 2
      t.string :size_category, null: false
      t.string :emoji, null: false
      t.string :color_hex, null: false
      t.decimal :preview_size, null: false, precision: 4, scale: 2, default: 0.50

      t.timestamps
    end

    add_index :candies, :size_category
  end
end

