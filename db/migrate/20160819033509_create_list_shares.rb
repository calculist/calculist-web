class CreateListShares < ActiveRecord::Migration[5.0]
  def change
    create_table :list_shares do |t|
      t.integer  :list_id,                           null: false
      t.integer  :user_id,                           null: false
      t.integer  :shared_by,                         null: false
      t.string   :access_type, default: "read_only", null: false

      t.timestamps null: false
    end

    add_index :list_shares, [:list_id, :user_id], unique: true
  end
end
