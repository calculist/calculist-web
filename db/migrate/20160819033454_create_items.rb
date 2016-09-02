class CreateItems < ActiveRecord::Migration[5.0]
  def change
    create_table :items do |t|
      t.string   :guid
      t.string   :parent_guid
      t.integer  :list_id
      t.text     :text
      t.boolean  :is_deleted
      t.boolean  :is_collapsed
      t.boolean  :is_top_item
      t.float    :sort_order
      t.integer  :list_update_id
      t.integer  :initial_list_update_id

      t.timestamps null: false
    end

    add_index :items, :guid, :unique => true
    add_index :items, :initial_list_update_id
    add_index :items, :list_id
    add_index :items, :list_update_id
    add_index :items, :parent_guid
  end
end
