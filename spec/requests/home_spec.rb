require 'rails_helper'

RSpec.describe 'Home', type: :request do
  describe 'GET /' do
    it 'redirects unauthenticated users to login' do
      get '/'
      expect(response).to be_redirect
      expect(response.location).to include('login')
    end

    it 'renders homepage for authenticated users' do
      user = create_user
      sign_in user
      get '/'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /home' do
    it 'requires authentication' do
      get '/home'
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'renders for authenticated users' do
      user = create_user
      sign_in user
      get '/home'
      expect(response).to have_http_status(:ok)
    end
  end
end
