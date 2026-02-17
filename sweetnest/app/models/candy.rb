# frozen_string_literal: true

class Candy < ApplicationRecord
  SIZE_CATEGORIES = %w[small medium large].freeze

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :size_category, presence: true, inclusion: { in: SIZE_CATEGORIES }
  validates :emoji, presence: true
  validates :color_hex, presence: true
end

