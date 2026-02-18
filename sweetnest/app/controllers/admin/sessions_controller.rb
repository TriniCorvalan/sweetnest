# frozen_string_literal: true

module Admin
  class SessionsController < ApplicationController
    skip_before_action :verify_authenticity_token, only: [:logout]

    # Devuelve 401 para que el navegador descarte las credenciales de HTTP Basic.
    # El enlace "Cerrar sesión" debe apuntar a una URL con usuario "logout@" (ej. http://logout@host/admin/logout).
    def logout
      response.headers["WWW-Authenticate"] = %(Basic realm="Admin")
      render "admin/sessions/logout", status: :unauthorized, layout: "application"
    end
  end
end
