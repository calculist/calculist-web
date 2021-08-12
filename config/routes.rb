Rails.application.routes.draw do
  devise_for  :users,
              controllers: { registrations: 'users/registrations' },
              path: '',
              path_names: {
                sign_up: 'join',
                sign_in: 'login',
                sign_out: 'logout',
                edit: 'settings'
              }

  get 'list/new' => 'list_pages#create', as: :new_list
  get 'l/:hex_id' => 'list_pages#show', as: :list_page_by_hex_id

  resources :lists do
    resources :list_shares
  end

  get 'home' => 'home#homepage'
  get 'blankpage' => 'list_pages#blankpage'
  get 'sample' => 'list_pages#sample'

  get 'subscribe' => 'subscriptions#index'
  get 'subscribe/complete_checkout' => 'subscriptions#complete_checkout'
  get 'subscribe/checkout' => 'subscriptions#get_stripe_checkout_session'
  get 'subscribe/manage' => 'subscriptions#manage_subscription', as: :manage_subscription

  get 'welcome' => 'list_pages#show', defaults: { handle: 'welcome' }, as: :welcome_list
  get 'preferences' => 'list_pages#show', defaults: { handle: 'preferences' }, as: :preferences
  get ':username' => 'list_pages#index', as: :profile_page
  get ':username/:handle' => 'list_pages#show', as: :list_page
  get ':username/:handle/deleted' => 'list_pages#show_deleted', as: :list_page_deleted

  root :to => 'home#index'
  get '*path' => 'application#render_404'
end
