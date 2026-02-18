# frozen_string_literal: true

class Address < ApplicationRecord
  belongs_to :order

  validates :full_name, presence: true
  validates :rut, presence: true
  validates :phone, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :street, presence: true
  validates :region, presence: true
  validates :commune, presence: true
  validates :city, presence: true
  validates :zip, presence: true
end

