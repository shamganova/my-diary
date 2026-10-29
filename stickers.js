// Sticker packs. For now they are emoji. A pack can also use pictures (PNG files), like this:
// { id: "cats", name: "Котики", files: ["stickers/cats/1.png", "stickers/cats/2.png"] }

// Every sticker becomes { emoji } or { src, w } (w = its width as a part of the page)
const STICKER_PACKS = [
  { id: "flowers", name: "Цветы", items: "🌸 🌷 🌹 🌻 🌼 💐 🌺 🪷 🍀 🌿 🍃 🌱" },
  { id: "mood", name: "Настроение", items: "😊 😍 🥰 😌 😴 😢 😡 🤩 🥳 😎 🤔 😇" },
  { id: "weather", name: "Погода", items: "☀️ 🌤️ ⛅ ☁️ 🌧️ ⛈️ 🌈 ❄️ ☃️ 🌙 ⭐ ✨" },
  { id: "animals", name: "Зверята", items: "🐱 🐶 🐰 🐻 🐼 🦊 🐨 🐥 🦋 🐝 🐞 🐢" },
  { id: "food", name: "Вкусное", items: "☕ 🧋 🍰 🍩 🍓 🍒 🍑 🍕 🍜 🍣 🍦 🍪" },
  { id: "study", name: "Учёба", items: "📚 ✏️ 📝 💻 🎧 📌 📎 ✅ 💡 🗓️ ⏰ 🎯" },
  { id: "love", name: "Сердечки", items: "💖 💕 💗 💓 💞 💝 ❤️ 🧡 💛 💚 💙 💜" },
].map((pack) => ({
  id: pack.id,
  name: pack.name,
  items: pack.files
    ? pack.files.map((file) => ({ src: file, w: 0.13 }))
    : pack.items.split(" ").map((emoji) => ({ emoji })),
}));
