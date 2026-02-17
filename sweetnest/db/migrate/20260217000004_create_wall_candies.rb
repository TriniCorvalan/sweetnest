# frozen_string_literal: true

class CreateWallCandies < ActiveRecord::Migration[6.0]
  def change
    create_table :wall_candies do |t|
      t.references :box_level, null: false, foreign_key: true
      t.integer :wall_position, null: false
      t.references :candy, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1

      t.timestamps
    end

    add_index :wall_candies, [:box_level_id, :wall_position, :candy_id], unique: true, name: "idx_wall_candies_uniqueness"
  end
end

