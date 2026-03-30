require 'rails_helper'

RSpec.describe Item, type: :model do
  let(:user) { create_user }
  let(:list) { create_list(user: user) }

  describe 'validations' do
    it 'is valid with all required attributes' do
      item = build_valid_item(list)
      expect(item).to be_valid
    end

    it 'requires list_id' do
      item = Item.new(guid: SecureRandom.uuid, parent_guid: 'abc', sort_order: 1.0,
                       list_update_id: 0, initial_list_update_id: 0)
      expect(item).not_to be_valid
      expect(item.errors[:list_id]).to be_present
    end

    it 'requires guid' do
      item = Item.new(list_id: list.id, parent_guid: 'abc', sort_order: 1.0,
                       list_update_id: 0, initial_list_update_id: 0)
      expect(item).not_to be_valid
      expect(item.errors[:guid]).to be_present
    end

    it 'requires parent_guid for non-top items' do
      item = Item.new(list_id: list.id, guid: SecureRandom.uuid, sort_order: 1.0,
                       list_update_id: 0, initial_list_update_id: 0, is_top_item: false)
      expect(item).not_to be_valid
      expect(item.errors[:parent_guid]).to be_present
    end

    it 'does not require parent_guid for top items' do
      item = Item.new(list_id: list.id, guid: SecureRandom.uuid, sort_order: 1.0,
                       list_update_id: 0, initial_list_update_id: 0, is_top_item: true)
      expect(item).to be_valid
    end

    it 'requires sort_order' do
      item = Item.new(list_id: list.id, guid: SecureRandom.uuid, parent_guid: 'abc',
                       list_update_id: 0, initial_list_update_id: 0)
      expect(item).not_to be_valid
      expect(item.errors[:sort_order]).to be_present
    end

    it 'requires list_update_id' do
      item = Item.new(list_id: list.id, guid: SecureRandom.uuid, parent_guid: 'abc',
                       sort_order: 1.0, initial_list_update_id: 0)
      expect(item).not_to be_valid
      expect(item.errors[:list_update_id]).to be_present
    end

    it 'enforces unique guid' do
      guid = SecureRandom.uuid
      Item.create!(list_id: list.id, guid: guid, parent_guid: 'abc', sort_order: 1.0,
                    list_update_id: 0, initial_list_update_id: 0)
      duplicate = Item.new(list_id: list.id, guid: guid, parent_guid: 'abc', sort_order: 2.0,
                            list_update_id: 0, initial_list_update_id: 0)
      expect { duplicate.save! }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe '#main_attributes_hash' do
    it 'returns the expected keys' do
      item = create_item(list: list, text: 'hello', is_top_item: true)
      hash = item.main_attributes_hash
      expect(hash.keys).to match_array([:guid, :text, :is_collapsed, :is_deleted, :parent_guid, :sort_order])
      expect(hash[:text]).to eq('hello')
      expect(hash[:guid]).to eq(item.guid)
    end
  end

  describe '#looks_valid?' do
    it 'returns true for a valid non-top item' do
      top = create_item(list: list, is_top_item: true)
      item = create_item(list: list, parent_guid: top.guid, sort_order: 100.0)
      expect(item.looks_valid?).to be true
    end

    it 'returns true for a valid top item' do
      item = create_item(list: list, is_top_item: true)
      expect(item.parent_guid).to be_nil # top items have nil parent_guid
      expect(item.looks_valid?).to be true
    end

    it 'returns false when list_id is not an integer' do
      item = create_item(list: list, is_top_item: true)
      item.list_id = nil
      expect(item.looks_valid?).to be false
    end
  end

  describe 'belongs_to :list' do
    it 'belongs to a list' do
      item = create_item(list: list, is_top_item: true)
      expect(item.list).to eq(list)
    end
  end

  private

  def build_valid_item(list)
    Item.new(
      list_id: list.id,
      guid: SecureRandom.uuid,
      parent_guid: 'some_parent',
      sort_order: 100.0,
      text: 'test',
      is_collapsed: false,
      is_deleted: false,
      is_top_item: false,
      list_update_id: 0,
      initial_list_update_id: 0
    )
  end
end
