# frozen_string_literal: true

module Admin
  class BaseController < ApplicationController
    private

    def authenticate_admin!
      expected_username = ENV["ADMIN_USERNAME"]
      expected_password = ENV["ADMIN_PASSWORD"]

      if expected_username.blank? || expected_password.blank?
        if Rails.env.production?
          Rails.logger.error("Admin auth no configurada: faltan ADMIN_USERNAME/ADMIN_PASSWORD")
          render plain: "Admin auth no configurada", status: :service_unavailable
          return
        end

        # Fallback local para desarrollo/test cuando no se definieron variables.
        expected_username = "admin"
        expected_password = "admin123"
      end

      authenticate_or_request_with_http_basic("Admin") do |username, password|
        secure_compare(username, expected_username) && secure_compare(password, expected_password)
      end
    end

    def secure_compare(left, right)
      return false if left.blank? || right.blank?

      left_hash = ::Digest::SHA256.hexdigest(left)
      right_hash = ::Digest::SHA256.hexdigest(right)
      ActiveSupport::SecurityUtils.secure_compare(left_hash, right_hash)
    end
  end
end

