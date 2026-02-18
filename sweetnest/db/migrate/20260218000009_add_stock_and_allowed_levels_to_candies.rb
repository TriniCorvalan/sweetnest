# frozen_string_literal: true

class AddStockAndAllowedLevelsToCandies < ActiveRecord::Migration[6.0]
  def change
    add_column :candies, :stock, :integer, null: false, default: 0
    add_column :candies, :allowed_levels, :integer, array: true, null: false, default: []
    add_index :candies, :stock
  end
end

