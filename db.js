// A small helper around IndexedDB: the browser's database on this device.
// It can hold much more than localStorage, which we need for photos and drawings.
// Stores: "kv" (settings: profile, sticker packs...), "notebooks", "pages".

const DB = (() => {
  let dbPromise = null;

  function open() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open("my-diary", 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          db.createObjectStore("kv");
          db.createObjectStore("notebooks", { keyPath: "id" });
          const pages = db.createObjectStore("pages", { keyPath: "id" });
          pages.createIndex("notebookId", "notebookId");
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return dbPromise;
  }

  async function run(storeName, mode, action) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const request = action(tx.objectStore(storeName));
      tx.oncomplete = () => resolve(request ? request.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  return {
    get: (store, key) => run(store, "readonly", (s) => s.get(key)),
    put: (store, value, key) => run(store, "readwrite", (s) => (key === undefined ? s.put(value) : s.put(value, key))),
    del: (store, key) => run(store, "readwrite", (s) => s.delete(key)),
    all: (store) => run(store, "readonly", (s) => s.getAll()),
    byIndex: (store, index, value) => run(store, "readonly", (s) => s.index(index).getAll(value)),
    clear: (store) => run(store, "readwrite", (s) => s.clear()),

    async deleteEverything() {
      (await open()).close();
      dbPromise = null;
      await new Promise((resolve) => {
        const request = indexedDB.deleteDatabase("my-diary");
        request.onsuccess = request.onerror = request.onblocked = () => resolve();
      });
    },
  };
})();

async function kv(key, fallback) {
  const value = await DB.get("kv", key);
  return value === undefined ? fallback : value;
}

function setKV(key, value) {
  return DB.put("kv", value, key);
}
