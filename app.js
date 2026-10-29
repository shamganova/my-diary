// My Diary, version 1.
// Screens: splash → welcome (first time) or lock (password) → home → notebook.
// All data is saved on this device in IndexedDB (see db.js).

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// ---------- Settings you can change ----------

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

const COVERS = [
  { id: "rose", bg: "#F4C0D1", ink: "#72243E", pattern: "plain" },
  { id: "sky", bg: "#B5D4F4", ink: "#0C447C", pattern: "dots" },
  { id: "sage", bg: "#C0DD97", ink: "#27500A", pattern: "plain" },
  { id: "sand", bg: "#FAEEDA", ink: "#633806", pattern: "stripes" },
  { id: "lavender", bg: "#CECBF6", ink: "#3C3489", pattern: "dots" },
  { id: "peach", bg: "#F5C4B3", ink: "#712B13", pattern: "stripes" },
  { id: "mint", bg: "#9FE1CB", ink: "#085041", pattern: "grid" },
  { id: "night", bg: "#2C2C2A", ink: "#F1EFE8", pattern: "dots" },
];

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
  { title: "Личный дневник", cover: "rose", template: "lines" },
  { title: "Планер", cover: "sand", template: "grid" },
  { title: "Скетчбук", cover: "lavender", template: "blank" },
  { title: "Учёба", cover: "sky", template: "dots" },
  { title: "Путешествия", cover: "sage", template: "dots" },
];

const COLORS = ["#2b2730", "#8d8288", "#d4537e", "#f08a3c", "#e3b31b", "#46a874", "#3f86d0", "#8a5cd1"];

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

const TOOL_ICONS = { draw: "ti-pencil", text: "ti-typography", erase: "ti-eraser", items: "ti-sticker" };

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
  eraserSize: 40,
  font: 0,
  fontSize: 1,
  textColor: COLORS[0],
  selectedId: null,       // selected sticker / photo / text
  calMonth: new Date(),
  packTab: null,
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
    kv("packs", ["flowers", "mood", "weather"]),
    kv("customStickers", []),
    kv("days", []),
  ]);
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
    flushSave();
  } else if (state.profile && hiddenAt && Date.now() - hiddenAt > 60_000 &&
             (currentScreen === "home" || currentScreen === "notebook")) {
    showLock(currentScreen);
  }
});
window.addEventListener("pagehide", flushSave);

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
  const look = COVERS.find((c) => c.id === coverId) || COVERS[0];
  const card = document.createElement("div");
  card.className = "nb";
  card.style.setProperty("--cover", look.bg);
  card.style.setProperty("--cover-ink", look.ink);

  const cover = document.createElement("button");
  cover.className = `cover pattern-${look.pattern}`;
  cover.textContent = title;
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
    const face = document.createElement("span");
    face.className = "pack-face";
    face.textContent = pack.items[0];
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
  for (const sticker of pack.items) {
    const cell = document.createElement("div");
    cell.textContent = sticker;
    grid.appendChild(cell);
  }
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
  pickedCover = nb ? nb.cover : COVERS[0].id;
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
    b.className = `cover pick-cover pattern-${look.pattern}` + (look.id === pickedCover ? " picked" : "");
    b.style.setProperty("--cover", look.bg);
    b.style.setProperty("--cover-ink", look.ink);
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
  await flushSave();
  const page = await makePage(date);
  state.pages.push(page);
  sortPages();
  goTo(state.pages.indexOf(page));
}

async function goTo(index) {
  await flushSave();
  state.current = clamp(index, 0, state.pages.length - 1);
  renderPage();
}

$("#prevPage").addEventListener("click", () => goTo(state.current - 1));
$("#nextPage").addEventListener("click", () => goTo(state.current + 1));
$("#addPageBtn").addEventListener("click", () => addPage(todayISO()));

$("#deletePageBtn").addEventListener("click", async () => {
  if (!confirm("Удалить эту страницу?")) return;
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
    stroke = null;
    lctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
    undoStack.pop();
    paintDrawing(curPage().drawing);  // undo what the eraser did, too
  }
  if (drag) {
    drag = null;
    savePageSoon();
  }
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

// Change the date of a page (tap the date in the top right corner)
$("#dateInput").addEventListener("change", (e) => {
  const page = curPage();
  if (!e.target.value) return;
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
    const { tool, brush, brushes, color, smooth, eraserSize, font, fontSize, textColor } = state;
    setKV("tools", { tool, brush, brushes, color, smooth, eraserSize, font, fontSize, textColor });
  }, 500);
}

// ---------- Sidebar: calendar and page thumbnails ----------

