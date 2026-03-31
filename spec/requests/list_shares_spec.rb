require 'rails_helper'

RSpec.describe 'List Shares', type: :request do
  let(:owner) { create_user(username: 'shareowner') }
  let(:shared_user) { create_user(username: 'sharerecip') }
  let(:list) { create_list(user: owner) }

  describe 'GET /lists/:list_id/list_shares' do
    it 'requires authentication' do
      get "/lists/#{list.id}/list_shares"
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'returns shares for list owner' do
      ListShare.create!(list_id: list.id, user_id: shared_user.id,
                          shared_by: owner.id, access_type: 'read_only')
      sign_in owner
      get "/lists/#{list.id}/list_shares"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['username']).to eq('sharerecip')
    end

    it 'does not allow non-owner to list shares' do
      sign_in shared_user
      get "/lists/#{list.id}/list_shares"
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /lists/:list_id/list_shares' do
    it 'creates a share for the list' do
      sign_in owner
      post "/lists/#{list.id}/list_shares", params: {
        usernames: [shared_user.username],
        access_type: 'read_write'
      }
      expect(response).to have_http_status(:ok)
      expect(ListShare.where(list_id: list.id, user_id: shared_user.id).count).to eq(1)
    end

    it 'does not allow sharing user_primary lists' do
      primary = owner.primary_list
      sign_in owner
      post "/lists/#{primary.id}/list_shares", params: {
        usernames: [shared_user.username],
        access_type: 'read_write'
      }
      expect(ListShare.where(list_id: primary.id).count).to eq(0)
    end

    it 'does not allow sharing user_preferences lists' do
      prefs = owner.preferences
      sign_in owner
      post "/lists/#{prefs.id}/list_shares", params: {
        usernames: [shared_user.username],
        access_type: 'read_write'
      }
      expect(ListShare.where(list_id: prefs.id).count).to eq(0)
    end

    it 'does not duplicate existing shares' do
      ListShare.create!(list_id: list.id, user_id: shared_user.id,
                          shared_by: owner.id, access_type: 'read_only')
      sign_in owner
      post "/lists/#{list.id}/list_shares", params: {
        usernames: [shared_user.username],
        access_type: 'read_write'
      }
      expect(ListShare.where(list_id: list.id, user_id: shared_user.id).count).to eq(1)
    end
  end

  describe 'DELETE /lists/:list_id/list_shares/:id' do
    it 'deletes a share' do
      share = ListShare.create!(list_id: list.id, user_id: shared_user.id,
                                  shared_by: owner.id, access_type: 'read_only')
      sign_in owner
      delete "/lists/#{list.id}/list_shares/#{share.id}"
      expect(response).to have_http_status(:ok)
      expect(ListShare.find_by(id: share.id)).to be_nil
    end
  end
end
