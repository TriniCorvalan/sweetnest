# frozen_string_literal: true

Candy.destroy_all

candies = [
  # small
  { id: 1, name: "Gummy Bears", price: 2.99, emoji: "🍬", color_hex: "#ff6b9d", size_category: "small", preview_size: 0.30 },
  { id: 2, name: "Chocolate Kisses", price: 3.49, emoji: "🍫", color_hex: "#8b4513", size_category: "small", preview_size: 0.25 },
  { id: 3, name: "Jelly Beans", price: 2.79, emoji: "🍬", color_hex: "#ff9f43", size_category: "small", preview_size: 0.35 },

  # medium
  { id: 4, name: "Lollipop", price: 1.99, emoji: "🍭", color_hex: "#ff6b9d", size_category: "medium", preview_size: 0.60 },
  { id: 5, name: "Caramel Chew", price: 2.49, emoji: "🍮", color_hex: "#f4a261", size_category: "medium", preview_size: 0.55 },
  { id: 6, name: "Peanut Butter Cup", price: 3.29, emoji: "🥜", color_hex: "#d00000", size_category: "medium", preview_size: 0.65 },

  # large
  { id: 7, name: "Candy Bar", price: 4.99, emoji: "🍫", color_hex: "#2d1b69", size_category: "large", preview_size: 1.00 },
  { id: 8, name: "Gourmet Truffle", price: 5.99, emoji: "🍫", color_hex: "#8338ec", size_category: "large", preview_size: 0.90 },
  { id: 9, name: "Fruit Drop", price: 4.49, emoji: "🍬", color_hex: "#06d6a0", size_category: "large", preview_size: 0.95 }
]

candies.each do |attrs|
  Candy.create!(attrs)
end

