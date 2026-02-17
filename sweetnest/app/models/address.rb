# frozen_string_literal: true

class Address < ApplicationRecord
  belongs_to :order

  validates :full_name, presence: true
  validates :street, presence: true
  validates :city, presence: true
  validates :zip, presence: true
end

