require 'rails_helper'

RSpec.describe ListShare, type: :model do
  let(:owner) { create_user(username: 'owner') }
  let(:shared_user) { create_user(username: 'shareduser') }
  let(:list) { create_list(user: owner) }

  describe 'validations' do
    it 'is valid with all required attributes' do
      share = ListShare.new(list_id: list.id, user_id: shared_user.id,
                             shared_by: owner.id, access_type: 'read_only')
      expect(share).to be_valid
    end

    it 'requires list_id' do
      share = ListShare.new(user_id: shared_user.id, shared_by: owner.id, access_type: 'read_only')
      expect(share).not_to be_valid
    end

    it 'requires user_id' do
      share = ListShare.new(list_id: list.id, shared_by: owner.id, access_type: 'read_only')
      expect(share).not_to be_valid
    end

    it 'requires shared_by' do
      share = ListShare.new(list_id: list.id, user_id: shared_user.id, access_type: 'read_only')
      expect(share).not_to be_valid
    end

    it 'validates access_type inclusion' do
      share = ListShare.new(list_id: list.id, user_id: shared_user.id,
                             shared_by: owner.id, access_type: 'admin')
      expect(share).not_to be_valid
    end

    it 'allows read_only access_type' do
      share = ListShare.new(list_id: list.id, user_id: shared_user.id,
                             shared_by: owner.id, access_type: 'read_only')
      expect(share).to be_valid
    end

    it 'allows read_write access_type' do
      share = ListShare.new(list_id: list.id, user_id: shared_user.id,
                             shared_by: owner.id, access_type: 'read_write')
      expect(share).to be_valid
    end

    it 'does not allow nil access_type' do
      share = ListShare.new(list_id: list.id, user_id: shared_user.id,
                             shared_by: owner.id, access_type: nil)
      expect(share).not_to be_valid
    end

    it 'enforces unique list_id + user_id' do
      ListShare.create!(list_id: list.id, user_id: shared_user.id,
                          shared_by: owner.id, access_type: 'read_only')
      duplicate = ListShare.new(list_id: list.id, user_id: shared_user.id,
                                 shared_by: owner.id, access_type: 'read_write')
      expect { duplicate.save! }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe 'associations' do
    it 'belongs to user' do
      share = ListShare.create!(list_id: list.id, user_id: shared_user.id,
                                 shared_by: owner.id, access_type: 'read_only')
      expect(share.user).to eq(shared_user)
    end

    it 'belongs to list' do
      share = ListShare.create!(list_id: list.id, user_id: shared_user.id,
                                 shared_by: owner.id, access_type: 'read_only')
      expect(share.list).to eq(list)
    end
  end
end
