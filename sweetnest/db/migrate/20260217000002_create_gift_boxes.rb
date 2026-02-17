# frozen_string_literal: true

class CreateGiftBoxes < ActiveRecord::Migration[6.0]
  def change
    create_table :gift_boxes do |t|
      t.integer :levels, null: false
      t.decimal :base_price, null: false, precision: 8, scale: 2, default: 29.99
      t.string :status, null: false, default: "draft"

      t.timestamps
    end

    add_index :gift_boxes, :status
  end
end

