# frozen_string_literal: true

class Candy < ApplicationRecord
  SIZE_CATEGORIES = %w[small medium large].freeze

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :size_category, presence: true, inclusion: { in: SIZE_CATEGORIES }
  validates :color_hex, presence: true
  validates :stock, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  validate :emoji_or_image_present
  validate :allowed_levels_are_valid

  def allowed_on_level?(level_number)
    levels = allowed_levels || []
    return true if levels.empty?

    levels.include?(level_number.to_i)
  end

  private

  def emoji_or_image_present
    if emoji.to_s.strip.empty? && image_url.to_s.strip.empty?
      errors.add(:base, "Debes definir un emoji o una imagen para el dulce")
    end
  end

  def allowed_levels_are_valid
    return if allowed_levels.blank?

    invalid = allowed_levels.map(&:to_i).uniq - [1, 2, 3]
    errors.add(:allowed_levels, "solo puede incluir 1, 2 y/o 3") if invalid.any?
  end
end

