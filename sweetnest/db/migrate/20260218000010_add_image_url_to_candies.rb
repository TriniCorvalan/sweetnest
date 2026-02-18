# frozen_string_literal: true

class AddImageUrlToCandies < ActiveRecord::Migration[6.0]
  def change
    add_column :candies, :image_url, :string
    add_index :candies, :image_url
  end
end

