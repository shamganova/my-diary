// Sticker packs. For now they are emoji; later we can add packs made of your own PNG pictures,
// like this: { id: "cats", name: "Котики", items: ["stickers/cats/1.png", "stickers/cats/2.png"] }

const STICKER_PACKS = [
  { id: "flowers", name: "Цветы", items: "🌸 🌷 🌹 🌻 🌼 💐 🌺 🪷 🍀 🌿 🍃 🌱" },
  { id: "mood", name: "Настроение", items: "😊 😍 🥰 😌 😴 😢 😡 🤩 🥳 😎 🤔 😇" },
  { id: "weather", name: "Погода", items: "☀️ 🌤️ ⛅ ☁️ 🌧️ ⛈️ 🌈 ❄️ ☃️ 🌙 ⭐ ✨" },
  { id: "animals", name: "Зверята", items: "🐱 🐶 🐰 🐻 🐼 🦊 🐨 🐥 🦋 🐝 🐞 🐢" },
  { id: "food", name: "Вкусное", items: "☕ 🧋 🍰 🍩 🍓 🍒 🍑 🍕 🍜 🍣 🍦 🍪" },
  { id: "study", name: "Учёба", items: "📚 ✏️ 📝 💻 🎧 📌 📎 ✅ 💡 🗓️ ⏰ 🎯" },
  { id: "love", name: "Сердечки", items: "💖 💕 💗 💓 💞 💝 ❤️ 🧡 💛 💚 💙 💜" },
].map((pack) => ({ ...pack, items: typeof pack.items === "string" ? pack.items.split(" ") : pack.items }));
