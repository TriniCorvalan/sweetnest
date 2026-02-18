# frozen_string_literal: true

module AdminHelper
  # URL con usuario "logout@" para que el navegador descarte las credenciales de HTTP Basic.
  def admin_logout_url
    uri = URI(request.base_url)
    uri.user = "logout"
    uri.path = admin_logout_path
    uri.to_s
  end
end
