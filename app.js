// My Diary, version 1.
// Screens: splash → welcome (first time) or lock (password) → home → notebook.
// All data is saved on this device in IndexedDB (see db.js).

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// ---------- Settings you can change ----------

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

// Notebook covers are pictures (covers/<id>.webp): cloth, leather or denim with one detail.
// The notebook's title is written on top: "ink" is its colour, "kind" says where and how
// (inset = inside stitching or a frame, spine = right of a cloth spine, label = on a paper label,
// gold = gold letters). The first four are the main covers, chosen by Anel.
const COVERS = [
  { id: "stone", bg: "#CECCC5", ink: "#2B2B2A" },
  { id: "denim", bg: "#3E5D7E", ink: "#F1F4F8", kind: "inset" },
  { id: "mustard", bg: "#D3A23F", ink: "#3B2A0E" },
  { id: "raspberry", bg: "#C23C6C", ink: "#FFE9F1", kind: "spine" },
  { id: "salvia", bg: "#A0B19A", ink: "#22301F", kind: "inset" },
  { id: "red", bg: "#B3302A", ink: "#F3E3C0", kind: "gold" },
  { id: "aqua", bg: "#81D8D0", ink: "#0D4A45", kind: "inset" },
  { id: "lavender", bg: "#A598DA", ink: "#231E48" },
  { id: "lemon", bg: "#F2DD6E", ink: "#5A4A0A", kind: "label" },
  { id: "sky", bg: "#78AEDF", ink: "#123A63", kind: "inset" },
  { id: "cobalt", bg: "#2F5BB0", ink: "#FFF3E0", kind: "gold" },
  { id: "ice", bg: "#CFE2F1", ink: "#1D3D5C", kind: "inset" },
];

// Covers that were removed: notebooks that still have one get a similar new cover
const OLD_COVERS = { rose: "raspberry", sage: "salvia", sand: "stone", peach: "raspberry", mint: "aqua", night: "denim" };

function coverLook(id) {
  return COVERS.find((c) => c.id === (OLD_COVERS[id] || id)) || COVERS[0];
}

// The cover picture as a CSS background (the colour shows while the picture loads)
function coverBackground(look) {
  return `${look.bg} url(covers/${look.id}.webp) center / cover`;
}

const TEMPLATES = [
  { id: "lines", name: "Линейка" },
  { id: "grid", name: "Клетка" },
  { id: "dots", name: "Точки" },
  { id: "blank", name: "Пустая" },
];

const PAPERS = ["#ffffff", "#fffaf0", "#fdf0f4", "#eef5fc", "#eff7ec", "#f3f0fb", "#f4f2ee"];  // page colours
const RULES = ["#d5dce6", "#ecc8d5", "#c9dcc0", "#e6d3b3", "#cfc8ee", "#bdbdbd", "#8d8288"];   // line colours

// Page templates: ready layouts drawn on top of the page
const LAYOUTS = [
  { id: "todo", name: "Список дел" },
  { id: "daily", name: "План на день" },
  { id: "weekly", name: "План на неделю" },
  { id: "lecture", name: "Лекция" },
  { id: "cornell", name: "Метод Корнелла" },
  { id: "timetable", name: "Расписание пар" },
  { id: "deadlines", name: "Дедлайны" },
  { id: "habits", name: "Трекер привычек" },
  { id: "mood", name: "Настроение" },
  { id: "gratitude", name: "Благодарность" },
];

function layoutHTML(id) {
  const rows = (n) => '<div class="row"></div>'.repeat(n);
  const numbers = (n) => Array.from({ length: n }, (_, i) => i + 1);

  if (id === "todo") {
    return `<h4>Список дел</h4>${'<div class="row"><span class="box"></span></div>'.repeat(17)}`;
  }
  if (id === "daily") {
    const hours = numbers(16).map((i) => `<div class="row"><span class="time">${i + 6}:00</span></div>`).join("");
    return `<h4>План на день</h4>
      <div class="daily">
        <div>${hours}</div>
        <div class="side">
          <div class="block"><h5>Главное сегодня</h5>${'<div class="row"><span class="box"></span></div>'.repeat(4)}</div>
          <div class="block grow"><h5>Заметки</h5>${rows(7)}</div>
        </div>
      </div>`;
  }
  if (id === "weekly") {
    const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье", "Заметки"];
    return `<h4>План на неделю</h4>
      <div class="weekly">${days.map((d) => `<div class="block"><h5>${d}</h5>${rows(4)}</div>`).join("")}</div>`;
  }
  if (id === "lecture") {
    const field = (name) => `<div class="field-row"><span>${name}</span><div class="field-line"></div></div>`;
    return `<h4>Лекция</h4>
      <div class="lecture-head">${field("Предмет")}${field("Тема")}${field("Преподаватель")}</div>
      ${rows(14)}`;
  }
  if (id === "cornell") {
    // Cornell notes: key words and questions on the left, notes on the right, a short summary at the bottom
    return `<h4>Конспект</h4>
      <div class="cornell">
        <div class="cues"><h5>Вопросы и ключевые слова</h5></div>
        <div class="notes"><h5>Конспект</h5>${rows(15)}</div>
        <div class="summary"><h5>Итог</h5>${rows(3)}</div>
      </div>`;
  }
  if (id === "timetable") {
    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    const head = `<span></span>${days.map((d) => `<span class="head">${d}</span>`).join("")}`;
    const body = numbers(7).map((n) => `<span class="head">${n}</span>${"<span></span>".repeat(6)}`).join("");
    return `<h4>Расписание пар</h4><div class="timetable">${head}${body}</div>`;
  }
  if (id === "deadlines") {
    const head = ["Предмет", "Задание", "Срок", "✓"].map((name) => `<span class="head">${name}</span>`).join("");
    const row = '<span></span><span></span><span></span><span><span class="box"></span></span>';
    return `<h4>Дедлайны и экзамены</h4><div class="deadlines">${head}${row.repeat(16)}</div>`;
  }
  if (id === "habits") {
    const head = `<span></span>${numbers(31).map((d) => `<span class="head">${d}</span>`).join("")}`;
    const row = `<span class="name"></span>${"<span></span>".repeat(31)}`;
    return `<h4>Трекер привычек</h4><div class="habits">${head}${row.repeat(12)}</div>`;
  }
  if (id === "mood") {
    const legend = ["отлично", "хорошо", "нормально", "грустно", "устала"];
    return `<h4>Настроение месяца</h4>
      <div class="mood">${numbers(31).map((d) => `<span class="day">${d}</span>`).join("")}</div>
      <div class="legend">${legend.map((name) => `<div><span class="dot"></span>${name}</div>`).join("")}</div>`;
  }
  if (id === "gratitude") {
    const numbered = numbers(5).map((i) => `<div class="row"><span>${i}.</span></div>`).join("");
    return `<h4>Я благодарна за…</h4>${numbered}
      <h5>Сегодня было хорошо</h5>${rows(5)}
      <h5>Завтра я хочу</h5>${rows(4)}`;
  }
  return "";
}

// Ready-made notebooks on the home screen
const PRESETS = [
  { title: "Личный дневник", cover: "raspberry", template: "lines" },
  { title: "Планер", cover: "mustard", template: "grid" },
  { title: "Скетчбук", cover: "stone", template: "blank" },
  { title: "Учёба", cover: "denim", template: "dots" },
  { title: "Путешествия", cover: "sky", template: "dots" },
];

const COLORS = ["#2b2730", "#8d8288", "#d4537e", "#f08a3c", "#e3b31b", "#46a874", "#3f86d0", "#8a5cd1"];

// Glitter colours for the pen (saved as "glitter:gold" and so on; base null = rainbow)
const GLITTERS = [
  { id: "gold", base: "#d4a72c" },
  { id: "silver", base: "#a8adb6" },
  { id: "rose", base: "#d9988a" },
  { id: "pink", base: "#e0679a" },
  { id: "purple", base: "#8f63d2" },
  { id: "blue", base: "#4a86d6" },
  { id: "mint", base: "#3fb39a" },
  { id: "rainbow", base: null },
];

const BRUSHES = {
  pen: { name: "Ручка", size: 5, opacity: 100 },
  nib: { name: "Перо", size: 6, opacity: 100 },
  pencil: { name: "Карандаш", size: 5, opacity: 85 },
  marker: { name: "Фломастер", size: 8, opacity: 90 },
  highlighter: { name: "Выделитель", size: 10, opacity: 35 },
};

