require 'rails_helper'

RSpec.describe 'List Pages', type: :request do
  let(:user) { create_user(username: 'pageuser') }

  describe 'GET /:username (profile page)' do
    it 'requires authentication' do
      get "/#{user.username}"
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'renders profile page for own user' do
      sign_in user
      get "/#{user.username}"
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for other user profile' do
      other = create_user(username: 'otherpage')
      sign_in user
      get "/#{other.username}"
      expect(response).to have_http_status(:not_found)
    end

    it 'returns 404 for non-existent user' do
      sign_in user
      get '/nonexistent_user'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /:username/:handle (list page)' do
    it 'renders a list page for owner' do
      list = create_list(user: user, handle: 'mylist')
      create_item(list: list, text: 'Root', is_top_item: true)
      sign_in user
      get "/#{user.username}/mylist"
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for non-existent list' do
      sign_in user
      get "/#{user.username}/nonexistent"
      expect(response).to have_http_status(:not_found)
    end

    it 'allows access for shared user' do
      other = create_user(username: 'sharedpageuser')
      list = create_list(user: user, handle: 'sharedlist')
      create_item(list: list, text: 'Root', is_top_item: true)
      ListShare.create!(list_id: list.id, user_id: other.id,
                          shared_by: user.id, access_type: 'read_only')
      sign_in other
      get "/#{user.username}/sharedlist"
      expect(response).to have_http_status(:ok)
    end

    it 'redirects to profile page for user_primary lists' do
      sign_in user
      primary = user.primary_list
      get "/#{user.username}/#{primary.handle}"
      expect(response).to redirect_to(profile_page_path(username: user.username))
    end
  end

  describe 'GET /l/:hex_id (list by hex)' do
    it 'renders list by hex_id for owner' do
      list = create_list(user: user, handle: 'hexlist')
      create_item(list: list, text: 'Root', is_top_item: true)
      sign_in user
      get "/l/#{list.hex_id}"
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for non-existent hex_id' do
      sign_in user
      get '/l/deadbeef'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /list/new (create list)' do
    it 'requires authentication' do
      get '/list/new'
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'creates a new list and redirects' do
      sign_in user
      expect {
        get '/list/new'
      }.to change(List, :count).by(1)
      expect(response).to be_redirect
    end

    it 'creates list with given title' do
      sign_in user
      get '/list/new', params: { title: 'My New List', handle: 'mynewlist' }
      expect(response).to redirect_to(list_page_path(username: user.username, handle: 'mynewlist'))
    end
  end

  describe 'GET /welcome' do
    it 'renders welcome list for authenticated user' do
      sign_in user
      get '/welcome'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /preferences' do
    it 'renders preferences list for authenticated user' do
      sign_in user
      get '/preferences'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /blankpage' do
    it 'renders without authentication' do
      get '/blankpage'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /sample' do
    it 'renders without authentication' do
      get '/sample'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /:username/:handle/deleted' do
    it 'shows recently deleted items for list owner' do
      list = create_list(user: user, handle: 'deltest')
      create_item(list: list, text: 'Root', is_top_item: true)
      sign_in user
      get "/#{user.username}/deltest/deleted"
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for non-owner' do
      other = create_user(username: 'notowner')
      list = create_list(user: user, handle: 'deltest2')
      create_item(list: list, text: 'Root', is_top_item: true)
      sign_in other
      get "/#{user.username}/deltest2/deleted"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'catch-all 404' do
    it 'returns 404 for unknown paths' do
      get '/totally/unknown/path/here'
      expect(response).to have_http_status(:not_found)
    end
  end
end
