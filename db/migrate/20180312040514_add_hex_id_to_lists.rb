class AddHexIdToLists < ActiveRecord::Migration[5.0]
  def change
    add_column :lists, :hex_id, :string
    add_index :lists, :hex_id, unique: true
  end
end
