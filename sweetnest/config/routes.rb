Rails.application.routes.draw do
  root to: "gift_boxes#new"

  resources :candies, only: [:index]
  resources :orders, only: [:create]

  namespace :admin do
    get "logout", to: "sessions#logout"
    resources :orders, only: [:index, :show, :update]
    resources :candies, except: [:show]
  end
end
