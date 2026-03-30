require 'rails_helper'

RSpec.describe ItemManager do
  let(:user) { create_user }
  let(:list) { create_list(user: user) }

  describe '#initialize' do
    it 'accepts a list_id integer' do
      im = ItemManager.new(list.id)
      expect(im).to be_a(ItemManager)
    end

    it 'accepts a List object' do
      im = ItemManager.new(list)
      expect(im).to be_a(ItemManager)
    end

    it 'raises for unexpected input' do
      expect { ItemManager.new('bad') }.to raise_error(RuntimeError, /unexpected input/)
    end
  end

  describe '#get_tree' do
    it 'creates a top item if list has no items' do
      im = ItemManager.new(list)
      tree = im.get_tree
      expect(tree['text']).to eq(list.title)
      expect(tree['guid']).to be_present
      expect(tree['items']).to eq([])
      expect(list.items.count).to eq(1)
    end

    it 'returns existing tree structure' do
      top, children = create_tree(list: list, root_text: 'Root', children_texts: ['Child 1', 'Child 2'])

      im = ItemManager.new(list)
      tree = im.get_tree

      expect(tree['text']).to eq('Root')
      expect(tree['items'].length).to eq(2)
      expect(tree['items'].map { |i| i['text'] }).to eq(['Child 1', 'Child 2'])
    end

    it 'returns nested tree structure' do
      top = create_item(list: list, text: 'Root', is_top_item: true)
      child = create_item(list: list, text: 'Child', parent_guid: top.guid, sort_order: 100.0)
      grandchild = create_item(list: list, text: 'Grandchild', parent_guid: child.guid, sort_order: 100.0)

      im = ItemManager.new(list)
      tree = im.get_tree

      expect(tree['items'][0]['text']).to eq('Child')
      expect(tree['items'][0]['items'][0]['text']).to eq('Grandchild')
    end

    it 'excludes deleted items' do
      top = create_item(list: list, text: 'Root', is_top_item: true)
      create_item(list: list, text: 'Visible', parent_guid: top.guid, sort_order: 100.0)
      create_item(list: list, text: 'Deleted', parent_guid: top.guid, sort_order: 200.0, is_deleted: true)

      im = ItemManager.new(list)
      tree = im.get_tree

      expect(tree['items'].length).to eq(1)
      expect(tree['items'][0]['text']).to eq('Visible')
    end

    it 'preserves sort order' do
      top = create_item(list: list, text: 'Root', is_top_item: true)
      create_item(list: list, text: 'Third', parent_guid: top.guid, sort_order: 300.0)
      create_item(list: list, text: 'First', parent_guid: top.guid, sort_order: 100.0)
      create_item(list: list, text: 'Second', parent_guid: top.guid, sort_order: 200.0)

      im = ItemManager.new(list)
      tree = im.get_tree

      expect(tree['items'].map { |i| i['text'] }).to eq(['First', 'Second', 'Third'])
    end

    it 'raises if no top item found among non-deleted items' do
      # Create only a deleted top item
      create_item(list: list, text: 'Deleted Top', is_top_item: true, is_deleted: true)

      im = ItemManager.new(list)
      expect { im.get_tree }.to raise_error(RuntimeError, /no top item found/)
    end

    it 'handles orphaned items by creating foster items' do
      top = create_item(list: list, text: 'Root', is_top_item: true)
      # Add a real child so children_by_parent_guid[top.guid] is initialized
      create_item(list: list, text: 'Real Child', parent_guid: top.guid, sort_order: 200.0)
      # Create an item whose parent doesn't exist
      create_item(list: list, text: 'Orphan', parent_guid: 'nonexistent_parent', sort_order: 100.0)

      im = ItemManager.new(list)
      tree = im.get_tree

      # Should have a foster item as first child of root
      foster_items = tree['items'].select { |i| i['text'].include?('SYSTEM MESSAGE') }
      expect(foster_items.length).to eq(1)
      # The orphan should be a child of the foster item
      expect(foster_items[0]['items'][0]['text']).to eq('Orphan')
    end
  end

  describe '#create_items_from_tree' do
    it 'creates items from a hash tree' do
      tree = {
        'text' => 'Root',
        'items' => [
          { 'text' => 'Child 1' },
          { 'text' => 'Child 2', 'items' => [
            { 'text' => 'Grandchild' }
          ]}
        ]
      }

      im = ItemManager.new(list)
      im.create_items_from_tree(tree)

      expect(list.items.count).to eq(4) # root + 2 children + 1 grandchild
      top = list.items.where(is_top_item: true).first
      expect(top.text).to eq('Root')

      children = list.items.where(parent_guid: top.guid).order(:sort_order)
      expect(children.map(&:text)).to eq(['Child 1', 'Child 2'])

      grandchild = list.items.where(parent_guid: children.last.guid).first
      expect(grandchild.text).to eq('Grandchild')
    end

    it 'raises if list already has items' do
      create_item(list: list, text: 'Existing', is_top_item: true)

      im = ItemManager.new(list)
      expect {
        im.create_items_from_tree({ 'text' => 'New Root' })
      }.to raise_error(RuntimeError, /already has items/)
    end

    it 'updates list update_count' do
      im = ItemManager.new(list)
      im.create_items_from_tree({ 'text' => 'Root' })
      list.reload
      expect(list.update_count).to eq(1)
    end

    it 'creates items from JSON string' do
      json = '{"text":"Root","items":[{"text":"Child"}]}'

      im = ItemManager.new(list)
      im.create_items_from_tree(json)

      expect(list.items.count).to eq(2)
    end
  end

  describe '#update_items' do
    let!(:top) { create_item(list: list, text: 'Root', is_top_item: true) }
    let!(:child1) { create_item(list: list, text: 'Child 1', parent_guid: top.guid, sort_order: 100.0) }
    let!(:child2) { create_item(list: list, text: 'Child 2', parent_guid: top.guid, sort_order: 200.0) }

    it 'updates existing item text' do
      im = ItemManager.new(list)
      im.update_items([
        { guid: child1.guid, text: 'Updated Child 1', parent_guid: top.guid, sort_order: 100.0 }
      ], 1)

      child1.reload
      expect(child1.text).to eq('Updated Child 1')
    end

    it 'updates item collapsed state' do
      im = ItemManager.new(list)
      im.update_items([
        { guid: child1.guid, is_collapsed: true, parent_guid: top.guid, sort_order: 100.0 }
      ], 1)

      child1.reload
      expect(child1.is_collapsed).to be true
    end

    it 'marks items as deleted' do
      im = ItemManager.new(list)
      im.update_items([
        { guid: child1.guid, is_deleted: true, parent_guid: top.guid, sort_order: 100.0 }
      ], 1)

      child1.reload
      expect(child1.is_deleted).to be true
    end

    it 'creates new items' do
      new_guid = SecureRandom.uuid
      im = ItemManager.new(list)
      im.update_items([
        { guid: new_guid, text: 'New Child', parent_guid: top.guid, sort_order: 300.0, collapsed: false }
      ], 1)

      new_item = Item.find_by(guid: new_guid)
      expect(new_item).to be_present
      expect(new_item.text).to eq('New Child')
      expect(new_item.list_id).to eq(list.id)
    end

    it 'handles mixed creates and updates' do
      new_guid = SecureRandom.uuid
      im = ItemManager.new(list)
      im.update_items([
        { guid: child1.guid, text: 'Updated', parent_guid: top.guid, sort_order: 100.0 },
        { guid: new_guid, text: 'Brand New', parent_guid: top.guid, sort_order: 300.0, collapsed: false }
      ], 1)

      child1.reload
      expect(child1.text).to eq('Updated')
      expect(Item.find_by(guid: new_guid).text).to eq('Brand New')
    end

    it 'skips items with do_not_save guid prefix' do
      im = ItemManager.new(list)
      im.update_items([
        { guid: 'do_not_save1', text: 'Should Skip', parent_guid: top.guid, sort_order: 300.0, collapsed: false }
      ], 1)

      expect(Item.find_by(guid: 'do_not_save1')).to be_nil
    end

    it 'updates list_update_id on modified items' do
      im = ItemManager.new(list)
      im.update_items([
        { guid: child1.guid, text: 'Updated', parent_guid: top.guid, sort_order: 100.0 }
      ], 5)

      child1.reload
      expect(child1.list_update_id).to eq(5)
    end

    it 'handles reordering items' do
      im = ItemManager.new(list)
      im.update_items([
        { guid: child1.guid, sort_order: 200.0, parent_guid: top.guid },
        { guid: child2.guid, sort_order: 100.0, parent_guid: top.guid }
      ], 1)

      child1.reload
      child2.reload
      expect(child1.sort_order).to eq(200.0)
      expect(child2.sort_order).to eq(100.0)
    end
  end

  describe '#get_recently_deleted' do
    it 'returns recently deleted items grouped by list_update_id' do
      top = create_item(list: list, text: 'Root', is_top_item: true)
      create_item(list: list, text: 'Deleted 1', parent_guid: top.guid,
                   sort_order: 100.0, is_deleted: true)

      im = ItemManager.new(list)
      result = im.get_recently_deleted

      expect(result).to be_an(Array)
      expect(result.length).to eq(1)
      expect(result.first).to have_key(:luid)
      expect(result.first).to have_key(:updated_at)
      expect(result.first).to have_key(:items)
      expect(result.first[:items].first['text']).to eq('Deleted 1')
    end

    it 'returns empty array when no deleted items' do
      create_item(list: list, text: 'Root', is_top_item: true)

      im = ItemManager.new(list)
      result = im.get_recently_deleted
      expect(result).to eq([])
    end
  end

  describe '#generate_tree (via get_tree)' do
    it 'includes all expected keys in tree nodes' do
      top = create_item(list: list, text: 'Root', is_top_item: true)
      im = ItemManager.new(list)
      tree = im.get_tree

      expect(tree).to have_key('text')
      expect(tree).to have_key('guid')
      expect(tree).to have_key('collapsed')
      expect(tree).to have_key('sort_order')
      expect(tree).to have_key('items')
    end

    it 'preserves collapsed state' do
      top = create_item(list: list, text: 'Root', is_top_item: true)
      child = Item.create!(
        guid: SecureRandom.uuid, list_id: list.id, parent_guid: top.guid,
        sort_order: 100.0, text: 'Collapsed Child', is_collapsed: true,
        is_deleted: false, is_top_item: false, list_update_id: 0, initial_list_update_id: 0
      )

      im = ItemManager.new(list)
      tree = im.get_tree

      expect(tree['items'][0]['collapsed']).to be true
    end
  end

  describe 'round-trip: create then retrieve' do
    it 'can create a tree and get it back identically' do
      tree_input = {
        'text' => 'My Document',
        'items' => [
          { 'text' => 'Section 1', 'items' => [
            { 'text' => 'Item A' },
            { 'text' => 'Item B' }
          ]},
          { 'text' => 'Section 2' }
        ]
      }

      im = ItemManager.new(list)
      im.create_items_from_tree(tree_input)

      tree_output = im.get_tree
      expect(tree_output['text']).to eq('My Document')
      expect(tree_output['items'].length).to eq(2)
      expect(tree_output['items'][0]['text']).to eq('Section 1')
      expect(tree_output['items'][0]['items'].length).to eq(2)
      expect(tree_output['items'][0]['items'].map { |i| i['text'] }).to eq(['Item A', 'Item B'])
      expect(tree_output['items'][1]['text']).to eq('Section 2')
    end
  end
end
