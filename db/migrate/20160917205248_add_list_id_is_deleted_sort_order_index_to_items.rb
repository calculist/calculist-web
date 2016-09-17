class AddListIdIsDeletedSortOrderIndexToItems < ActiveRecord::Migration[5.0]
  def change
    add_index :items, [:list_id, :is_deleted, :sort_order]
  end
end
