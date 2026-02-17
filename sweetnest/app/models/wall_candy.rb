# frozen_string_literal: true

class WallCandy < ApplicationRecord
  belongs_to :box_level
  belongs_to :candy

  validates :wall_position, presence: true, inclusion: { in: 0..3 }
  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
end

