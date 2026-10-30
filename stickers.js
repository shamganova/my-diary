// Sticker packs.
// Picture packs: Anel made the sheets with an AI image tool, and each sheet was cut into separate stickers
// (stickers/<pack>/01.webp, 02.webp, ...). Emoji packs use the iPad's own emoji.

// [id, name, how many stickers, width on the page (a part of the page width)]
const PICTURE_PACKS = [
  ["watercolor", "Акварель", 30, 0.13],
  ["cats", "Котики", 20, 0.15],
  ["pigeons", "Голуби", 16, 0.17],
  ["chick", "Цыплёнок", 16, 0.14],
  ["toast", "Тостик", 16, 0.14],
  ["smileys", "Смайлики", 16, 0.12],
  ["fruits", "Фрукты", 16, 0.14],
  ["milk", "Молоко", 16, 0.14],
  ["tea", "Чаепитие", 16, 0.15],
  ["bouquets", "Букеты", 16, 0.15],
  ["fish", "Рыбки", 16, 0.16],
  ["space", "Космос", 16, 0.15],
  ["makeup", "Косметика", 16, 0.15],
  ["school", "Учёба", 17, 0.14],
];

const EMOJI_PACKS = [
  { id: "flowers", name: "Цветы", items: "🌸 🌷 🌹 🌻 🌼 💐 🌺 🪷 🍀 🌿 🍃 🌱" },
  { id: "mood", name: "Настроение", items: "😊 😍 🥰 😌 😴 😢 😡 🤩 🥳 😎 🤔 😇" },
  { id: "weather", name: "Погода", items: "☀️ 🌤️ ⛅ ☁️ 🌧️ ⛈️ 🌈 ❄️ ☃️ 🌙 ⭐ ✨" },
  { id: "animals", name: "Зверята", items: "🐱 🐶 🐰 🐻 🐼 🦊 🐨 🐥 🦋 🐝 🐞 🐢" },
  { id: "food", name: "Вкусное", items: "☕ 🧋 🍰 🍩 🍓 🍒 🍑 🍕 🍜 🍣 🍦 🍪" },
  { id: "study", name: "Эмодзи-учёба", items: "📚 ✏️ 📝 💻 🎧 📌 📎 ✅ 💡 🗓️ ⏰ 🎯" },
  { id: "love", name: "Сердечки", items: "💖 💕 💗 💓 💞 💝 ❤️ 🧡 💛 💚 💙 💜" },
];

// Every sticker becomes { src, w } (a picture) or { emoji }
const STICKER_PACKS = [
  ...PICTURE_PACKS.map(([id, name, count, w]) => ({
    id,
    name,
    items: Array.from({ length: count }, (_, i) => ({ src: `stickers/${id}/${String(i + 1).padStart(2, "0")}.webp`, w })),
  })),
  ...EMOJI_PACKS.map((pack) => ({ id: pack.id, name: pack.name, items: pack.items.split(" ").map((emoji) => ({ emoji })) })),
];

const PICTURE_PACK_IDS = PICTURE_PACKS.map(([id]) => id);
