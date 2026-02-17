# frozen_string_literal: true

class Order < ApplicationRecord
  belongs_to :gift_box
  has_one :address, dependent: :destroy

  validates :order_number, presence: true, uniqueness: true
  validates :status, presence: true
end

