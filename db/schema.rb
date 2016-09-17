# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160917205248) do

  create_table "beta_accesses", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "code"
    t.datetime "claimed_at"
    t.integer  "claimed_by"
    t.string   "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_beta_accesses_on_code", unique: true, using: :btree
  end

  create_table "items", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "guid"
    t.string   "parent_guid"
    t.integer  "list_id"
    t.text     "text",                   limit: 65535
    t.boolean  "is_deleted"
    t.boolean  "is_collapsed"
    t.boolean  "is_top_item"
    t.float    "sort_order",             limit: 24
    t.integer  "list_update_id"
    t.integer  "initial_list_update_id"
    t.datetime "created_at",                           null: false
    t.datetime "updated_at",                           null: false
    t.index ["guid"], name: "index_items_on_guid", unique: true, using: :btree
    t.index ["initial_list_update_id"], name: "index_items_on_initial_list_update_id", using: :btree
    t.index ["list_id", "is_deleted", "sort_order"], name: "index_items_on_list_id_and_is_deleted_and_sort_order", using: :btree
    t.index ["list_id"], name: "index_items_on_list_id", using: :btree
    t.index ["list_update_id"], name: "index_items_on_list_update_id", using: :btree
    t.index ["parent_guid"], name: "index_items_on_parent_guid", using: :btree
  end

  create_table "list_shares", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer  "list_id",                           null: false
    t.integer  "user_id",                           null: false
    t.integer  "shared_by",                         null: false
    t.string   "access_type", default: "read_only", null: false
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.index ["list_id", "user_id"], name: "index_list_shares_on_list_id_and_user_id", unique: true, using: :btree
  end

  create_table "lists", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "title"
    t.integer  "user_id"
    t.integer  "update_count"
    t.string   "handle"
    t.string   "list_type"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.index ["handle"], name: "index_lists_on_handle", using: :btree
  end

  create_table "users", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string   "email",                  default: "", null: false
    t.string   "username",               default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
    t.index ["email"], name: "index_users_on_email", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  end

end
