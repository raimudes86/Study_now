Rails.application.routes.draw do
  get "mypage" => "mypage#index"
  get "login" => "login#index"
  get "realtime" => "realtime#index"

  resources :relationships, only: [ :create ] do
    collection do
      delete "", action: :destroy
      get "followings"
      get "followers"
    end
  end

  resources :timelines, only: [ :new ]
  resources :users, only: [ :index, :new, :create ] do
    collection do
      get "search"
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  root "realtime#index"
end