const FONTS = [
  { name: "Обычный", css: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { name: "Рукописный", css: "'Caveat', cursive" },
  { name: "Мягкий", css: "'Comfortaa', sans-serif" },
  { name: "Книжный", css: "Georgia, 'Times New Roman', serif" },
  { name: "Машинка", css: "'Courier New', monospace" },
];

// Text size is a part of the page width, so it looks the same on every screen
const FONT_SIZES = [
  { name: "Маленький", fs: 0.026 },
  { name: "Средний", fs: 0.034 },
  { name: "Большой", fs: 0.046 },
  { name: "Огромный", fs: 0.064 },
];

const TOOL_ICONS = { draw: "ti-pencil", text: "ti-typography", erase: "ti-eraser", lasso: "ti-lasso", items: "ti-sticker" };

// ---------- App state (what is going on right now) ----------

const state = {
  profile: null,          // { name, pin }
  notebooks: [],
  packs: [],              // ids of the sticker packs you added
  customStickers: [],     // your own stickers: [{ id, src }]
  days: [],               // dates when you wrote something
  nb: null,               // the open notebook
  pages: [],              // its pages, sorted by date
  current: 0,             // index of the page on screen
  tool: "draw",
  brush: "pen",
  brushes: JSON.parse(JSON.stringify(BRUSHES)),
  color: COLORS[0],
  smooth: 30,
  snap: true,             // hold the pen still at the end of a line to make a neat shape
  eraserSize: 40,
  font: 0,
  fontSize: 1,
  textColor: COLORS[0],
  selectedId: null,       // selected sticker / photo / text
  calMonth: new Date(),
  packTab: null,
  search: "",             // what you are looking for in the sidebar
};

let currentScreen = "splash";
let unlockTo = "home";

// ---------- Small helpers ----------

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function toISO(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function todayISO() {
  const d = new Date();
  return toISO(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(iso) {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function plural(n, one, few, many) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
  return many;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// The password is only a lock, so a simple hash is enough here
function hashPin(pin) {
  let h = 5381;
  for (const ch of "my-diary:" + pin) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return h.toString(16);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Make a picture smaller before saving it, so the diary doesn't fill the memory
async function shrinkImage(file, maxSize, type, quality) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(type, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Keep only simple formatting (bold, italic, colours...) in saved text
function cleanHTML(html) {
  const doc = new DOMParser().parseFromString(`<div>${html || ""}</div>`, "text/html");
  const allowed = ["B", "I", "U", "S", "STRIKE", "STRONG", "EM", "SPAN", "FONT", "DIV", "BR", "P"];
  for (const el of doc.body.querySelectorAll("*")) {
    if (!allowed.includes(el.tagName)) {
      el.replaceWith(...el.childNodes);
      continue;
    }
    for (const attr of [...el.attributes]) {
      if (attr.name !== "style" && attr.name !== "color") el.removeAttribute(attr.name);
    }
  }
  return doc.body.firstChild.innerHTML;
}

function showScreen(id) {
  currentScreen = id;
  $$(".screen").forEach((s) => (s.hidden = s.id !== id));
}

// ---------- Start ----------

async function start() {
  [state.profile, state.packs, state.customStickers, state.days] = await Promise.all([
    kv("profile", null),
    kv("packs", PICTURE_PACK_IDS),
    kv("customStickers", []),
    kv("days", []),
  ]);
  // The picture sticker packs are new: switch them on once, also for people who already use the app.
  // (Version 3 switched on the ramen pack, which was removed again, so the next new pack needs version 4.)
  if ((await kv("packsVersion", 1)) < 2) {
    state.packs = [...new Set([...PICTURE_PACK_IDS, ...state.packs])];
    await setKV("packs", state.packs);
    await setKV("packsVersion", 2);
  }
  const savedTools = await kv("tools", {});
  Object.assign(state, savedTools);
  // New brushes (added in later versions) get their default settings
  state.brushes = { ...JSON.parse(JSON.stringify(BRUSHES)), ...savedTools.brushes };
  renderDrawOptions();
  renderTextOptions();
  state.notebooks = await DB.all("notebooks");
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

  setTimeout(() => (state.profile ? showLock("home") : showScreen("welcome")), 1300);
}

// ---------- Welcome: name and password ----------

$("#welcomeSave").addEventListener("click", async () => {
  const name = $("#nameInput").value.trim();
  const pin = $("#pinNew").value;
  const error = $("#welcomeError");
  if (!name) return (error.textContent = "Напиши своё имя");
  if (!/^\d{4}$/.test(pin)) return (error.textContent = "Пароль: ровно 4 цифры");
  if (pin !== $("#pinRepeat").value) return (error.textContent = "Пароли не совпадают");

  state.profile = { name, pin: hashPin(pin) };
  await setKV("profile", state.profile);
  showHome();
});

// ---------- Lock screen ----------

let pinTyped = "";

function showLock(afterUnlock) {
  unlockTo = afterUnlock;
  pinTyped = "";
  updatePinDots();
  $("#lockError").textContent = "";
  $("#lockAvatar").textContent = state.profile.name[0].toUpperCase();
  $("#lockHello").textContent = `Привет, ${state.profile.name}`;
  showScreen("lock");
}

function updatePinDots() {
  $$("#pinDots span").forEach((dot, i) => dot.classList.toggle("filled", i < pinTyped.length));
}

function buildKeypad() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "forgot", "0", "back"];
  for (const key of keys) {
    const b = document.createElement("button");
    if (key === "forgot") {
      b.className = "text-key";
      b.textContent = "Забыла пароль?";
      b.addEventListener("click", forgotPin);
    } else if (key === "back") {
      b.className = "text-key";
      b.innerHTML = '<i class="ti ti-backspace" style="font-size:26px"></i>';
      b.addEventListener("click", () => {
        pinTyped = pinTyped.slice(0, -1);
        updatePinDots();
      });
    } else {
      b.textContent = key;
      b.addEventListener("click", () => typePin(key));
    }
    $("#keypad").appendChild(b);
  }
}

function typePin(digit) {
  if (pinTyped.length >= 4) return;
  pinTyped += digit;
  updatePinDots();
  if (pinTyped.length < 4) return;

  if (hashPin(pinTyped) === state.profile.pin) {
    if (unlockTo === "notebook") {
      showScreen("notebook");
      fitPage();
    } else {
      showHome();
    }
  } else {
    $("#lockError").textContent = "Неверный пароль";
    $("#pinDots").classList.add("shake");
    setTimeout(() => {
      $("#pinDots").classList.remove("shake");
      pinTyped = "";
      updatePinDots();
    }, 400);
  }
}

async function forgotPin() {
  if (!confirm("Пароль нельзя восстановить. Можно только удалить все дневники на этом iPad и начать заново. Удалить всё?")) return;
  if (!confirm("Точно? Все страницы удалятся навсегда.")) return;
  await DB.deleteEverything();
  location.reload();
}

// Lock again when the app was in the background for more than a minute
let hiddenAt = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hiddenAt = Date.now();
    dropSelection();
    flushSave();
  } else if (state.profile && hiddenAt && Date.now() - hiddenAt > 60_000 &&
             (currentScreen === "home" || currentScreen === "notebook")) {
    showLock(currentScreen);
  }
});
window.addEventListener("pagehide", () => {
  dropSelection();
  flushSave();
});

// ---------- Home ----------

function showHome() {
  showScreen("home");
  renderHome();
}

function getStreak() {
  const days = new Set(state.days);
  const d = new Date();
  if (!days.has(toISO(d.getFullYear(), d.getMonth(), d.getDate()))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(toISO(d.getFullYear(), d.getMonth(), d.getDate()))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function renderHome() {
  const name = state.profile.name;
  $("#homeAvatar").textContent = name[0].toUpperCase();
  $("#homeHello").textContent = `Привет, ${name}`;
  const streak = getStreak();
  $("#homeSub").textContent = streak > 0
    ? `Ты пишешь ${streak} ${plural(streak, "день", "дня", "дней")} подряд`
    : "Хороший день, чтобы что-нибудь записать";

  const shelf = $("#myNotebooks");
  shelf.innerHTML = "";
  const sorted = [...state.notebooks].sort((a, b) => b.updated - a.updated);
  for (const nb of sorted) {
    shelf.appendChild(coverCard(nb.title, nb.cover, () => openNotebook(nb.id), () => openNotebookDialog(nb)));
  }
  const add = document.createElement("div");
  add.className = "nb";
  add.innerHTML = '<button class="cover new"><i class="ti ti-plus"></i>Новый дневник</button>';
  add.firstChild.addEventListener("click", () => openNotebookDialog(null));
  shelf.appendChild(add);

  const presets = $("#presetNotebooks");
  presets.innerHTML = "";
  for (const preset of PRESETS) {
    presets.appendChild(coverCard(preset.title, preset.cover, () => createNotebook(preset), null));
  }

  renderPackRow();
}

function coverCard(title, coverId, onOpen, onMore) {
  const look = coverLook(coverId);
  const card = document.createElement("div");
  card.className = "nb";
  card.style.setProperty("--cover-ink", look.ink);

  const cover = document.createElement("button");
  cover.className = `cover ${look.kind || ""}`;
  cover.style.setProperty("--cover", coverBackground(look));
  const name = document.createElement("span");
  name.className = "cover-title";
  name.textContent = title;
  cover.appendChild(name);
  cover.addEventListener("click", onOpen);
  card.appendChild(cover);

  if (onMore) {
    const more = document.createElement("button");
    more.className = "icon more";
    more.setAttribute("aria-label", "Изменить дневник");
    more.innerHTML = '<i class="ti ti-dots"></i>';
    more.addEventListener("click", onMore);
    card.appendChild(more);
  }
  return card;
}

$("#bellBtn").addEventListener("click", () => $("#reminderDialog").showModal());
$("#reminderClose").addEventListener("click", () => $("#reminderDialog").close());

// ---------- Sticker packs on the home screen ----------

function renderPackRow() {
  const row = $("#packList");
  row.innerHTML = "";
  for (const pack of STICKER_PACKS) {
    const added = state.packs.includes(pack.id);
    const b = document.createElement("button");
    b.className = "pack" + (added ? " added" : "");
    const face = stickerFace(pack.items[0]);
    face.classList.add("pack-face");
    const name = document.createElement("span");
    name.className = "pack-name";
    name.textContent = pack.name;
    b.append(face, name);
    if (added) b.insertAdjacentHTML("beforeend", '<i class="ti ti-circle-check check"></i>');
    b.addEventListener("click", () => openPackDialog(pack));
    row.appendChild(b);
  }
}

let openPack = null;

function openPackDialog(pack) {
  openPack = pack;
  $("#packTitle").textContent = pack.name;
  const grid = $("#packGrid");
  grid.innerHTML = "";
  for (const sticker of pack.items) grid.appendChild(stickerFace(sticker));
  updatePackToggle();
  $("#packDialog").showModal();
}

function updatePackToggle() {
  const added = state.packs.includes(openPack.id);
  $("#packToggle").textContent = added ? "Убрать из моих стикеров" : "Добавить в мои стикеры";
  $("#packToggle").classList.toggle("primary", !added);
}

$("#packToggle").addEventListener("click", async () => {
  if (state.packs.includes(openPack.id)) state.packs = state.packs.filter((id) => id !== openPack.id);
  else state.packs.push(openPack.id);
  await setKV("packs", state.packs);
  updatePackToggle();
  renderPackRow();
});
$("#packClose").addEventListener("click", () => $("#packDialog").close());

// ---------- Create / edit a notebook ----------

let editingNb = null;
let pickedCover = COVERS[0].id;
let pickedTemplate = TEMPLATES[0].id;
let pickedLayout = null;

function openNotebookDialog(nb) {
  editingNb = nb;
  pickedCover = nb ? coverLook(nb.cover).id : COVERS[0].id;
  pickedTemplate = nb ? nb.template : TEMPLATES[0].id;
  pickedLayout = nb ? nb.layout || null : null;
  $("#nbDialogTitle").textContent = nb ? "Дневник" : "Новый дневник";
  $("#nbName").value = nb ? nb.title : "";
  $("#nbSave").textContent = nb ? "Сохранить" : "Создать";
  $("#nbDelete").hidden = !nb;
  renderNotebookPicks();
  $("#nbDialog").showModal();
}

function renderNotebookPicks() {
  const covers = $("#coverPick");
  covers.innerHTML = "";
  for (const look of COVERS) {
    const b = document.createElement("button");
    b.className = "cover pick-cover" + (look.id === pickedCover ? " picked" : "");
    b.style.setProperty("--cover", coverBackground(look));
    b.setAttribute("aria-label", "Обложка");
    b.addEventListener("click", () => {
      pickedCover = look.id;
      renderNotebookPicks();
    });
    covers.appendChild(b);
  }
  renderTemplatePicks($("#nbTemplatePick"), pickedTemplate, (id) => {
    pickedTemplate = id;
    renderNotebookPicks();
  });
  renderLayoutPicks($("#nbLayoutPick"), pickedLayout, (id) => {
    pickedLayout = id;
    if (id) pickedTemplate = "blank";
    renderNotebookPicks();
  });
}

// Page look: ruling (lines, grid...), page colour and ruling colour
function decoratePage(el, page) {
  el.dataset.template = page.template || "blank";
  el.style.backgroundColor = page.paper || PAPERS[0];
  el.style.setProperty("--rule", page.rule || RULES[0]);
}

function layoutElement(layoutId) {
  const div = document.createElement("div");
  div.className = "layout";
  div.innerHTML = layoutId ? layoutHTML(layoutId) : "";
  return div;
}

function renderTemplatePicks(box, chosen, onPick, look = {}) {
  box.innerHTML = "";
  for (const t of TEMPLATES) {
    const b = document.createElement("button");
    b.className = "tpl-pick" + (t.id === chosen ? " picked" : "");
    const mini = document.createElement("span");
    mini.className = "page";
    decoratePage(mini, { ...look, template: t.id });
    b.append(mini, t.name);
    b.addEventListener("click", () => onPick(t.id));
    box.appendChild(b);
  }
}

function renderLayoutPicks(box, chosen, onPick, look = {}) {
  box.innerHTML = "";
  for (const option of [{ id: null, name: "Без шаблона" }, ...LAYOUTS]) {
    const b = document.createElement("button");
    b.className = "tpl-pick big" + (option.id === chosen ? " picked" : "");
    const mini = document.createElement("span");
    mini.className = "page";
    decoratePage(mini, { ...look, template: "blank" });
    mini.appendChild(layoutElement(option.id));
    b.append(mini, option.name);
    b.addEventListener("click", () => onPick(option.id));
    box.appendChild(b);
  }
}

$("#nbCancel").addEventListener("click", () => $("#nbDialog").close());

$("#nbSave").addEventListener("click", async () => {
  const title = $("#nbName").value.trim() || "Мой дневник";
  $("#nbDialog").close();
  if (editingNb) {
    Object.assign(editingNb, { title, cover: pickedCover, template: pickedTemplate, layout: pickedLayout });
    await DB.put("notebooks", editingNb);
    renderHome();
  } else {
    createNotebook({ title, cover: pickedCover, template: pickedTemplate, layout: pickedLayout });
  }
});

$("#nbDelete").addEventListener("click", async () => {
  const nb = editingNb;
  if (!confirm(`Удалить дневник «${nb.title}» и все его страницы?`)) return;
  $("#nbDialog").close();
  for (const page of await DB.byIndex("pages", "notebookId", nb.id)) await DB.del("pages", page.id);
  await DB.del("notebooks", nb.id);
  state.notebooks = state.notebooks.filter((n) => n.id !== nb.id);
  renderHome();
});

async function createNotebook({ title, cover, template, layout = null }) {
  const nb = { id: uid(), title, cover, template, layout, created: Date.now(), updated: Date.now() };
  await DB.put("notebooks", nb);
  state.notebooks.push(nb);
  openNotebook(nb.id);
}

// ---------- Open a notebook ----------

const pageEl = $("#page");
const itemsEl = $("#items");
const drawCanvas = $("#drawCanvas");
const liveCanvas = $("#liveCanvas");
const dctx = drawCanvas.getContext("2d");   // finished drawing
const lctx = liveCanvas.getContext("2d");   // the line you are drawing right now

const curPage = () => state.pages[state.current];

async function openNotebook(id) {
  state.nb = state.notebooks.find((n) => n.id === id);
  state.pages = await DB.byIndex("pages", "notebookId", id);
  sortPages();
  if (state.pages.length === 0) state.pages.push(await makePage(todayISO()));
  state.current = state.pages.length - 1;
  $("#nbTitle").textContent = state.nb.title;
  $("#sidebar").hidden = window.innerWidth <= 820;
  updateSidebarButton();
  showScreen("notebook");
  setTool(state.tool);
  renderPage();
  fitPage();
}

$("#homeBtn").addEventListener("click", async () => {
  dropSelection();
  await flushSave();
  showHome();
});

function sortPages() {
  state.pages.sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order);
}

// A new page looks like the page you are on (or like the notebook's settings, for the first page)
async function makePage(date) {
  const like = state.pages[state.current] || {};
  const page = {
    id: uid(),
    notebookId: state.nb.id,
    order: Date.now(),
    date,
    template: like.template || state.nb.template,
    layout: like.id ? like.layout || null : state.nb.layout || null,
    paper: like.paper || PAPERS[0],
    rule: like.rule || RULES[0],
    drawing: null,
    items: [],
  };
  await DB.put("pages", page);
  return page;
}

async function addPage(date) {
  dropSelection();
  await flushSave();
  const page = await makePage(date);
  state.pages.push(page);
  sortPages();
  goTo(state.pages.indexOf(page));
}

async function goTo(index) {
  dropSelection();  // finish a lasso selection on this page before leaving it
  await flushSave();
  state.current = clamp(index, 0, state.pages.length - 1);
  renderPage();
}

$("#prevPage").addEventListener("click", () => goTo(state.current - 1));
$("#nextPage").addEventListener("click", () => goTo(state.current + 1));
$("#addPageBtn").addEventListener("click", () => addPage(todayISO()));

$("#deletePageBtn").addEventListener("click", async () => {
  if (!confirm("Удалить эту страницу?")) return;
  dropSelection();
  const page = curPage();
  dirtyPage = null;
  await DB.del("pages", page.id);
  state.pages.splice(state.current, 1);
  if (state.pages.length === 0) state.pages.push(await makePage(todayISO()));
  goTo(Math.min(state.current, state.pages.length - 1));
});

// The page keeps a 3:4 shape and fills as much of the screen as it can
function fitPage() {
  const desk = $("#desk");
  const width = Math.max(120, Math.min(desk.clientWidth - 32, (desk.clientHeight - 32) * 3 / 4));
  pageEl.style.width = width + "px";
  pageEl.style.height = width * 4 / 3 + "px";
  pageEl.style.setProperty("--pw", width + "px");
  resetZoom();
}
new ResizeObserver(fitPage).observe($("#desk"));

// ---------- Zoom: spread two fingers to zoom in, pinch to zoom out ----------
// When zoomed in, move the page with two fingers (or with one finger, once you use the Pencil).

const view = { z: 1, x: 0, y: 0 };  // zoom and shift of the page
const fingers = new Map();          // fingers on the desk right now: pointerId → { x, y }
let zoomGesture = null;
let pan = null;

function applyView() {
  if (view.z <= 1.01) {
    view.z = 1;
    view.x = 0;
    view.y = 0;
  }
  pageEl.style.transform = view.z === 1 ? "" : `translate(${view.x}px, ${view.y}px) scale(${view.z})`;
  $("#zoomReset").hidden = view.z === 1;
}

function resetZoom() {
  view.z = 1;
  applyView();
}
$("#zoomReset").addEventListener("click", resetZoom);

// Where the page's top-left corner is when it is not zoomed
function pageOrigin() {
  const desk = $("#desk").getBoundingClientRect();
  return { x: desk.left + pageEl.offsetLeft, y: desk.top + pageEl.offsetTop };
}

// The second finger came: stop the line or move that the first finger started
function cancelFirstFinger() {
  if (stroke) {
    clearTimeout(stroke.holdTimer);
    stroke = null;
    lctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
    undoStack.pop();
    paintDrawing(curPage().drawing);  // undo what the eraser did, too
  }
  if (drag) {
    drag = null;
    savePageSoon();
  }
  if (lasso) {
    lasso = null;
    lctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
  }
  selMove = null;
  touches.clear();
}

// These listeners run in the "capture" phase: before the page's own listeners
const desk = $("#desk");

desk.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "touch") return;
  fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (fingers.size === 1 && view.z > 1 && pencilSeen && (state.tool === "draw" || state.tool === "erase")) {
    pan = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, x: view.x, y: view.y };
    e.stopPropagation();
    return;
  }
  if (fingers.size !== 2) return;
  if (state.tool === "items" && state.selectedId) return;  // two fingers resize the selected sticker instead

  e.stopPropagation();
  cancelFirstFinger();
  pan = null;
  const [a, b] = [...fingers.values()];
  zoomGesture = {
    z: view.z,
    x: view.x,
    y: view.y,
    dist: Math.max(10, Math.hypot(b.x - a.x, b.y - a.y)),
    mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  };
}, true);

