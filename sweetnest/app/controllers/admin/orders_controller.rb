module Admin
  class OrdersController < BaseController
    DEFAULT_STATUSES = %w[created in_progress shipped delivered cancelled].freeze

    before_action :authenticate_admin!
    before_action :set_order, only: [:show, :update]

    helper_method :available_statuses, :order_total, :translated_order_status

    def index
      @status_filter = params[:status].presence
      scope = Order.includes(:address, gift_box: { box_levels: { wall_candies: :candy } }).order(created_at: :desc)
      @orders = @status_filter.present? ? scope.where(status: @status_filter) : scope
    end

    def show
      @gift_box = @order.gift_box
      @box_levels = @gift_box.box_levels.includes(wall_candies: :candy).order(:level_number)
      @address = @order.address
    end

    def update
      next_status = params[:status].to_s
      unless available_statuses.include?(next_status)
        redirect_to admin_order_path(@order), alert: I18n.t("admin.orders.messages.invalid_status")
        return
      end

      @order.update!(status: next_status)
      redirect_to admin_order_path(@order), notice: I18n.t(
        "admin.orders.messages.status_updated",
        status: translated_order_status(next_status)
      )
    rescue ActiveRecord::RecordInvalid => e
      redirect_to admin_order_path(@order), alert: e.record.errors.full_messages.to_sentence
    end

    private

    def set_order
      @order = Order.includes(:address, gift_box: { box_levels: { wall_candies: :candy } }).find(params[:id])
    end

    def available_statuses
      @available_statuses ||= (DEFAULT_STATUSES + Order.distinct.pluck(:status)).compact.uniq
    end

    def translated_order_status(status)
      I18n.t("admin.orders.statuses.#{status}", default: status.to_s.humanize)
    end

    def order_total(order)
      gift_box = order.gift_box
      return 0 if gift_box.nil?

      total = gift_box.base_price.to_f
      gift_box.box_levels.each do |level|
        level.wall_candies.each do |wall_candy|
          total += wall_candy.quantity.to_i * wall_candy.candy.price.to_f
        end
      end
      total
    end
  end
end
