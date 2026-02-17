Rails.application.routes.draw do
  root to: "gift_boxes#new"

  resources :candies, only: [:index]
  resources :orders, only: [:create]
end