desk.addEventListener("pointermove", (e) => {
  if (!fingers.has(e.pointerId)) return;
  fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (zoomGesture && fingers.size >= 2) {
    const [a, b] = [...fingers.values()];
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const z = clamp(zoomGesture.z * Math.hypot(b.x - a.x, b.y - a.y) / zoomGesture.dist, 1, 4);
    // The point of the page that was between the fingers stays between the fingers
    const origin = pageOrigin();
    const px = (zoomGesture.mid.x - origin.x - zoomGesture.x) / zoomGesture.z;
    const py = (zoomGesture.mid.y - origin.y - zoomGesture.y) / zoomGesture.z;
    view.z = z;
    view.x = mid.x - origin.x - px * z;
    view.y = mid.y - origin.y - py * z;
    applyView();
    e.stopPropagation();
  } else if (pan && e.pointerId === pan.pointerId) {
    view.x = pan.x + e.clientX - pan.startX;
    view.y = pan.y + e.clientY - pan.startY;
    applyView();
    e.stopPropagation();
  }
}, true);

for (const type of ["pointerup", "pointercancel"]) {
  desk.addEventListener(type, (e) => {
    if (!fingers.delete(e.pointerId)) return;
    if (fingers.size < 2) zoomGesture = null;
    if (pan && pan.pointerId === e.pointerId) pan = null;
  }, true);
}

function renderPage() {
  const page = curPage();
  resetZoom();
  state.selectedId = null;
  undoStack = [];
  redoStack = [];
  decoratePage(pageEl, page);
  $("#layout").innerHTML = page.layout ? layoutHTML(page.layout) : "";
  showPdf($("#pdfBg"), page.pdf);
  $("#pageTitle").value = page.title || "";
  $("#pageDateText").textContent = formatDate(page.date);
  $("#dateInput").value = page.date;
  $("#pageNum").textContent = `${state.current + 1} / ${state.pages.length}`;
  $("#prevPage").disabled = state.current === 0;
  $("#nextPage").disabled = state.current === state.pages.length - 1;
  paintDrawing(page.drawing);
  renderItems();
  const d = parseISO(page.date);
  state.calMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  renderSidebar();
}

// A box given in parts of the page (0 to 1), e.g. where a PDF page sits
function setBox(el, box) {
  el.style.left = box.x * 100 + "%";
  el.style.top = box.y * 100 + "%";
  el.style.width = box.w * 100 + "%";
  el.style.height = box.h * 100 + "%";
}

function showPdf(img, pdf) {
  img.hidden = !pdf;
  if (!pdf) {
    img.removeAttribute("src");
    return;
  }
  img.src = pdf.src;
  setBox(img, pdf);
}

// The page title (top left): type it with the "Aa" tool
$("#pageTitle").addEventListener("input", (e) => {
  curPage().title = e.target.value;
  savePageSoon();
});
$("#pageTitle").addEventListener("keydown", (e) => {
  if (e.key === "Enter") e.target.blur();
});

// Change the date of a page (tap the date in the top right corner)
$("#dateInput").addEventListener("change", (e) => {
  const page = curPage();
  if (!e.target.value) return;
  dropSelection();
  page.date = e.target.value;
  sortPages();
  state.current = state.pages.indexOf(page);
  savePageSoon();
  renderPage();
});

// ---------- Saving ----------

let saveTimer = null;
let dirtyPage = null;

function savePageSoon() {
  dirtyPage = curPage();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 400);
}

async function flushSave() {
  clearTimeout(saveTimer);
  if (!dirtyPage) return;
  const page = dirtyPage;
  dirtyPage = null;
  state.nb.updated = Date.now();
  try {
    await DB.put("pages", page);
    await DB.put("notebooks", state.nb);
  } catch (err) {
    alert("Не получилось сохранить страницу: " + err.message);
  }
  renderThumbs();
}

function markWritten() {
  const date = curPage().date;
  if (state.days.includes(date)) return;
  state.days.push(date);
  setKV("days", state.days);
}

let toolsTimer = null;
function saveToolsSoon() {
  clearTimeout(toolsTimer);
  toolsTimer = setTimeout(() => {
    const { tool, brush, brushes, color, smooth, snap, eraserSize, font, fontSize, textColor } = state;
    setKV("tools", { tool, brush, brushes, color, smooth, snap, eraserSize, font, fontSize, textColor });
  }, 500);
}

// ---------- Sidebar: calendar and page thumbnails ----------

function renderSidebar() {
  $("#calendarBox").hidden = Boolean(state.search);  // while searching, the list of results takes its place
  if (!state.search) renderCalendar();
  renderThumbs();
}

// Search: page titles, typed text and the text inside imported PDF pages
function pageText(page) {
  const parts = [page.title || "", page.pdfText || ""];
  for (const item of page.items) {
    if (item.type !== "text") continue;
    const div = document.createElement("div");
    div.innerHTML = cleanHTML(item.html);
    parts.push(div.textContent);
  }
  return parts.join(" ").toLowerCase();
}

$("#pageSearch").addEventListener("input", (e) => {
  state.search = e.target.value.trim().toLowerCase();
  renderSidebar();
});

function renderCalendar() {
  const month = state.calMonth;
  const year = month.getFullYear(), m = month.getMonth();
  $("#calTitle").textContent = `${MONTH_NAMES[m]} ${year}`;
  const grid = $("#calendar");
  grid.innerHTML = "";
  for (const name of ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]) {
    grid.insertAdjacentHTML("beforeend", `<div class="dow">${name}</div>`);
  }
  const emptyCells = (new Date(year, m, 1).getDay() + 6) % 7;  // weeks start on Monday
  for (let i = 0; i < emptyCells; i++) grid.appendChild(document.createElement("div"));

  const withPages = new Set(state.pages.map((p) => p.date));
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(year, m, day);
    const b = document.createElement("button");
    b.className = "day";
    if (withPages.has(iso)) b.classList.add("has");
    if (iso === todayISO()) b.classList.add("today");
    if (iso === curPage().date) b.classList.add("current");
    b.textContent = day;
    b.addEventListener("click", () => goToDate(iso));
    grid.appendChild(b);
  }
}

function goToDate(iso) {
  const index = state.pages.findIndex((p) => p.date === iso);
  if (index >= 0) goTo(index);
  else if (confirm(`Создать страницу на ${formatDate(iso)}?`)) addPage(iso);
}

$("#calPrev").addEventListener("click", () => {
  state.calMonth = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth() - 1, 1);
  renderCalendar();
});
$("#calNext").addEventListener("click", () => {
  state.calMonth = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth() + 1, 1);
  renderCalendar();
});

function renderThumbs() {
  if (!state.nb || $("#sidebar").hidden) return;
  const box = $("#thumbs");
  box.innerHTML = "";
  const query = state.search;
  let found = 0;
  state.pages.forEach((page, i) => {
    if (query && !pageText(page).includes(query)) return;
    found++;
    const thumb = document.createElement("button");
    thumb.className = "thumb" + (i === state.current ? " current" : "");
    thumb.appendChild(buildMiniPage(page));
    if (page.title) {
      const title = document.createElement("span");
      title.className = "thumb-title";
      title.textContent = page.title;
      thumb.appendChild(title);
    }
    const d = parseISO(page.date);
    thumb.append(`${d.getDate()} ${MONTHS[d.getMonth()]}`);
    thumb.addEventListener("click", () => goTo(i));
    box.appendChild(thumb);
  });
  $("#pagesLabel").textContent = query ? `Найдено: ${found}` : "Страницы";
  if (query && !found) box.innerHTML = '<p class="no-results">Ничего не найдено</p>';
  box.querySelector(".current")?.scrollIntoView({ block: "nearest" });
}

// A small copy of a page: template + drawing + stickers, photos and text
function buildMiniPage(page) {
  const mini = document.createElement("div");
  mini.className = "page mini-page";
  decoratePage(mini, page);
  addPageParts(mini, page);
  return mini;
}

// Everything on a page except its paper: page template, PDF, drawing, stickers, photos, text, date, title.
// Used for the small pages in the sidebar and for pictures/PDFs you share.
function addPageParts(el, page) {
  el.appendChild(layoutElement(page.layout));
  if (page.pdf) {
    const img = document.createElement("img");
    img.className = "pdf-bg";
    img.src = page.pdf.src;
    setBox(img, page.pdf);
    el.appendChild(img);
  }
  if (page.drawing) {
    const img = document.createElement("img");
    img.className = "drawing";
    img.src = page.drawing;
    el.appendChild(img);
  }
  const items = document.createElement("div");
  items.className = "items";
  for (const item of page.items) items.appendChild(buildItem(item));
  el.appendChild(items);
  const date = document.createElement("div");
  date.className = "page-date";
  date.textContent = formatDate(page.date);
  el.appendChild(date);
  if (page.title) {
    const title = document.createElement("div");
    title.className = "page-title";
    title.textContent = page.title;
    el.appendChild(title);
  }
}

function updateSidebarButton() {
  $("#sideOpen").hidden = !$("#sidebar").hidden;
}

