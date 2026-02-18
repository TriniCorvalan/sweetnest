# frozen_string_literal: true

module Admin
  class CandiesController < BaseController
    before_action :authenticate_admin!
    before_action :set_candy, only: [:edit, :update, :destroy]

    def index
      @candies = Candy.order(:id)
    end

    def new
      @candy = Candy.new(stock: 0, allowed_levels: [])
    end

    def create
      @candy = Candy.new(candy_params)
      if @candy.save
        redirect_to admin_candies_path, notice: "Dulce creado."
      else
        render :new
      end
    end

    def edit; end

    def update
      if @candy.update(candy_params)
        redirect_to admin_candies_path, notice: "Dulce actualizado."
      else
        render :edit
      end
    end

    def destroy
      @candy.destroy!
      redirect_to admin_candies_path, notice: "Dulce eliminado."
    rescue ActiveRecord::InvalidForeignKey
      redirect_to admin_candies_path, alert: "No se puede eliminar: está siendo usado en pedidos."
    end

    private

    def set_candy
      @candy = Candy.find(params[:id])
    end

    def candy_params
      permitted = params.require(:candy).permit(
        :name,
        :price,
        :size_category,
        :emoji,
        :color_hex,
        :preview_size,
        :stock,
        allowed_levels: []
      )
      permitted[:allowed_levels] = Array(permitted[:allowed_levels]).reject(&:blank?).map(&:to_i).uniq.sort
      permitted
    end
  end
end

