Rails.application.routes.draw do
  root to: "gift_boxes#new"

  resources :candies, only: [:index]
  resources :orders, only: [:create]

  namespace :admin do
    resources :orders, only: [:index, :show, :update]
  end
end