$("#sideClose").addEventListener("click", () => {
  $("#sidebar").hidden = true;
  updateSidebarButton();
});
$("#sideOpen").addEventListener("click", () => {
  $("#sidebar").hidden = false;
  updateSidebarButton();
  renderSidebar();
});

// ---------- Toolbar ----------

function setTool(tool) {
  if (tool !== "lasso") dropSelection();
  if (tool !== "text") activeTextId = null;
  $("#pasteBtn").hidden = !clipboard;
  state.tool = tool;
  document.body.dataset.tool = tool;
  $$(".tool").forEach((b) => b.classList.toggle("active", b.dataset.tool === tool));
  $$(".options").forEach((o) => (o.hidden = o.dataset.for !== tool));
  $("#expandBtn").innerHTML = `<i class="ti ${TOOL_ICONS[tool]}"></i>`;
  if (tool !== "text" && document.activeElement && document.activeElement.closest(".item")) {
    document.activeElement.blur();
  }
  if (tool !== "items") state.selectedId = null;
  renderItems();
  if (tool === "items") renderStickerDrawer();
  saveToolsSoon();
}

$$(".tool").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));

$("#collapseBtn").addEventListener("click", () => {
  $("#toolbar").hidden = true;
  $("#expandBtn").hidden = false;
});
$("#expandBtn").addEventListener("click", () => {
  $("#toolbar").hidden = false;
  $("#expandBtn").hidden = true;
});

// Pen options: brush, colour, size, opacity, stabilization
function renderDrawOptions() {
  const brushBox = $("#brushList");
  brushBox.innerHTML = "";
  for (const [key, brush] of Object.entries(BRUSHES)) {
    const b = document.createElement("button");
    b.textContent = brush.name;
    b.classList.toggle("active", key === state.brush);
    b.addEventListener("click", () => {
      state.brush = key;
      if (key !== "pen") state.color = plainColor();  // glitter is only for the pen
      renderDrawOptions();
      saveToolsSoon();
    });
    brushBox.appendChild(b);
  }
  renderColors($("#colorList"), state.color, (color) => {
    state.color = color;
    renderDrawOptions();
    saveToolsSoon();
  });

  const glitterBox = $("#glitterList");
  glitterBox.hidden = state.brush !== "pen";  // glitter is only for the pen
  glitterBox.innerHTML = '<span class="colors-label">Блёстки</span>';
  for (const look of GLITTERS) {
    const value = "glitter:" + look.id;
    const b = document.createElement("button");
    b.className = "swatch glitter" + (value === state.color ? " active" : "");
    b.style.backgroundImage = `url(${glitterTile(look.id).url})`;
    b.setAttribute("aria-label", "Блестящий цвет");
    b.addEventListener("click", () => {
      state.color = value;
      renderDrawOptions();
      saveToolsSoon();
    });
    glitterBox.appendChild(b);
  }

  $("#sizeRange").value = state.brushes[state.brush].size;
  $("#opacityRange").value = state.brushes[state.brush].opacity;
  $("#smoothRange").value = state.smooth;
  $("#snapBtn").classList.toggle("active", state.snap);
  $("#eraserRange").value = state.eraserSize;
}

function renderColors(box, chosen, onPick, keepFocus = false, list = COLORS) {
  box.innerHTML = "";
  for (const color of list) {
    const b = document.createElement("button");
    b.className = "swatch" + (color === chosen ? " active" : "");
    b.style.background = color;
    b.setAttribute("aria-label", "Цвет");
    if (keepFocus) b.addEventListener("pointerdown", (e) => e.preventDefault());
    b.addEventListener("click", () => onPick(color));
    box.appendChild(b);
  }
  // Any other colour
  const more = document.createElement("label");
  more.className = "color-more";
  more.innerHTML = '<input type="color" aria-label="Другой цвет">';
  const input = more.querySelector("input");
  if (/^#[0-9a-f]{6}$/i.test(chosen)) input.value = chosen;  // a glitter colour is not a normal colour
  input.addEventListener("change", () => onPick(input.value));
  box.appendChild(more);
}

$("#sizeRange").addEventListener("input", (e) => {
  state.brushes[state.brush].size = Number(e.target.value);
  saveToolsSoon();
});
$("#opacityRange").addEventListener("input", (e) => {
  state.brushes[state.brush].opacity = Number(e.target.value);
  saveToolsSoon();
});
$("#smoothRange").addEventListener("input", (e) => {
  state.smooth = Number(e.target.value);
  saveToolsSoon();
});
$("#eraserRange").addEventListener("input", (e) => {
  state.eraserSize = Number(e.target.value);
  saveToolsSoon();
});

// ---------- Drawing with Apple Pencil ----------

let stroke = null;
let pencilSeen = false;  // after the Pencil is used, fingers don't draw (so your palm doesn't)
let paintToken = 0;

// "Отменить" / "Вернуть": copies of the page from before each change (drawing + stickers, photos, text)
let undoStack = [];
let redoStack = [];

function snapshot() {
  return { drawing: curPage().drawing, items: curPage().items.map((item) => ({ ...item })) };
}

function pushUndo() {
  undoStack.push(snapshot());
  if (undoStack.length > 30) undoStack.shift();
  redoStack = [];
}

function restore(snap) {
  const isEmptyText = (item) => item.type === "text" && !(item.html || "").replace(/<[^>]*>/g, "").trim();
  curPage().drawing = snap.drawing;
  curPage().items = snap.items.filter((item) => !isEmptyText(item));
  state.selectedId = null;
  paintDrawing(snap.drawing);
  renderItems();
  savePageSoon();
}

async function paintDrawing(dataURL) {
  const token = ++paintToken;  // if another page is opened meanwhile, skip the old one
  dctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  if (!dataURL) return;
  const img = await loadImage(dataURL);
  if (token !== paintToken) return;
  dctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  dctx.drawImage(img, 0, 0);
}

function canvasPoint(e) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * drawCanvas.width / rect.width,
    y: (e.clientY - rect.top) * drawCanvas.height / rect.height,
    p: e.pointerType === "pen" ? Math.max(e.pressure, 0.05) : 0.5,  // pressure
  };
}

// The pencil brush uses a grainy pattern instead of a flat colour
const patternCache = {};
function pencilPattern(color) {
  if (!patternCache[color]) {
    const tile = document.createElement("canvas");
    tile.width = tile.height = 48;
    const g = tile.getContext("2d");
    g.fillStyle = color;
    for (let i = 0; i < 1500; i++) {
      g.globalAlpha = 0.3 + Math.random() * 0.7;
      g.fillRect(Math.floor(Math.random() * 48), Math.floor(Math.random() * 48), 1.5, 1.5);
    }
    patternCache[color] = lctx.createPattern(tile, "repeat");
  }
  return patternCache[color];
}

// Glitter: the colour with thousands of tiny lighter and darker flakes and a few white sparkles
const isGlitter = (color) => color.startsWith("glitter:");
const glitterCache = {};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function mixRgb(rgb, target, amount) {
  return rgb.map((c, i) => Math.round(c + (target[i] - c) * amount));
}

