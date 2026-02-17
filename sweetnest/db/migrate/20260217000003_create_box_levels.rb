# frozen_string_literal: true

class CreateBoxLevels < ActiveRecord::Migration[6.0]
  def change
    create_table :box_levels do |t|
      t.references :gift_box, null: false, foreign_key: true
      t.integer :level_number, null: false

      t.timestamps
    end

    add_index :box_levels, [:gift_box_id, :level_number], unique: true
  end
end

