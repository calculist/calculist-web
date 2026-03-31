# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2018_03_12_040514) do
  create_table "beta_accesses", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.string "code"
    t.datetime "claimed_at", precision: nil
    t.integer "claimed_by"
    t.string "notes"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["code"], name: "index_beta_accesses_on_code", unique: true
  end

  create_table "items", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.string "guid"
    t.string "parent_guid"
    t.integer "list_id"
    t.text "text"
    t.boolean "is_deleted"
    t.boolean "is_collapsed"
    t.boolean "is_top_item"
    t.float "sort_order"
    t.integer "list_update_id"
    t.integer "initial_list_update_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["guid"], name: "index_items_on_guid", unique: true
    t.index ["initial_list_update_id"], name: "index_items_on_initial_list_update_id"
    t.index ["list_id", "is_deleted", "sort_order"], name: "index_items_on_list_id_and_is_deleted_and_sort_order"
    t.index ["list_id"], name: "index_items_on_list_id"
    t.index ["list_update_id"], name: "index_items_on_list_update_id"
    t.index ["parent_guid"], name: "index_items_on_parent_guid"
  end

  create_table "list_shares", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.integer "list_id", null: false
    t.integer "user_id", null: false
    t.integer "shared_by", null: false
    t.string "access_type", default: "read_only", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["list_id", "user_id"], name: "index_list_shares_on_list_id_and_user_id", unique: true
  end

  create_table "lists", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.string "title"
    t.integer "user_id"
    t.integer "update_count"
    t.string "handle"
    t.string "list_type"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "hex_id"
    t.index ["handle"], name: "index_lists_on_handle"
    t.index ["hex_id"], name: "index_lists_on_hex_id", unique: true
  end

  create_table "users", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "username", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at", precision: nil
    t.datetime "remember_created_at", precision: nil
    t.string "confirmation_token"
    t.datetime "confirmed_at", precision: nil
    t.datetime "confirmation_sent_at", precision: nil
    t.string "unconfirmed_email"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
