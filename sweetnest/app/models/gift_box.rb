# frozen_string_literal: true

class GiftBox < ApplicationRecord
  DEFAULT_BASE_PRICE = 29.99

  has_many :box_levels, dependent: :destroy
  has_one :order, dependent: :destroy

  validates :levels, presence: true, inclusion: { in: 1..3 }
  validates :base_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true, inclusion: { in: %w[draft completed] }
end

