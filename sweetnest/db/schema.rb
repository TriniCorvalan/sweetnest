# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2026_02_17_000006) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "addresses", force: :cascade do |t|
    t.bigint "order_id", null: false
    t.string "full_name", null: false
    t.string "street", null: false
    t.string "unit"
    t.string "city", null: false
    t.string "zip", null: false
    t.text "special_instructions"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["order_id"], name: "index_addresses_on_order_id"
  end

  create_table "box_levels", force: :cascade do |t|
    t.bigint "gift_box_id", null: false
    t.integer "level_number", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["gift_box_id", "level_number"], name: "index_box_levels_on_gift_box_id_and_level_number", unique: true
    t.index ["gift_box_id"], name: "index_box_levels_on_gift_box_id"
  end

  create_table "candies", force: :cascade do |t|
    t.string "name", null: false
    t.decimal "price", precision: 8, scale: 2, null: false
    t.string "size_category", null: false
    t.string "emoji", null: false
    t.string "color_hex", null: false
    t.decimal "preview_size", precision: 4, scale: 2, default: "0.5", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["size_category"], name: "index_candies_on_size_category"
  end

  create_table "gift_boxes", force: :cascade do |t|
    t.integer "levels", null: false
    t.decimal "base_price", precision: 8, scale: 2, default: "29.99", null: false
    t.string "status", default: "draft", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["status"], name: "index_gift_boxes_on_status"
  end

  create_table "orders", force: :cascade do |t|
    t.bigint "gift_box_id", null: false
    t.string "status", null: false
    t.string "order_number", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["gift_box_id"], name: "index_orders_on_gift_box_id"
    t.index ["order_number"], name: "index_orders_on_order_number", unique: true
  end

  create_table "wall_candies", force: :cascade do |t|
    t.bigint "box_level_id", null: false
    t.integer "wall_position", null: false
    t.bigint "candy_id", null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["box_level_id", "wall_position", "candy_id"], name: "idx_wall_candies_uniqueness", unique: true
    t.index ["box_level_id"], name: "index_wall_candies_on_box_level_id"
    t.index ["candy_id"], name: "index_wall_candies_on_candy_id"
  end

  add_foreign_key "addresses", "orders"
  add_foreign_key "box_levels", "gift_boxes"
  add_foreign_key "orders", "gift_boxes"
  add_foreign_key "wall_candies", "box_levels"
  add_foreign_key "wall_candies", "candies"
end
