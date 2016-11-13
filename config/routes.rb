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

  get 'list/new' => 'list_pages#create'

  resources :lists

  get 'blankpage' => 'list_pages#blankpage'

  get ':username' => 'list_pages#index', as: :profile_page
  get ':username/:handle' => 'list_pages#show', as: :list_page
  get ':username/:handle/deleted' => 'list_pages#show_deleted', as: :list_page_deleted

  root :to => 'home#index'
  get '*path' => 'application#render_404'
end
