class OrderMailer < ApplicationMailer
  def transfer_instructions(order)
    @order = order
    @address = order.address
    @expiration_hours = ENV.fetch("TRANSFER_ORDER_EXPIRATION_HOURS", "24")
    @transfer_data = {
      bank_name: ENV.fetch("TRANSFER_BANK_NAME", "Banco de Chile"),
      account_name: ENV.fetch("TRANSFER_ACCOUNT_NAME", "SweetNest SpA"),
      account_type: ENV.fetch("TRANSFER_ACCOUNT_TYPE", "Cuenta Corriente"),
      account_number: ENV.fetch("TRANSFER_ACCOUNT_NUMBER", "0000000000"),
      rut: ENV.fetch("TRANSFER_RUT", "76.123.456-7"),
      email: ENV.fetch("TRANSFER_EMAIL", "pagos@sweetnest.cl")
    }

    mail(
      to: @address.email,
      subject: "Datos de transferencia - Pedido #{@order.order_number}"
    )
  end
end
