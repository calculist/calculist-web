class CreateLists < ActiveRecord::Migration[5.0]
  def change
    create_table :lists do |t|
      t.string   :title
      t.integer  :user_id
      t.integer  :update_count
      t.string   :handle
      t.string   :list_type

      t.timestamps null: false
    end

    add_index :lists, :handle
  end
end
