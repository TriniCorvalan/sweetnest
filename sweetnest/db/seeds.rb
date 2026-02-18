# frozen_string_literal: true

# Orden de limpieza respetando llaves foraneas:
# addresses -> orders
# wall_candies -> box_levels -> gift_boxes
# wall_candies -> candies
Address.delete_all
WallCandy.delete_all
Order.delete_all
BoxLevel.delete_all
GiftBox.delete_all
Candy.delete_all

candies = [
  # small
  { id: 1, name: "Gummy Bears", price: 2.99, emoji: "🍬", color_hex: "#ff6b9d", size_category: "small", preview_size: 0.30, stock: 100, allowed_levels: [] },
  { id: 2, name: "Chocolate Kisses", price: 3.49, emoji: "🍫", color_hex: "#8b4513", size_category: "small", preview_size: 0.25, stock: 0, allowed_levels: [] },
  { id: 3, name: "Jelly Beans", price: 2.79, emoji: "🍬", color_hex: "#ff9f43", size_category: "small", preview_size: 0.35, stock: 50, allowed_levels: [1] },

  # medium
  { id: 4, name: "Lollipop", price: 1.99, emoji: "🍭", color_hex: "#ff6b9d", size_category: "medium", preview_size: 0.60, stock: 75, allowed_levels: [] },
  { id: 5, name: "Caramel Chew", price: 2.49, emoji: "🍮", color_hex: "#f4a261", size_category: "medium", preview_size: 0.55, stock: 30, allowed_levels: [2] },
  { id: 6, name: "Peanut Butter Cup", price: 3.29, emoji: "🥜", color_hex: "#d00000", size_category: "medium", preview_size: 0.65, stock: 10, allowed_levels: [2, 3] },

  # large
  { id: 7, name: "Candy Bar", price: 4.99, emoji: "🍫", color_hex: "#2d1b69", size_category: "large", preview_size: 1.00, stock: 20, allowed_levels: [] },
  { id: 8, name: "Gourmet Truffle", price: 5.99, emoji: "🍫", color_hex: "#8338ec", size_category: "large", preview_size: 0.90, stock: 5, allowed_levels: [3] },
  { id: 9, name: "Fruit Drop", price: 4.49, emoji: "🍬", color_hex: "#06d6a0", size_category: "large", preview_size: 0.95, stock: 0, allowed_levels: [] }
]

candies.each do |attrs|
  Candy.create!(attrs)
end

