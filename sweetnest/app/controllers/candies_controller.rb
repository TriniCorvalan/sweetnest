# frozen_string_literal: true

class CandiesController < ApplicationController
  def index
    candies = Candy.order(:id).to_a

    grouped = candies.group_by(&:size_category).transform_values do |arr|
      arr.map do |c|
        {
          id: c.id,
          name: c.name,
          price: c.price.to_f,
          size_category: c.size_category,
          emoji: c.emoji,
          color_hex: c.color_hex,
          preview_size: c.preview_size.to_f,
          allowed_levels: (c.allowed_levels || []).map(&:to_i),
          stock: c.stock.to_i
        }
      end
    end

    render json: grouped
  end
end

