// Sticker packs.
// Picture packs: Anel made the sheets with an AI image tool, and each sheet was cut into separate stickers
// (stickers/<pack>/01.webp, 02.webp, ...). The seven packs from 2026-11-02 only existed as small pictures,
// so their stickers were made 3 times bigger when they were cut. Emoji packs use the iPad's own emoji.

// [id, name, how many stickers, width on the page (a part of the page width)]
// Removed on 2026-10-31 (Anel didn't like them): toast, tea, space, makeup, school.
// Removed on 2026-11-01: ramen ("Рамен и бабл ти", drawn in code by Claude).
// Removed on 2026-11-02 (Anel's choice): cats, pigeons, chick, fruits, milk.
// Their pictures stay in stickers/, so stickers already put on pages still show.
const PICTURE_PACKS = [
  ["breakfast", "Завтрак", 25, 0.12],
  ["pets", "Питомцы", 28, 0.13],
  ["herbarium", "Гербарий", 24, 0.12],
  ["december", "Декабрь", 20, 0.13],
  ["autumn", "Осень", 20, 0.13],
  ["summer", "Лето", 20, 0.13],
  ["spring", "Весна", 20, 0.13],
  ["watercolor", "Акварель", 30, 0.13],
  ["smileys", "Смайлики", 16, 0.12],
  ["bouquets", "Букеты", 16, 0.15],
  ["fish", "Рыбки", 16, 0.16],
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
