require 'rails_helper'

RSpec.describe List, type: :model do
  let(:user) { create_user }

  describe 'validations' do
    it 'is valid with required attributes' do
      list = List.new(handle: 'mylist', hex_id: SecureRandom.hex(4), user_id: user.id)
      expect(list).to be_valid
    end

    it 'requires handle' do
      list = List.new(hex_id: SecureRandom.hex(4), user_id: user.id)
      # handle gets set by default_values, so explicitly set it to nil after
      list.handle = nil
      list.hex_id = 'abc'
      expect(list).not_to be_valid
      expect(list.errors[:handle]).to be_present
    end

    it 'requires hex_id' do
      list = List.new(user_id: user.id)
      list.handle = 'test'
      list.hex_id = nil
      expect(list).not_to be_valid
      expect(list.errors[:hex_id]).to be_present
    end

    it 'validates list_type inclusion' do
      list = List.new(handle: 'test', hex_id: SecureRandom.hex(4), user_id: user.id, list_type: 'invalid')
      expect(list).not_to be_valid
      expect(list.errors[:list_type]).to be_present
    end

    it 'allows nil list_type' do
      list = List.new(handle: 'test', hex_id: SecureRandom.hex(4), user_id: user.id, list_type: nil)
      expect(list).to be_valid
    end

    %w[user_preferences user_primary welcome].each do |valid_type|
      it "allows list_type '#{valid_type}'" do
        list = List.new(handle: 'test', hex_id: SecureRandom.hex(4), user_id: user.id, list_type: valid_type)
        expect(list).to be_valid
      end
    end
  end

  describe '#default_values' do
    it 'sets title to Untitled List if blank' do
      list = create_list(user: user, title: nil)
      expect(list.title).to eq('Untitled List')
    end

    it 'sets hex_id if blank' do
      list = List.new(user_id: user.id, handle: 'test')
      list.default_values
      expect(list.hex_id).to be_present
    end

    it 'sets handle to hex_id if blank' do
      list = List.new(user_id: user.id)
      list.default_values
      expect(list.handle).to eq(list.hex_id)
    end

    it 'sets update_count to 0 if blank' do
      list = List.new(user_id: user.id, handle: 'test', hex_id: 'abc')
      list.default_values
      expect(list.update_count).to eq(0)
    end

    it 'does not overwrite existing values' do
      list = List.new(user_id: user.id, title: 'My List', handle: 'myhandle',
                       hex_id: 'myhex', update_count: 5)
      list.default_values
      expect(list.title).to eq('My List')
      expect(list.handle).to eq('myhandle')
      expect(list.hex_id).to eq('myhex')
      expect(list.update_count).to eq(5)
    end
  end

  describe '#is_user_primary?' do
    it 'returns true for user_primary lists' do
      list = create_list(user: user, list_type: 'user_primary')
      expect(list.is_user_primary?).to be true
    end

    it 'returns false for other list types' do
      list = create_list(user: user)
      expect(list.is_user_primary?).to be false
    end
  end

  describe '#is_user_preferences?' do
    it 'returns true for user_preferences lists' do
      list = create_list(user: user, list_type: 'user_preferences')
      expect(list.is_user_preferences?).to be true
    end

    it 'returns false for other list types' do
      list = create_list(user: user)
      expect(list.is_user_preferences?).to be false
    end
  end

  describe '#content' do
    it 'returns tree structure via ItemManager' do
      list = create_list(user: user)
      top = create_item(list: list, text: 'Root', is_top_item: true)
      child = create_item(list: list, text: 'Child', parent_guid: top.guid, sort_order: 100.0)

      content = list.content
      expect(content['text']).to eq('Root')
      expect(content['guid']).to eq(top.guid)
      expect(content['items'].length).to eq(1)
      expect(content['items'][0]['text']).to eq('Child')
    end
  end

  describe 'associations' do
    it 'has many items' do
      list = create_list(user: user)
      create_item(list: list, is_top_item: true)
      expect(list.items.count).to eq(1)
    end

    it 'destroys items when destroyed' do
      list = create_list(user: user)
      create_item(list: list, is_top_item: true)
      list.destroy!
      expect(Item.where(list_id: list.id).count).to eq(0)
    end

    it 'belongs to user' do
      list = create_list(user: user)
      expect(list.user).to eq(user)
    end
  end
end
