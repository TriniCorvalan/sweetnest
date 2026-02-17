# frozen_string_literal: true

class BoxLevel < ApplicationRecord
  belongs_to :gift_box
  has_many :wall_candies, dependent: :destroy

  validates :level_number, presence: true, inclusion: { in: 0..2 }
end

