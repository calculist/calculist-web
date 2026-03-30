require 'rails_helper'

RSpec.describe 'Lists API', type: :request do
  let(:user) { create_user(username: 'listowner') }
  let(:other_user) { create_user(username: 'otheruser') }
  let(:list) { create_list(user: user) }

  before do
    # Create a tree for the list
    @top = create_item(list: list, text: 'Root', is_top_item: true)
    @child = create_item(list: list, text: 'Child', parent_guid: @top.guid, sort_order: 100.0)
  end

  describe 'GET /lists/:id' do
    it 'requires authentication' do
      get "/lists/#{list.id}"
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'returns list content as JSON for owner' do
      sign_in user
      get "/lists/#{list.id}", headers: { 'Accept' => 'application/json' }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['text']).to eq('Root')
      expect(json['items']).to be_an(Array)
    end

    it 'denies access for unauthorized user' do
      sign_in other_user
      # render_403 has a bug — uses `message:` which isn't a valid render option,
      # causing MissingTemplate. This documents the existing behavior.
      expect {
        get "/lists/#{list.id}"
      }.to raise_error(ActionView::MissingTemplate)
    end

    it 'allows access for shared user with read_only' do
      ListShare.create!(list_id: list.id, user_id: other_user.id,
                          shared_by: user.id, access_type: 'read_only')
      sign_in other_user
      get "/lists/#{list.id}", headers: { 'Accept' => 'application/json' }
      expect(response).to have_http_status(:ok)
    end

    context 'with last_save parameter' do
      it 'returns delta changes' do
        sign_in user
        get "/lists/#{list.id}", params: { last_save: 0 }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json).to have_key('last_save')
        expect(json).to have_key('new_items')
        expect(json).to have_key('updated_items')
      end
    end
  end

  describe 'PUT /lists/:id' do
    it 'requires authentication' do
      put "/lists/#{list.id}", params: { title: 'New Title' }
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'updates list title' do
      sign_in user
      put "/lists/#{list.id}", params: { title: 'Updated Title' }
      expect(response).to have_http_status(:ok)
      list.reload
      expect(list.title).to eq('Updated Title')
    end

    it 'denies write for unauthorized user' do
      sign_in other_user
      expect {
        put "/lists/#{list.id}", params: { title: 'Hacked' }
      }.to raise_error(ActionView::MissingTemplate)
    end

    it 'allows write for read_write shared user' do
      ListShare.create!(list_id: list.id, user_id: other_user.id,
                          shared_by: user.id, access_type: 'read_write')
      sign_in other_user
      put "/lists/#{list.id}", params: { title: 'Shared Update' }
      expect(response).to have_http_status(:ok)
    end

    it 'does not allow write for read_only shared user' do
      ListShare.create!(list_id: list.id, user_id: other_user.id,
                          shared_by: user.id, access_type: 'read_only')
      sign_in other_user
      expect {
        put "/lists/#{list.id}", params: { title: 'Should Fail' }
      }.to raise_error(ActionView::MissingTemplate)
    end

    it 'increments update_count' do
      sign_in user
      old_count = list.update_count || 0
      put "/lists/#{list.id}", params: { title: 'Update' }
      list.reload
      expect(list.update_count).to eq(old_count + 1)
    end

    it 'processes item changes' do
      sign_in user
      new_guid = SecureRandom.uuid
      put "/lists/#{list.id}", params: {
        changes: [
          { guid: new_guid, text: 'New Item', parent_guid: @top.guid,
            sort_order: 300.0, collapsed: 0 }
        ]
      }
      expect(response).to have_http_status(:ok)
      expect(Item.find_by(guid: new_guid)).to be_present
    end

    it 'returns last_save in response' do
      sign_in user
      put "/lists/#{list.id}", params: { title: 'Test' }
      json = JSON.parse(response.body)
      expect(json).to have_key('last_save')
    end
  end

  describe 'DELETE /lists/:id' do
    it 'requires authentication' do
      delete "/lists/#{list.id}"
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'deletes the list for owner' do
      sign_in user
      delete "/lists/#{list.id}"
      expect(response).to have_http_status(:ok)
      expect(List.find_by(id: list.id)).to be_nil
    end

    it 'returns 403 for non-owner' do
      sign_in other_user
      delete "/lists/#{list.id}"
      expect(response).to have_http_status(:forbidden)
    end

    it 'prevents deletion of user_primary lists' do
      primary = user.primary_list
      sign_in user
      delete "/lists/#{primary.id}"
      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)
      expect(json['message']).to include('cannot be deleted')
    end

    it 'prevents deletion of welcome lists' do
      welcome = user.welcome_list
      sign_in user
      delete "/lists/#{welcome.id}"
      expect(response).to have_http_status(:forbidden)
    end

    it 'prevents deletion of user_preferences lists' do
      prefs = user.preferences
      sign_in user
      delete "/lists/#{prefs.id}"
      expect(response).to have_http_status(:forbidden)
    end
  end
end
