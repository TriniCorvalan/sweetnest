# frozen_string_literal: true

class CreateOrders < ActiveRecord::Migration[6.0]
  def change
    create_table :orders do |t|
      t.references :gift_box, null: false, foreign_key: true
      t.string :status, null: false
      t.string :order_number, null: false

      t.timestamps
    end

    add_index :orders, :order_number, unique: true
  end
end