function renderSidebar() {
  renderCalendar();
  renderThumbs();
}

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
  state.pages.forEach((page, i) => {
    const thumb = document.createElement("button");
    thumb.className = "thumb" + (i === state.current ? " current" : "");
    thumb.appendChild(buildMiniPage(page));
    const d = parseISO(page.date);
    thumb.append(`${d.getDate()} ${MONTHS[d.getMonth()]}`);
    thumb.addEventListener("click", () => goTo(i));
    box.appendChild(thumb);
  });
  box.querySelector(".current")?.scrollIntoView({ block: "nearest" });
}

// A small copy of a page: template + drawing + stickers, photos and text
function buildMiniPage(page) {
  const mini = document.createElement("div");
  mini.className = "page mini-page";
  decoratePage(mini, page);
  mini.appendChild(layoutElement(page.layout));
  if (page.drawing) {
    const img = document.createElement("img");
    img.className = "drawing";
    img.src = page.drawing;
    mini.appendChild(img);
  }
  const items = document.createElement("div");
  items.className = "items";
  for (const item of page.items) items.appendChild(buildItem(item));
  mini.appendChild(items);
  return mini;
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
  $("#sizeRange").value = state.brushes[state.brush].size;
  $("#opacityRange").value = state.brushes[state.brush].opacity;
  $("#smoothRange").value = state.smooth;
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
  input.value = chosen;
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
let undoStack = [];
let redoStack = [];
let paintToken = 0;

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
  ctx.strokeStyle = state.color;
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
    const size = state.brushes[state.brush].size;
    ctx.strokeStyle = state.color;
    if (state.brush === "pen") ctx.lineWidth = size * (0.35 + to.p * 1.3);
    if (state.brush === "pencil") {
      ctx.lineWidth = size * (0.4 + to.p * 0.8);
      ctx.strokeStyle = pencilPattern(state.color);
    }
    if (state.brush === "marker") ctx.lineWidth = size * 1.6;
    if (state.brush === "highlighter") ctx.lineWidth = size * 3;
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
  pageEl.setPointerCapture(e.pointerId);
  undoStack.push(curPage().drawing);
  if (undoStack.length > 30) undoStack.shift();
  redoStack = [];

  const point = canvasPoint(e);
  stroke = { pointerId: e.pointerId, erase: state.tool === "erase", smooth: point, raw: point };
  if (!stroke.erase) {
    // The live line is drawn fully opaque; opacity is added when it is finished, so overlaps don't get darker
    liveCanvas.style.opacity = state.brushes[state.brush].opacity / 100;
    liveCanvas.style.mixBlendMode = state.brush === "highlighter" ? "multiply" : "normal";
  }
  drawSegment(point, point);
}

function moveStroke(e) {
  if (!stroke || e.pointerId !== stroke.pointerId) return;
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
  }
}

function endStroke(e) {
  if (!stroke || e.pointerId !== stroke.pointerId) return;
  drawSegment(stroke.smooth, stroke.raw);  // finish the line exactly where the pen stopped
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
  if (undoStack.length === 0) return;
  redoStack.push(curPage().drawing);
  curPage().drawing = undoStack.pop();
  paintDrawing(curPage().drawing);
  savePageSoon();
});
$("#redoBtn").addEventListener("click", () => {
  if (redoStack.length === 0) return;
  undoStack.push(curPage().drawing);
  curPage().drawing = redoStack.pop();
  paintDrawing(curPage().drawing);
  savePageSoon();
});

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
  pageEl.setPointerCapture(e.pointerId);
}

// Pull the circle away from the centre: bigger; towards it: smaller
function startResize(e, el) {
  e.preventDefault();
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
  pageEl.setPointerCapture(e.pointerId);
}

// Two fingers: spread to make bigger, pinch to make smaller, twist to rotate
function startPinch(e) {
  e.preventDefault();
  pageEl.setPointerCapture(e.pointerId);
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
  if (e.target.closest(".page-date")) return;
  if (state.tool === "draw" || state.tool === "erase") return startStroke(e);
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
});
for (const type of ["pointerup", "pointercancel"]) {
  pageEl.addEventListener(type, (e) => {
    touches.delete(e.pointerId);
    endStroke(e);
    endDrag(e);
  });
}

$("#itemTools").addEventListener("click", (e) => {
  const button = e.target.closest("button");
  const item = findItem(state.selectedId);
  if (!button || !item) return;
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
  if (state.tool !== "text" || e.target.closest(".item.text") || e.target.closest(".page-date")) return;
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
  curPage().items.push(item);
  renderItems();
  itemsEl.querySelector(`[data-id="${item.id}"]`).focus();
});

itemsEl.addEventListener("focusin", (e) => {
  const el = e.target.closest(".item.text");
  if (el) activeTextId = el.dataset.id;
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

  for (const pack of packs) tabs.appendChild(packTab(pack.id, pack.items[0]));
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
    for (const emoji of pack.items) row.appendChild(stickerButton({ emoji }));
  }
}

function packTab(id, label) {
  const b = document.createElement("button");
  b.textContent = label;
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