function glitterTile(id) {
  if (glitterCache[id]) return glitterCache[id];
  const look = GLITTERS.find((g) => g.id === id) || GLITTERS[0];
  const size = 96;
  const tile = document.createElement("canvas");
  tile.width = tile.height = size;
  const g = tile.getContext("2d");
  const base = look.base ? hexToRgb(look.base) : [214, 196, 236];
  g.fillStyle = `rgb(${base})`;
  g.fillRect(0, 0, size, size);

  for (let i = 0; i < 3000; i++) {
    if (look.base) {
      const flake = Math.random() < 0.55
        ? mixRgb(base, [255, 255, 255], Math.random() * 0.75)  // lighter flake
        : mixRgb(base, [0, 0, 0], Math.random() * 0.4);         // darker flake
      g.fillStyle = `rgb(${flake})`;
    } else {
      g.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 85%, ${55 + Math.floor(Math.random() * 25)}%)`;  // rainbow
    }
    const flakeSize = Math.random() < 0.8 ? 1 : 2;
    g.fillRect(Math.floor(Math.random() * size), Math.floor(Math.random() * size), flakeSize, flakeSize);
  }

  g.fillStyle = "rgba(255, 255, 255, 0.95)";
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(Math.random() * size), y = Math.floor(Math.random() * size);
    g.fillRect(x, y, 2, 2);
    if (i % 4 === 0) {  // a tiny star
      g.fillRect(x - 2, y, 6, 1);
      g.fillRect(x, y - 2, 1, 6);
    }
  }

  glitterCache[id] = { pattern: lctx.createPattern(tile, "repeat"), url: tile.toDataURL() };
  return glitterCache[id];
}

// The colour without glitter (a glitter colour turns into its base colour)
function plainColor() {
  if (!isGlitter(state.color)) return state.color;
  const look = GLITTERS.find((g) => "glitter:" + g.id === state.color);
  return (look && look.base) || COLORS[0];
}

// What the brush paints with: glitter (only for the pen), the pencil's grain, or a plain colour
function inkStyle() {
  if (state.brush === "pen" && isGlitter(state.color)) {
    return glitterTile(state.color.slice("glitter:".length)).pattern;
  }
  if (state.brush === "pencil") return pencilPattern(plainColor());
  return plainColor();
}

// How thick the line is for the current brush (p = how hard you press, 0 to 1)
function lineWidthFor(p) {
  const size = state.brushes[state.brush].size;
  if (state.brush === "pen") return size * (0.35 + p * 1.3);
  if (state.brush === "nib") return size * 1.1 * (0.6 + p * 0.8);
  if (state.brush === "pencil") return size * (0.4 + p * 0.8);
  if (state.brush === "marker") return size * 1.6;
  return size * 3;  // highlighter
}

// A nib (like a fountain pen) is a flat tip held at an angle:
// lines going one way are a bit thinner, the other way a bit thicker.
// The width changes smoothly, so the line never jumps from thin to thick.
const NIB_ANGLE = -Math.PI / 4;

function drawNib(ctx, from, to) {
  const size = state.brushes.nib.size;
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length > 0.5) {
    const direction = Math.atan2(to.y - from.y, to.x - from.x);
    const across = Math.abs(Math.sin(direction - NIB_ANGLE));  // 0 = along the tip (thin), 1 = across it (thick)
    const target = size * (0.5 + across) * (0.6 + to.p * 0.8);
    stroke.nibWidth = stroke.nibWidth === undefined ? target : stroke.nibWidth + (target - stroke.nibWidth) * 0.3;
  }
  ctx.lineWidth = stroke.nibWidth || size;
  ctx.strokeStyle = inkStyle();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function drawSegment(from, to) {
  const ctx = stroke.erase ? dctx : lctx;
  if (!stroke.erase && state.brush === "nib") return drawNib(ctx, from, to);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (stroke.erase) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = state.eraserSize;
  } else {
    ctx.strokeStyle = inkStyle();
    ctx.lineWidth = lineWidthFor(to.p);
  }
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function startStroke(e) {
  if (e.pointerType === "pen") pencilSeen = true;
  if (pencilSeen && e.pointerType === "touch") return;
  e.preventDefault();
  capturePointer(e.pointerId);
  pushUndo();

  const point = canvasPoint(e);
  stroke = { pointerId: e.pointerId, erase: state.tool === "erase", smooth: point, raw: point, points: [point] };
  if (!stroke.erase) {
    // The live line is drawn fully opaque; opacity is added when it is finished, so overlaps don't get darker
    liveCanvas.style.opacity = state.brushes[state.brush].opacity / 100;
    liveCanvas.style.mixBlendMode = state.brush === "highlighter" ? "multiply" : "normal";
  }
  drawSegment(point, point);
}

function moveStroke(e) {
  if (!stroke || e.pointerId !== stroke.pointerId) return;
  if (stroke.shape) return stretchShape(canvasPoint(e));  // the line already became a neat shape
  // Coalesced events are the extra points the Pencil sends between frames: smoother lines
  const events = e.getCoalescedEvents && e.getCoalescedEvents().length ? e.getCoalescedEvents() : [e];
  const follow = 1 - state.smooth / 100;  // stabilization: the line follows the pen a bit slower
  for (const ev of events) {
    const raw = canvasPoint(ev);
    const next = {
      x: stroke.smooth.x + (raw.x - stroke.smooth.x) * follow,
      y: stroke.smooth.y + (raw.y - stroke.smooth.y) * follow,
      p: raw.p,
    };
    drawSegment(stroke.smooth, next);
    stroke.smooth = next;
    stroke.raw = raw;
    stroke.points.push(raw);
  }
  if (state.snap && !stroke.erase) watchForHold(stroke.raw);
}

function endStroke(e) {
  if (!stroke || e.pointerId !== stroke.pointerId) return;
  clearTimeout(stroke.holdTimer);
  if (!stroke.shape) drawSegment(stroke.smooth, stroke.raw);  // finish the line exactly where the pen stopped
  if (!stroke.erase) {
    dctx.save();
    dctx.globalAlpha = state.brushes[state.brush].opacity / 100;
    dctx.globalCompositeOperation = state.brush === "highlighter" ? "multiply" : "source-over";
    dctx.drawImage(liveCanvas, 0, 0);
    dctx.restore();
    lctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
  }
  stroke = null;
  curPage().drawing = drawCanvas.toDataURL("image/png");
  markWritten();
  savePageSoon();
}

$("#undoBtn").addEventListener("click", () => {
  dropSelection();
  if (undoStack.length === 0) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
});
$("#redoBtn").addEventListener("click", () => {
  dropSelection();
  if (redoStack.length === 0) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
});

// ---------- Neat shapes: hold the pen still at the end of a line, and it becomes a neat shape ----------
// Like QuickShape in Procreate: a line, circle, oval, rectangle, triangle or a shape with straight sides.
// While you still hold the pen, you can move it to make the shape bigger or smaller (and turn a line).

$("#snapBtn").addEventListener("click", () => {
  state.snap = !state.snap;
  renderDrawOptions();
  saveToolsSoon();
});

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function watchForHold(point) {
  if (stroke.shape || (stroke.holdPoint && dist(point, stroke.holdPoint) < 6)) return;  // still holding
  stroke.holdPoint = point;
  clearTimeout(stroke.holdTimer);
  const current = stroke;
  stroke.holdTimer = setTimeout(() => {
    if (stroke === current && !current.shape) snapToShape();
  }, 600);
}

function snapToShape() {
  const shape = recognizeShape(stroke.points);
  if (!shape) return;  // not a shape we know: the line stays as you drew it
  const pressure = stroke.points.reduce((sum, p) => sum + p.p, 0) / stroke.points.length;
  shape.width = lineWidthFor(pressure);
  shape.anchor = shape.closed ? centroid(shape.points) : shape.points[0];
  shape.start = stroke.holdPoint;
  shape.base = shape.points;  // the shape before you stretch it
  stroke.shape = shape;
  drawShape(shape);
  showToast(shape.name);
}

function drawShape(shape) {
  lctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
  lctx.save();
  lctx.lineCap = "round";
  lctx.lineJoin = "round";
  lctx.lineWidth = shape.width;
  lctx.strokeStyle = inkStyle();
  lctx.beginPath();
  shape.points.forEach((p, i) => (i ? lctx.lineTo(p.x, p.y) : lctx.moveTo(p.x, p.y)));
  if (shape.closed) lctx.closePath();
  lctx.stroke();
  lctx.restore();
}

// Move the pen after the shape appears: closed shapes grow or shrink, lines also turn
function stretchShape(point) {
  const shape = stroke.shape;
  if (dist(point, shape.start) < 8) return;  // a small wobble while lifting the pen
  const from = { x: shape.start.x - shape.anchor.x, y: shape.start.y - shape.anchor.y };
  const to = { x: point.x - shape.anchor.x, y: point.y - shape.anchor.y };
  const fromLength = Math.hypot(from.x, from.y);
  if (fromLength < 10) return;
  const scale = Math.hypot(to.x, to.y) / fromLength;
  const turn = shape.closed ? 0 : Math.atan2(to.y, to.x) - Math.atan2(from.y, from.x);
  const cos = Math.cos(turn) * scale, sin = Math.sin(turn) * scale;
  shape.points = shape.base.map((p) => {
    const dx = p.x - shape.anchor.x, dy = p.y - shape.anchor.y;
    return { x: shape.anchor.x + dx * cos - dy * sin, y: shape.anchor.y + dx * sin + dy * cos };
  });
  drawShape(shape);
}

function centroid(points) {
  const sum = points.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function distToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const length2 = dx * dx + dy * dy;
  if (length2 === 0) return dist(p, a);
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / length2, 0, 1);
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

// How far the drawn line goes from the straight sides of a shape (the worst point)
function maxDistance(points, corners, closed) {
  let worst = 0;
  for (const p of points) {
    let best = Infinity;
    const sides = closed ? corners.length : corners.length - 1;
    for (let i = 0; i < sides; i++) best = Math.min(best, distToSegment(p, corners[i], corners[(i + 1) % corners.length]));
    worst = Math.max(worst, best);
  }
  return worst;
}

// Keep only the "corners" of a line (the Ramer–Douglas–Peucker method)
function simplify(points, tolerance) {
  if (points.length < 3) return points.slice();
  const first = points[0], last = points[points.length - 1];
  let farthest = 0, index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = distToSegment(points[i], first, last);
    if (d > farthest) {
      farthest = d;
      index = i;
    }
  }
  if (farthest <= tolerance) return [first, last];
  const left = simplify(points.slice(0, index + 1), tolerance);
  const right = simplify(points.slice(index), tolerance);
  return left.slice(0, -1).concat(right);
}

// The same for a closed shape: cut it into two halves at the point farthest from the start
function simplifyClosed(points, tolerance) {
  let far = 0;
  points.forEach((p, i) => {
    if (dist(p, points[0]) > dist(points[far], points[0])) far = i;
  });
  const a = simplify(points.slice(0, far + 1), tolerance);
  const b = simplify(points.slice(far).concat([points[0]]), tolerance);
  return a.slice(0, -1).concat(b.slice(0, -1));
}

function mergeClose(corners, minGap) {
  const result = [];
  for (const p of corners) if (!result.length || dist(p, result[result.length - 1]) >= minGap) result.push(p);
  while (result.length > 1 && dist(result[0], result[result.length - 1]) < minGap) result.pop();
  return result;
}

// Remove corners where the line hardly turns (they are just bumps on a straight side)
function dropStraightCorners(corners, closed, minTurn) {
  const v = corners.slice();
  let changed = true;
  while (changed && v.length > (closed ? 3 : 2)) {
    changed = false;
    for (let i = closed ? 0 : 1; i < (closed ? v.length : v.length - 1); i++) {
      const prev = v[(i - 1 + v.length) % v.length], cur = v[i], next = v[(i + 1) % v.length];
      let turn = Math.abs(Math.atan2(next.y - cur.y, next.x - cur.x) - Math.atan2(cur.y - prev.y, cur.x - prev.x));
      if (turn > Math.PI) turn = 2 * Math.PI - turn;
      if (turn < minTurn * Math.PI / 180) {
        v.splice(i, 1);
        changed = true;
        break;
      }
    }
  }
  return v;
}

// The same number of points, evenly spread along the line (fast and slow parts count the same)
function resample(points, count) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1], points[i]);
  const step = total / (count - 1);
  const out = [points[0]];
  let walked = 0;
  for (let i = 1; i < points.length && out.length < count; i++) {
    let prev = points[i - 1];
    const cur = points[i];
    let d = dist(prev, cur);
    while (walked + d >= step && d > 0 && out.length < count) {
      const t = (step - walked) / d;
      prev = { x: prev.x + (cur.x - prev.x) * t, y: prev.y + (cur.y - prev.y) * t };
      out.push(prev);
      d = dist(prev, cur);
      walked = 0;
    }
    walked += d;
  }
  while (out.length < count) out.push(points[points.length - 1]);
  return out;
}

// The oval that fits the points best, and how far the points are from it (err: 0 = perfect)
function fitEllipse(points) {
  const c = centroid(points);
  let sxx = 0, syy = 0, sxy = 0;
  for (const p of points) {
    const dx = p.x - c.x, dy = p.y - c.y;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const local = points.map((p) => ({
    u: (p.x - c.x) * cos + (p.y - c.y) * sin,
    v: -(p.x - c.x) * sin + (p.y - c.y) * cos,
  }));
  const a = Math.sqrt((2 * local.reduce((s, q) => s + q.u * q.u, 0)) / points.length);
  const b = Math.sqrt((2 * local.reduce((s, q) => s + q.v * q.v, 0)) / points.length);
  const err = local.reduce((s, q) => s + Math.abs(Math.hypot(q.u / a, q.v / b) - 1), 0) / points.length;
  return { cx: c.x, cy: c.y, a, b, angle, err };
}

function ellipseShape(e) {
  let { a, b, angle } = e;
  const round = Math.abs(a - b) / Math.max(a, b) < 0.12;
  if (round) {
    a = b = (a + b) / 2;
    angle = 0;
  } else {
    const quarter = Math.PI / 2;
    const nearest = Math.round(angle / quarter) * quarter;
    if (Math.abs(angle - nearest) < 10 * Math.PI / 180) angle = nearest;  // almost straight: make it straight
  }
  const points = [];
  for (let i = 0; i < 96; i++) {
    const t = (i / 96) * Math.PI * 2;
    const x = a * Math.cos(t), y = b * Math.sin(t);
    points.push({ x: e.cx + x * Math.cos(angle) - y * Math.sin(angle), y: e.cy + x * Math.sin(angle) + y * Math.cos(angle) });
  }
  return { name: round ? "Круг" : "Овал", points, closed: true };
}

// Four corners: a rectangle if all corners are close to 90°, otherwise a shape with four straight sides
function rectangleOrQuad(corners) {
  const square = corners.every((p, i) => {
    const prev = corners[(i + 3) % 4], next = corners[(i + 1) % 4];
    let angle = Math.abs(Math.atan2(prev.y - p.y, prev.x - p.x) - Math.atan2(next.y - p.y, next.x - p.x));
    if (angle > Math.PI) angle = 2 * Math.PI - angle;
    return Math.abs(angle * 180 / Math.PI - 90) < 25;
  });
  if (!square) return { name: "Фигура", points: corners, closed: true };

  // The direction of the sides (×4 makes all four sides point the same way), straight if almost straight
  let sx = 0, sy = 0;
  corners.forEach((p, i) => {
    const q = corners[(i + 1) % 4];
    const a = Math.atan2(q.y - p.y, q.x - p.x);
    sx += Math.cos(4 * a) * dist(p, q);
    sy += Math.sin(4 * a) * dist(p, q);
  });
  let angle = Math.atan2(sy, sx) / 4;
  if (Math.abs(angle) < 10 * Math.PI / 180) angle = 0;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const us = corners.map((p) => p.x * cos + p.y * sin);
  const vs = corners.map((p) => -p.x * sin + p.y * cos);
  const u1 = Math.min(...us), u2 = Math.max(...us), v1 = Math.min(...vs), v2 = Math.max(...vs);
  const back = (u, v) => ({ x: u * cos - v * sin, y: u * sin + v * cos });
  return { name: "Прямоугольник", points: [back(u1, v1), back(u2, v1), back(u2, v2), back(u1, v2)], closed: true };
}

function recognizeShape(points) {
  if (points.length < 5) return null;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const diag = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  if (diag < 40) return null;  // too small
  let length = 0;
  for (let i = 1; i < points.length; i++) length += dist(points[i - 1], points[i]);
  const closed = dist(points[0], points[points.length - 1]) < diag * 0.22 && length > diag * 1.8;

  if (!closed) {
    // Straight line, or a few straight lines with sharp corners (like an "L" or a "V")
    const corners = dropStraightCorners(simplify(points, diag * 0.05), false, 45);
    if (corners.length > 6 || maxDistance(points, corners, false) > Math.max(diag * 0.07, 6)) return null;
    return { name: corners.length === 2 ? "Линия" : "Ломаная линия", points: corners, closed: false };
  }

  const ellipse = fitEllipse(resample(points, 64));
  const corners = dropStraightCorners(mergeClose(simplifyClosed(points, diag * 0.07), diag * 0.1), true, 40);
  const straightSides = corners.length >= 3 && maxDistance(points, corners, true) < diag * 0.08;
  if (ellipse.err < 0.08) return ellipseShape(ellipse);
  if (straightSides && corners.length === 3) return { name: "Треугольник", points: corners, closed: true };
  if (straightSides && corners.length === 4) return rectangleOrQuad(corners);
  if (ellipse.err < 0.16) return ellipseShape(ellipse);
  if (straightSides && corners.length <= 8) return { name: "Фигура", points: corners, closed: true };
  return null;
}

// ---------- Things on the page: stickers, photos, text ----------

const findItem = (id) => curPage().items.find((item) => item.id === id);

function placeItem(el, item) {
  el.style.left = item.x * 100 + "%";
  el.style.top = item.y * 100 + "%";
  // Text is placed by its top-left corner, stickers and photos by their centre
  el.style.transform = item.type === "text"
    ? `rotate(${item.rot || 0}deg)`
    : `translate(-50%, -50%) rotate(${item.rot || 0}deg)`;
}

// Sizes are a part of the page width (item.w), so they look the same on every screen
function sizeItem(el, item) {
  if (item.type === "text") {
    el.style.width = `calc(var(--pw) * ${item.w})`;
    el.style.fontSize = `calc(var(--pw) * ${item.fs})`;
  } else if (item.src) {
    el.style.width = `calc(var(--pw) * ${item.w})`;
  } else {
    el.style.fontSize = `calc(var(--pw) * ${item.w * 0.8})`;  // emoji stickers grow with the font size
  }
}

function buildItem(item) {
  const el = document.createElement("div");
  el.dataset.id = item.id;
  if (item.type === "text") {
    el.className = "item text";
    el.innerHTML = cleanHTML(item.html);
    el.style.fontFamily = (FONTS[item.font] || FONTS[0]).css;
    el.style.color = item.color;
  } else {
    el.className = `item ${item.type}` + (item.frame ? " polaroid" : "");
    if (item.src) {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = "";
      img.draggable = false;
      el.appendChild(img);
    } else {
      el.textContent = item.emoji;
    }
  }
  sizeItem(el, item);
  placeItem(el, item);
  return el;
}

function renderItems() {
  if (!state.nb) return;
  itemsEl.innerHTML = "";
  for (const item of curPage().items) {
    const el = buildItem(item);
    if (item.type === "text" && state.tool === "text") el.contentEditable = "true";
    itemsEl.appendChild(el);
  }
  select(state.selectedId);
}

// The selected thing gets a dashed frame and a pink circle in the corner to resize it
function select(id) {
  state.selectedId = id;
  $$("#items .resize-handle").forEach((handle) => handle.remove());
  $$("#items .item").forEach((el) => {
    const selected = el.dataset.id === id;
    el.classList.toggle("selected", selected);
    if (selected) el.insertAdjacentHTML("beforeend", '<span class="resize-handle"></span>');
  });
  $("#itemTools").hidden = !id;
}

function addItem(item) {
  pushUndo();
  curPage().items.push(item);
  markWritten();
  savePageSoon();
}

function removeItem(id) {
  curPage().items = curPage().items.filter((item) => item.id !== id);
  if (state.selectedId === id) state.selectedId = null;
  savePageSoon();
}

// Moving and resizing things with a finger or the Pencil.
// drag.mode is "move" (drag the thing), "resize" (pull the pink circle) or "pinch" (two fingers).
let drag = null;
const touches = new Map();  // fingers on the page right now: pointerId → { x, y }

// Where the thing is "held": its centre (stickers, photos) or top-left corner (text)
function itemAnchor(item) {
  const rect = pageEl.getBoundingClientRect();
  return { x: rect.left + item.x * rect.width, y: rect.top + item.y * rect.height };
}

function startDrag(e, el) {
  e.preventDefault();
  pushUndo();
  const item = findItem(el.dataset.id);
  select(item.id);
  const anchor = itemAnchor(item);
  drag = {
    mode: "move",
    pointerId: e.pointerId,
    item,
    el: itemsEl.querySelector(`[data-id="${item.id}"]`),
    dx: e.clientX - anchor.x,
    dy: e.clientY - anchor.y,
  };
  capturePointer(e.pointerId);
}

// Pull the circle away from the centre: bigger; towards it: smaller
function startResize(e, el) {
  e.preventDefault();
  pushUndo();
  const item = findItem(el.dataset.id);
  const anchor = itemAnchor(item);
  drag = {
    mode: "resize",
    pointerId: e.pointerId,
    item,
    el,
    anchor,
    startDist: Math.max(10, Math.hypot(e.clientX - anchor.x, e.clientY - anchor.y)),
    startW: item.w,
    startFs: item.fs,
  };
  capturePointer(e.pointerId);
}

// Two fingers: spread to make bigger, pinch to make smaller, twist to rotate
function startPinch(e) {
  e.preventDefault();
  pushUndo();
  capturePointer(e.pointerId);
  const item = findItem(state.selectedId);
  const [a, b] = [...touches.values()];
  drag = {
    mode: "pinch",
    item,
    el: itemsEl.querySelector(`[data-id="${item.id}"]`),
    startDist: Math.max(10, Math.hypot(b.x - a.x, b.y - a.y)),
    startAngle: Math.atan2(b.y - a.y, b.x - a.x),
    startW: item.w,
    startFs: item.fs,
    startRot: item.rot || 0,
  };
}

function resizeBy(ratio) {
  drag.item.w = clamp(drag.startW * ratio, 0.03, 1.2);
  if (drag.item.type === "text") drag.item.fs = clamp(drag.startFs * ratio, 0.01, 0.25);
  sizeItem(drag.el, drag.item);
}

function moveDrag(e) {
  if (!drag) return;
  if (drag.mode === "pinch") {
    const [a, b] = [...touches.values()];
    if (!b) return;
    resizeBy(Math.hypot(b.x - a.x, b.y - a.y) / drag.startDist);
    drag.item.rot = drag.startRot + (Math.atan2(b.y - a.y, b.x - a.x) - drag.startAngle) * 180 / Math.PI;
    placeItem(drag.el, drag.item);
    return;
  }
  if (e.pointerId !== drag.pointerId) return;
  if (drag.mode === "resize") {
    resizeBy(Math.hypot(e.clientX - drag.anchor.x, e.clientY - drag.anchor.y) / drag.startDist);
    return;
  }
  const rect = pageEl.getBoundingClientRect();
  drag.item.x = clamp((e.clientX - drag.dx - rect.left) / rect.width, 0, 1);
  drag.item.y = clamp((e.clientY - drag.dy - rect.top) / rect.height, 0, 1);
  placeItem(drag.el, drag.item);
}

function endDrag(e) {
  if (!drag) return;
  const finished = drag.mode === "pinch" ? touches.size < 2 : e.pointerId === drag.pointerId;
  if (!finished) return;
  drag = null;
  savePageSoon();
}

// One place that decides what a touch on the page does, depending on the tool
pageEl.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".page-date, .page-title")) return;
  if (state.tool === "draw" || state.tool === "erase") return startStroke(e);
  if (state.tool === "lasso") return startLasso(e);
  if (state.tool !== "items") return;

  touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (touches.size === 2 && state.selectedId) return startPinch(e);
  const el = e.target.closest(".item");
  if (e.target.closest(".resize-handle")) startResize(e, el);
  else if (el) startDrag(e, el);
  else select(null);
});
pageEl.addEventListener("pointermove", (e) => {
  if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  moveStroke(e);
  moveDrag(e);
  moveLasso(e);
});
for (const type of ["pointerup", "pointercancel"]) {
  pageEl.addEventListener(type, (e) => {
    touches.delete(e.pointerId);
    endStroke(e);
    endDrag(e);
    endLasso(e);
  });
}

$("#itemTools").addEventListener("click", (e) => {
  const button = e.target.closest("button");
  const item = findItem(state.selectedId);
  if (!button || !item) return;
  pushUndo();
  const act = button.dataset.act;
  const factor = act === "bigger" ? 1.15 : act === "smaller" ? 1 / 1.15 : 1;
  item.w = clamp(item.w * factor, 0.05, 1);
  if (item.type === "text") item.fs = clamp(item.fs * factor, 0.012, 0.2);
  if (act === "left") item.rot = (item.rot || 0) - 10;
  if (act === "right") item.rot = (item.rot || 0) + 10;
  if (act === "front") {
    const items = curPage().items;
    items.push(items.splice(items.indexOf(item), 1)[0]);
  }
  if (act === "delete") removeItem(item.id);
  renderItems();
  savePageSoon();
});

// ---------- Lasso: select, move, copy, cut, delete, paste ----------
// Draw a loop around writing, drawings, stickers, photos or text: what is inside gets selected.
// The writing is a picture made of pixels, so the selected piece is cut out of the drawing
// and floats as a small picture while you move it. When you tap outside, it is put back.

let lasso = null;      // the loop you are drawing: { pointerId, points, color }
let selection = null;  // what is selected (see makeSelection)
let selMove = null;    // moving the selection: { pointerId, last }
let clipboard = null;  // what you copied

function capturePointer(id) {
  try {
    pageEl.setPointerCapture(id);
  } catch {
    // the finger is already gone
  }
}

function tracePolygon(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const p of points) ctx.lineTo(p.x, p.y);
  ctx.closePath();
}

// Is the point inside the loop? (count how many times a line to the right crosses the loop)
function pointInPolygon(point, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

function insideBox(point, box) {
  return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
}

function startLasso(e) {
  if (lasso || selMove) return;  // another finger is already busy
  e.preventDefault();
  const point = canvasPoint(e);
  if (selection && insideBox(point, selection.box)) {
    lift();
    selMove = { pointerId: e.pointerId, last: point };
  } else {
    dropSelection();
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    lasso = { pointerId: e.pointerId, points: [point], color: accent || "#d4537e" };
    liveCanvas.style.opacity = 1;
    liveCanvas.style.mixBlendMode = "normal";
  }
  capturePointer(e.pointerId);
}

function moveLasso(e) {
  if (selMove && e.pointerId === selMove.pointerId) {
    const point = canvasPoint(e);
    moveSelection(point.x - selMove.last.x, point.y - selMove.last.y);
    selMove.last = point;
    return;
  }
  if (!lasso || e.pointerId !== lasso.pointerId) return;
  lasso.points.push(canvasPoint(e));
  // Draw the dashed loop
  lctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
  lctx.save();
  lctx.setLineDash([14, 10]);
  lctx.lineWidth = 3;
  lctx.strokeStyle = lasso.color;
  tracePolygon(lctx, lasso.points);
  lctx.stroke();
  lctx.restore();
}

function endLasso(e) {
  if (selMove && e.pointerId === selMove.pointerId) {
    selMove = null;
    return;
  }
  if (!lasso || e.pointerId !== lasso.pointerId) return;
  const points = lasso.points;
  lasso = null;
  lctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
  if (points.length >= 3) makeSelection(points);
}

// The part of the drawing inside the loop, cut down to where there really is ink
function extractInk(points, box) {
  const piece = document.createElement("canvas");
  piece.width = box.w;
  piece.height = box.h;
  const g = piece.getContext("2d", { willReadFrequently: true });
  g.translate(-box.x, -box.y);
  tracePolygon(g, points);
  g.clip();
  g.drawImage(drawCanvas, 0, 0);

  const data = g.getImageData(0, 0, box.w, box.h).data;
  let minX = box.w, minY = box.h, maxX = -1, maxY = -1;
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      if (data[(y * box.w + x) * 4 + 3] === 0) continue;  // transparent: no ink here
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;  // no ink inside the loop

  const w = maxX - minX + 1, h = maxY - minY + 1;
  const ink = document.createElement("canvas");
  ink.width = w;
  ink.height = h;
  ink.getContext("2d").drawImage(piece, minX, minY, w, h, 0, 0, w, h);
  return { canvas: ink, x: box.x + minX, y: box.y + minY, w, h };
}

// The frame of a sticker, photo or text on the page, in drawing units
function itemBox(el) {
  const page = pageEl.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const sx = drawCanvas.width / page.width, sy = drawCanvas.height / page.height;
  return { x: (r.left - page.left) * sx, y: (r.top - page.top) * sy, w: r.width * sx, h: r.height * sy };
}

function makeSelection(points) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const x1 = clamp(Math.floor(Math.min(...xs)), 0, drawCanvas.width);
  const x2 = clamp(Math.ceil(Math.max(...xs)), 0, drawCanvas.width);
  const y1 = clamp(Math.floor(Math.min(...ys)), 0, drawCanvas.height);
  const y2 = clamp(Math.ceil(Math.max(...ys)), 0, drawCanvas.height);
  if (x2 - x1 < 4 || y2 - y1 < 4) return;  // the loop is too small

  const ink = extractInk(points, { x: x1, y: y1, w: x2 - x1, h: y2 - y1 });
  let bounds = ink ? { x1: ink.x, y1: ink.y, x2: ink.x + ink.w, y2: ink.y + ink.h } : null;

  // Stickers, photos and text are selected when their centre is inside the loop
  const itemIds = [];
  for (const el of itemsEl.querySelectorAll(".item")) {
    const b = itemBox(el);
    if (!pointInPolygon({ x: b.x + b.w / 2, y: b.y + b.h / 2 }, points)) continue;
    itemIds.push(el.dataset.id);
    bounds = {
      x1: Math.min(bounds ? bounds.x1 : b.x, b.x),
      y1: Math.min(bounds ? bounds.y1 : b.y, b.y),
      x2: Math.max(bounds ? bounds.x2 : b.x + b.w, b.x + b.w),
      y2: Math.max(bounds ? bounds.y2 : b.y + b.h, b.y + b.h),
    };
  }
  if (!bounds) return;  // nothing inside the loop

  const pad = 12;
  selection = {
    pageId: curPage().id,
    points,
    ink,
    itemIds,
    lifted: false,  // true when the ink is taken out of the drawing and floats
    box: { x: bounds.x1 - pad, y: bounds.y1 - pad, w: bounds.x2 - bounds.x1 + pad * 2, h: bounds.y2 - bounds.y1 + pad * 2 },
  };
  showSelection();
}

function placeOnPage(el, x, y, w, h) {
  el.style.left = (x / drawCanvas.width) * 100 + "%";
  el.style.top = (y / drawCanvas.height) * 100 + "%";
  el.style.width = (w / drawCanvas.width) * 100 + "%";
  el.style.height = (h / drawCanvas.height) * 100 + "%";
}

function showSelection() {
  const boxEl = $("#selectionBox");
  boxEl.hidden = !selection;
  $("#selectionTools").hidden = !selection;
  if (!selection) return;
  const { box, ink } = selection;
  placeOnPage(boxEl, box.x, box.y, box.w, box.h);
  if (ink && selection.lifted) {
    if (!ink.canvas.isConnected) {
      ink.canvas.className = "selection-ink";
      pageEl.appendChild(ink.canvas);
    }
    placeOnPage(ink.canvas, ink.x, ink.y, ink.w, ink.h);
  }
}

// Before moving or deleting: take the ink out of the drawing, so it can float
function lift() {
  if (selection.lifted) return;
  pushUndo();
  if (selection.ink) {
    dctx.save();
    dctx.globalCompositeOperation = "destination-out";
    tracePolygon(dctx, selection.points);
    dctx.fill();
    dctx.restore();
  }
  selection.lifted = true;
  showSelection();
}

function moveSelection(dx, dy) {
  selection.box.x += dx;
  selection.box.y += dy;
  if (selection.ink) {
    selection.ink.x += dx;
    selection.ink.y += dy;
  }
  for (const id of selection.itemIds) {
    const item = findItem(id);
    const el = itemsEl.querySelector(`[data-id="${id}"]`);
    if (!item || !el) continue;
    item.x += dx / drawCanvas.width;
    item.y += dy / drawCanvas.height;
    placeItem(el, item);
  }
  showSelection();
}

// Put the floating ink back into the drawing and finish the selection
function dropSelection() {
  if (!selection) return;
  const sel = selection;
  selection = null;
  selMove = null;
  if (sel.ink) sel.ink.canvas.remove();
  if (sel.lifted && state.nb && curPage().id === sel.pageId) {
    if (sel.ink) {
      dctx.drawImage(sel.ink.canvas, Math.round(sel.ink.x), Math.round(sel.ink.y));
      curPage().drawing = drawCanvas.toDataURL("image/png");
    }
    savePageSoon();
  }
  showSelection();
}

function cloneCanvas(source) {
  const copy = document.createElement("canvas");
  copy.width = source.width;
  copy.height = source.height;
  copy.getContext("2d").drawImage(source, 0, 0);
  return copy;
}

function copySelection() {
  const { ink, box } = selection;
  clipboard = {
    ink: ink ? { ...ink, canvas: cloneCanvas(ink.canvas) } : null,
    items: selection.itemIds.map((id) => findItem(id)).filter(Boolean).map((item) => ({ ...item })),
    box: { ...box },
    pastes: 0,
  };
  $("#pasteBtn").hidden = false;
}

function deleteSelection() {
  lift();  // takes the ink out of the drawing and remembers the page for "Отменить"
  const sel = selection;
  selection = null;
  if (sel.ink) {
    sel.ink.canvas.remove();
    curPage().drawing = drawCanvas.toDataURL("image/png");
  }
  curPage().items = curPage().items.filter((item) => !sel.itemIds.includes(item.id));
  renderItems();
  showSelection();
  savePageSoon();
}

function pasteClipboard() {
  if (!clipboard) return;
  dropSelection();
  pushUndo();
  clipboard.pastes += 1;
  // Each paste lands a little lower and to the right, but stays on the page
  const { box } = clipboard;
  const shift = 40 * clipboard.pastes;
  const dx = clamp(box.x + shift, 0, Math.max(0, drawCanvas.width - box.w)) - box.x;
  const dy = clamp(box.y + shift, 0, Math.max(0, drawCanvas.height - box.h)) - box.y;

  const itemIds = [];
  for (const copy of clipboard.items) {
    const item = { ...copy, id: uid(), x: copy.x + dx / drawCanvas.width, y: copy.y + dy / drawCanvas.height };
    curPage().items.push(item);
    itemIds.push(item.id);
  }
  const ink = clipboard.ink;
  selection = {
    pageId: curPage().id,
    points: null,
    ink: ink ? { ...ink, canvas: cloneCanvas(ink.canvas), x: ink.x + dx, y: ink.y + dy } : null,
    itemIds,
    lifted: true,  // the pasted ink floats until you tap outside
    box: { x: box.x + dx, y: box.y + dy, w: box.w, h: box.h },
  };
  renderItems();
  markWritten();
  showSelection();
}

$("#selectionTools").addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button || !selection) return;
  const act = button.dataset.sel;
  if (act === "copy") {
    copySelection();
    showToast("Скопировано");
  }
  if (act === "cut") {
    copySelection();
    deleteSelection();
    showToast("Вырезано");
  }
  if (act === "delete") deleteSelection();
  if (act === "done") dropSelection();
});

$("#pasteBtn").addEventListener("click", pasteClipboard);

let toastTimer = null;
function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 1500);
}

// ---------- Text (the "Aa" tool) ----------

let activeTextId = null;

function buildTextOptions() {
  for (const [i, font] of FONTS.entries()) $("#fontSelect").add(new Option(font.name, i));
  for (const [i, size] of FONT_SIZES.entries()) $("#fontSizeSelect").add(new Option(size.name, i));
}

function renderTextOptions() {
  $("#fontSelect").value = state.font;
  $("#fontSizeSelect").value = state.fontSize;
  renderColors($("#textColorList"), state.textColor, pickTextColor, true);
}

function activeTextEl() {
  return activeTextId ? itemsEl.querySelector(`[data-id="${activeTextId}"]`) : null;
}

function saveActiveText() {
  const el = activeTextEl();
  const item = activeTextId && findItem(activeTextId);
  if (!el || !item) return;
  item.html = el.innerHTML;
  savePageSoon();
}

// Tap on an empty place of the page: a new text box appears there
pageEl.addEventListener("click", (e) => {
  if (state.tool !== "text" || e.target.closest(".item.text, .page-date, .page-title")) return;
  const rect = pageEl.getBoundingClientRect();
  const w = 0.5;
  const item = {
    id: uid(),
    type: "text",
    x: clamp((e.clientX - rect.left) / rect.width, 0.02, 0.98 - w),
    y: clamp((e.clientY - rect.top) / rect.height - 0.02, 0.02, 0.95),
    w,
    fs: FONT_SIZES[state.fontSize].fs,
    font: state.font,
    color: state.textColor,
    rot: 0,
    html: "",
  };
  pushUndo();
  newTextId = item.id;
  curPage().items.push(item);
  renderItems();
  itemsEl.querySelector(`[data-id="${item.id}"]`).focus();
});

let newTextId = null;  // the text box that was just created

itemsEl.addEventListener("focusin", (e) => {
  const el = e.target.closest(".item.text");
  if (!el) return;
  // You start editing an older text: remember the page, so "Отменить" can bring the old text back
  if (el.dataset.id !== newTextId && el.dataset.id !== activeTextId) pushUndo();
  newTextId = null;
  activeTextId = el.dataset.id;
});

itemsEl.addEventListener("input", (e) => {
  const el = e.target.closest(".item.text");
  const item = el && findItem(el.dataset.id);
  if (!item) return;
  item.html = el.innerHTML;
  markWritten();
  savePageSoon();
});

// An empty text box is removed when you leave it
itemsEl.addEventListener("focusout", (e) => {
  const el = e.target.closest(".item.text");
  if (el && !el.textContent.trim()) {
    removeItem(el.dataset.id);
    el.remove();
  }
});

$("#fontSelect").addEventListener("change", (e) => {
  state.font = Number(e.target.value);
  const item = activeTextId && findItem(activeTextId);
  if (item) {
    item.font = state.font;
    savePageSoon();
    renderItems();
  }
  saveToolsSoon();
});

$("#fontSizeSelect").addEventListener("change", (e) => {
  state.fontSize = Number(e.target.value);
  const item = activeTextId && findItem(activeTextId);
  if (item) {
    item.fs = FONT_SIZES[state.fontSize].fs;
    savePageSoon();
    renderItems();
  }
  saveToolsSoon();
});

// Bold, italic, underline, strike: they change the selected words
$$(".fmt").forEach((b) => {
  b.addEventListener("pointerdown", (e) => e.preventDefault());  // keep the words selected
  b.addEventListener("click", () => {
    document.execCommand(b.dataset.cmd);
    saveActiveText();
  });
});

function pickTextColor(color) {
  state.textColor = color;
  const el = activeTextEl();
  const selection = window.getSelection();
  if (el && selection && !selection.isCollapsed && el.contains(selection.anchorNode)) {
    document.execCommand("foreColor", false, color);  // colour only the selected words
    saveActiveText();
  } else if (el) {
    findItem(activeTextId).color = color;  // colour the whole text box
    el.style.color = color;
    savePageSoon();
  }
  renderTextOptions();
  saveToolsSoon();
}

// ---------- Stickers in the notebook ----------

function renderStickerDrawer() {
  const tabs = $("#packTabs");
  const row = $("#packStickers");
  tabs.innerHTML = "";
  row.innerHTML = "";
  const packs = STICKER_PACKS.filter((p) => state.packs.includes(p.id));
  const tabIds = [...packs.map((p) => p.id), "custom"];
  if (!tabIds.includes(state.packTab)) state.packTab = tabIds[0];

  for (const pack of packs) tabs.appendChild(packTab(pack.id, stickerFace(pack.items[0])));
  tabs.appendChild(packTab("custom", "Мои"));

  if (state.packTab === "custom") {
    for (const sticker of state.customStickers) {
      const b = stickerButton({ src: sticker.src });
      const remove = document.createElement("span");
      remove.className = "remove";
      remove.textContent = "×";
      remove.addEventListener("click", async (e) => {
        e.stopPropagation();  // don't also put the sticker on the page
        if (!confirm("Убрать этот стикер из «Моих»?")) return;
        state.customStickers = state.customStickers.filter((s) => s.id !== sticker.id);
        await setKV("customStickers", state.customStickers);
        renderStickerDrawer();
      });
      b.appendChild(remove);
      row.appendChild(b);
    }
    const add = document.createElement("button");
    add.innerHTML = '<i class="ti ti-plus"></i> Свой стикер';
    add.addEventListener("click", () => $("#customStickerInput").click());
    row.appendChild(add);
  } else {
    const pack = STICKER_PACKS.find((p) => p.id === state.packTab);
    for (const look of pack.items) row.appendChild(stickerButton(look));
  }
}

// How a sticker looks in lists: its picture, or the emoji itself
function stickerFace(look) {
  if (look.src) {
    const img = document.createElement("img");
    img.src = look.src;
    img.alt = "";
    return img;
  }
  const span = document.createElement("span");
  span.textContent = look.emoji;
  return span;
}

function packTab(id, label) {
  const b = document.createElement("button");
  b.append(label);  // text ("Мои") or the first sticker of the pack
  b.classList.toggle("active", id === state.packTab);
  b.addEventListener("click", () => {
    state.packTab = id;
    renderStickerDrawer();
  });
  return b;
}

function stickerButton(look) {
  const b = document.createElement("button");
  b.className = "sticker-btn";
  if (look.src) {
    const img = document.createElement("img");
    img.src = look.src;
    img.alt = "";
    b.appendChild(img);
  } else {
    b.textContent = look.emoji;
  }
  b.addEventListener("click", () => {
    const item = {
      id: uid(),
      type: "sticker",
      x: 0.5 + (Math.random() - 0.5) * 0.2,
      y: 0.45 + (Math.random() - 0.5) * 0.2,
      w: 0.13,
      rot: 0,
      ...look,
    };
    addItem(item);
    state.selectedId = item.id;
    renderItems();
  });
  return b;
}

$("#customStickerInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    const src = await shrinkImage(file, 300, "image/png");
    state.customStickers.push({ id: uid(), src });
    await setKV("customStickers", state.customStickers);
    state.packTab = "custom";
    renderStickerDrawer();
  } catch {
    alert("Не получилось открыть эту картинку.");
  }
});

// ---------- Photos ----------

let pendingPhoto = null;

$("#photoBtn").addEventListener("click", () => $("#photoInput").click());

$("#photoInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  if (isPdfFile(file)) return importPdf(file);  // the same button also takes PDF files
  try {
    pendingPhoto = await shrinkImage(file, 1400, "image/jpeg", 0.85);
  } catch {
    return alert("Не получилось открыть это фото.");
  }
  $("#framePreview1").src = pendingPhoto;
  $("#framePreview0").src = pendingPhoto;
  $("#frameDialog").showModal();
});

$$(".frame-option").forEach((b) => {
  b.addEventListener("click", () => {
    $("#frameDialog").close();
    const frame = b.dataset.frame === "1";
    const item = { id: uid(), type: "photo", src: pendingPhoto, frame, x: 0.5, y: 0.42, w: 0.45, rot: frame ? -3 : 0 };
    pendingPhoto = null;
    addItem(item);
    setTool("items");
    select(item.id);
  });
});
$("#frameCancel").addEventListener("click", () => $("#frameDialog").close());

// ---------- PDF: add PDF pages (lecture slides) and write on them ----------
// We use two free libraries from the internet (loaded only when needed, then kept for offline use):
// PDF.js reads PDF files, html2canvas takes a picture of a page for sharing.

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
const HTML2CANVAS = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => {
      script.remove();
      reject(new Error("Could not load " + src));
    };
    document.head.appendChild(script);
  });
}

let pdfjsReady = null;
function loadPdfJs() {
  if (!pdfjsReady) {
    pdfjsReady = loadScript(PDFJS + "pdf.min.js")
      .then(() => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
        return window.pdfjsLib;
      })
      .catch((err) => {
        pdfjsReady = null;  // try again next time
        throw err;
      });
  }
  return pdfjsReady;
}

const isPdfFile = (file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name);

function showProgress(title, text) {
  $("#progressTitle").textContent = title;
  $("#progressText").textContent = text;
  if (!$("#progressDialog").open) $("#progressDialog").showModal();
}

function hideProgress() {
  if ($("#progressDialog").open) $("#progressDialog").close();
}

// Where a PDF page goes on the diary page (in parts of the page):
// wide slides go to the top, so there is room for notes below; tall pages fill the page
function placePdf(width, height) {
  const ratio = width / height, pageRatio = drawCanvas.width / drawCanvas.height;
  const top = 0.085;  // below the title and the date
  if (ratio > pageRatio) {
    const w = 0.92;
    return { x: 0.04, y: top, w, h: (w * pageRatio) / ratio };
  }
  const h = 0.89;
  const w = (h * ratio) / pageRatio;
  return { x: (1 - w) / 2, y: top, w, h };
}

$("#pdfImportBtn").addEventListener("click", () => $("#pdfInput").click());
$("#pdfInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (file) importPdf(file);
});

// Every page of the PDF becomes a new diary page (after the pages of the same day)
async function importPdf(file) {
  dropSelection();
  await flushSave();
  showProgress("Добавляю PDF", "Открываю файл…");
  try {
    const pdfjs = await loadPdfJs();
    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      isEvalSupported: false,  // safer: never run code from inside a PDF file
    }).promise;
    const date = curPage().date;
    const added = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      showProgress("Добавляю PDF", `Страница ${n} из ${pdf.numPages}`);
      const pdfPage = await pdf.getPage(n);
      const size = pdfPage.getViewport({ scale: 1 });
      const scale = size.width >= size.height ? 1400 / size.width : 1800 / size.height;
      const viewport = pdfPage.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await pdfPage.render({ canvasContext: ctx, viewport }).promise;
      const text = await pdfPage.getTextContent();

      const page = await makePage(date);
      page.order += n;  // keep the PDF pages in their order
      page.layout = null;
      page.pdf = { src: canvas.toDataURL("image/jpeg", 0.85), ...placePdf(canvas.width, canvas.height) };
      page.pdfText = text.items.map((item) => item.str).join(" ").slice(0, 5000);  // for search
      if (n === 1) page.title = file.name.replace(/\.pdf$/i, "").slice(0, 80);
      await DB.put("pages", page);
      state.pages.push(page);
      added.push(page);
      canvas.width = canvas.height = 0;  // free the memory
      pdfPage.cleanup();
    }
    pdf.destroy();
    sortPages();
    hideProgress();
    goTo(state.pages.indexOf(added[0]));
  } catch (err) {
    console.error(err);
    hideProgress();
    alert(navigator.onLine
      ? "Не получилось открыть этот PDF."
      : "Чтобы добавить PDF в первый раз, нужен интернет.");
  }
}

// ---------- Share: the page or the whole notebook as a PDF, or the page as a picture ----------

const EXPORT_W = 600, EXPORT_H = 800, EXPORT_SCALE = 2;  // pages become 1200 × 1600 pictures
let exportFile = null;

let html2canvasReady = null;
function loadHtml2canvas() {
  if (!html2canvasReady) {
    html2canvasReady = loadScript(HTML2CANVAS)
      .then(() => window.html2canvas)
      .catch((err) => {
        html2canvasReady = null;
        throw err;
      });
  }
  return html2canvasReady;
}

// The paper: colour and lines / grid / dots, painted the same way as on the screen
function paintPaper(ctx, page, width, height) {
  ctx.fillStyle = page.paper || PAPERS[0];
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = page.rule || RULES[0];
  const line = width / 24, thick = EXPORT_SCALE;
  if (page.template === "lines" || page.template === "grid") {
    for (let y = line; y <= height + 1; y += line) ctx.fillRect(0, Math.round(y - thick), width, thick);
  }
  if (page.template === "grid") {
    for (let x = line; x <= width + 1; x += line) ctx.fillRect(Math.round(x - thick), 0, thick, height);
  }
  if (page.template === "dots") {
    for (let y = 0; y <= height; y += line) {
      for (let x = 0; x <= width; x += line) {
        ctx.beginPath();
        ctx.arc(x, y, 1.3 * EXPORT_SCALE, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// A picture of one page: the paper, then everything on it (html2canvas draws that part)
async function renderPageImage(page) {
  const html2canvas = await loadHtml2canvas();
  const el = document.createElement("div");
  el.className = "page export-page";
  el.style.setProperty("--pw", EXPORT_W + "px");
  el.style.setProperty("--rule", page.rule || RULES[0]);
  addPageParts(el, page);
  $("#exportStage").appendChild(el);
  try {
    await Promise.all([...el.querySelectorAll("img")].map((img) => img.decode().catch(() => {})));
    if (document.fonts) await document.fonts.ready;
    const front = await html2canvas(el, {
      backgroundColor: null,
      scale: EXPORT_SCALE,
      logging: false,
      ignoreElements: (node) => node.classList?.contains("screen") || node.tagName === "DIALOG",
    });
    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_W * EXPORT_SCALE;
    canvas.height = EXPORT_H * EXPORT_SCALE;
    const ctx = canvas.getContext("2d");
    paintPaper(ctx, page, canvas.width, canvas.height);
    ctx.drawImage(front, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    el.remove();
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), type, quality);
  });
}

// A very small PDF maker: each page is one JPEG picture
function makePdf(images) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let length = 0;
  const add = (data) => {
    const bytes = typeof data === "string" ? encoder.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (number, write) => {
    offsets[number] = length;
    add(`${number} 0 obj\n`);
    write();
    add("\nendobj\n");
  };

  add("%PDF-1.4\n");
  const kids = images.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  object(1, () => add("<< /Type /Catalog /Pages 2 0 R >>"));
  object(2, () => add(`<< /Type /Pages /Kids [${kids}] /Count ${images.length} >>`));
  images.forEach((image, i) => {
    const pageNumber = 3 + i * 3, contentNumber = pageNumber + 1, imageNumber = pageNumber + 2;
    const w = 600, h = Math.round((600 * image.height) / image.width);  // size in points (1/72 inch)
    object(pageNumber, () => add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] ` +
      `/Resources << /XObject << /Im${i} ${imageNumber} 0 R >> >> /Contents ${contentNumber} 0 R >>`));
    const content = `q ${w} 0 0 ${h} 0 0 cm /Im${i} Do Q`;
    object(contentNumber, () => add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    object(imageNumber, () => {
      add(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`);
      add(image.bytes);
      add("\nendstream");
    });
  });

  const count = 3 + images.length * 3;
  const xref = length;
  add(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let n = 1; n < count; n++) add(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  add(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: "application/pdf" });
}

function safeFileName(text) {
  return text.replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 60) || "Дневник";
}

$("#shareBtn").addEventListener("click", () => {
  dropSelection();
  exportFile = null;
  $("#shareStatus").textContent = "";
  $("#shareSend").hidden = true;
  $("#shareDialog").showModal();
});
$("#shareClose").addEventListener("click", () => $("#shareDialog").close());
$$("[data-export]").forEach((b) => b.addEventListener("click", () => prepareExport(b.dataset.export)));

async function prepareExport(kind) {
  await flushSave();
  const status = $("#shareStatus");
  const buttons = $$("[data-export]");
  buttons.forEach((b) => (b.disabled = true));
  $("#shareSend").hidden = true;
  exportFile = null;
  try {
    const page = curPage();
    if (kind === "page-image") {
      status.textContent = "Готовлю картинку…";
      const canvas = await renderPageImage(page);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
      const name = safeFileName(page.title || `${state.nb.title} ${formatDate(page.date)}`);
      exportFile = new File([blob], name + ".jpg", { type: "image/jpeg" });
    } else {
      const pages = kind === "book-pdf" ? state.pages : [page];
      const images = [];
      for (const [i, p] of pages.entries()) {
        status.textContent = `Готовлю PDF: страница ${i + 1} из ${pages.length}`;
        const canvas = await renderPageImage(p);
        const blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
        images.push({ bytes: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height });
      }
      const name = safeFileName(kind === "book-pdf" ? state.nb.title : page.title || `${state.nb.title} ${formatDate(page.date)}`);
      exportFile = new File([makePdf(images)], name + ".pdf", { type: "application/pdf" });
    }
    status.textContent = `Готово: ${exportFile.name}`;
    $("#shareSend").hidden = false;
  } catch (err) {
    console.error(err);
    status.textContent = navigator.onLine
      ? "Не получилось подготовить файл."
      : "Чтобы поделиться в первый раз, нужен интернет.";
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}

// "Отправить" opens the iPad share menu (Telegram, WhatsApp, Instagram, Files...); on a computer it downloads
$("#shareSend").addEventListener("click", async () => {
  if (!exportFile) return;
  if (navigator.canShare && navigator.canShare({ files: [exportFile] })) {
    try {
      await navigator.share({ files: [exportFile], title: exportFile.name });
    } catch (err) {
      if (err.name !== "AbortError") alert("Не получилось отправить файл.");
    }
    return;
  }
  const url = URL.createObjectURL(exportFile);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFile.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});

// ---------- Page layout (template) ----------

$("#templateBtn").addEventListener("click", () => {
  renderPageDesign();
  $("#templateDialog").showModal();
});

function renderPageDesign() {
  const page = curPage();
  const look = { paper: page.paper || PAPERS[0], rule: page.rule || RULES[0] };
  const change = (field, value) => {
    page[field] = value;
    if (field === "layout" && value) page.template = "blank";  // a page template has its own lines
    decoratePage(pageEl, page);
    $("#layout").innerHTML = page.layout ? layoutHTML(page.layout) : "";
    savePageSoon();
    renderPageDesign();
  };
  renderTemplatePicks($("#pageTemplatePick"), page.template, (id) => change("template", id), look);
  renderColors($("#paperPick"), look.paper, (color) => change("paper", color), false, PAPERS);
  renderColors($("#rulePick"), look.rule, (color) => change("rule", color), false, RULES);
  renderLayoutPicks($("#pageLayoutPick"), page.layout || null, (id) => change("layout", id), look);
}
$("#templateClose").addEventListener("click", () => $("#templateDialog").close());

// ---------- Settings and backup ----------

$("#settingsBtn").addEventListener("click", () => {
  $("#settingsName").value = state.profile.name;
  $("#settingsDialog").showModal();
});

$("#settingsSave").addEventListener("click", async () => {
  const name = $("#settingsName").value.trim();
  if (name && name !== state.profile.name) {
    state.profile.name = name;
    await setKV("profile", state.profile);
    renderHome();
  }
  $("#settingsDialog").close();
});

$("#lockNowBtn").addEventListener("click", () => {
  $("#settingsDialog").close();
  showLock("home");
});

$("#exportBtn").addEventListener("click", async () => {
  await flushSave();
  const data = {
    app: "my-diary",
    version: 2,
    exported: new Date().toISOString(),
    profile: state.profile,
    packs: state.packs,
    customStickers: state.customStickers,
    days: state.days,
    notebooks: await DB.all("notebooks"),
    pages: await DB.all("pages"),
  };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `diary-backup-${todayISO()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});

$("#importInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  let data;
  try {
    data = JSON.parse(await file.text());
    if (data.app !== "my-diary" || !Array.isArray(data.notebooks) || !Array.isArray(data.pages)) throw new Error();
  } catch {
    return alert("Это не похоже на резервную копию дневника.");
  }
  if (!confirm(`В копии ${data.notebooks.length} дневн. и ${data.pages.length} стр. Заменить ими всё, что есть сейчас?`)) return;

  await DB.clear("notebooks");
  await DB.clear("pages");
  for (const nb of data.notebooks) await DB.put("notebooks", nb);
  for (const page of data.pages) await DB.put("pages", page);
  for (const key of ["packs", "customStickers", "days"]) {
    if (data[key]) {
      state[key] = data[key];
      await setKV(key, data[key]);
    }
  }
  state.notebooks = data.notebooks;
  $("#settingsDialog").close();
  renderHome();
});

// ---------- Go! ----------

document.addEventListener("gesturestart", (e) => e.preventDefault());  // no pinch-zoom of the whole app

buildKeypad();
buildTextOptions();
renderDrawOptions();
renderTextOptions();
start();

// Offline support: works only on https (GitHub Pages) or localhost
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js");
}
