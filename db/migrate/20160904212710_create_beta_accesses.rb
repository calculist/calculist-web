class CreateBetaAccesses < ActiveRecord::Migration[5.0]
  def change
    create_table :beta_accesses do |t|
      t.string :code
      t.datetime :claimed_at
      t.integer :claimed_by
      t.string :notes

      t.timestamps
    end
    add_index :beta_accesses, :code, unique: true
  end
end
