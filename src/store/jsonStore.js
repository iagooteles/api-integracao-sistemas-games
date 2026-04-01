import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = join(__dirname, "..", "..", "storage");

const RESOURCES = ["games", "users", "achievements", "publishers"];
const cache = new Map();

function pathFor(name) {
  return join(STORAGE_DIR, `${name}.json`);
}

function normalizeCollection(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const storedNext = typeof data?.nextId === "number" && data.nextId >= 1 ? data.nextId : 1;
  const maxId = items.reduce((m, i) => Math.max(m, Number(i?.id) || 0), 0);
  const nextId = Math.max(storedNext, maxId + 1);
  return { items, nextId };
}

async function loadOrCreateFile(name) {
  await mkdir(STORAGE_DIR, { recursive: true });
  const p = pathFor(name);
  try {
    const raw = await readFile(p, "utf8");
    return normalizeCollection(JSON.parse(raw));
  } catch (e) {
    if (e.code === "ENOENT") {
      const empty = { items: [], nextId: 1 };
      await writeFile(p, JSON.stringify(empty, null, 2), "utf8");
      return empty;
    }
    throw e;
  }
}

async function persist(name) {
  const col = getCollection(name);
  await writeFile(
    pathFor(name),
    JSON.stringify({ items: col.items, nextId: col.nextId }, null, 2),
    "utf8"
  );
}

function getCollection(name) {
  const col = cache.get(name);
  if (!col) throw new Error(`Store não inicializado para "${name}". Chame initJsonStore() antes do servidor.`);
  return col;
}

export async function initJsonStore() {
  for (const name of RESOURCES) {
    const col = await loadOrCreateFile(name);
    cache.set(name, col);
  }
}

/** Chaves dos arquivos em storage/{nome}.json */
export const db = {
  games: "games",
  users: "users",
  achievements: "achievements",
  publishers: "publishers",
};

export function list(resource) {
  const col = getCollection(resource);
  return [...col.items];
}

export function findById(resource, id) {
  const col = getCollection(resource);
  const numId = Number(id);
  return col.items.find((item) => item.id === numId) ?? null;
}

export async function create(resource, data) {
  const col = getCollection(resource);
  const id = col.nextId++;
  const record = { id, ...data };
  col.items.push(record);
  await persist(resource);
  return record;
}

export async function update(resource, id, data) {
  const col = getCollection(resource);
  const numId = Number(id);
  const index = col.items.findIndex((item) => item.id === numId);
  if (index === -1) return null;
  const updated = { ...col.items[index], ...data, id: numId };
  col.items[index] = updated;
  await persist(resource);
  return updated;
}

export async function remove(resource, id) {
  const col = getCollection(resource);
  const numId = Number(id);
  const index = col.items.findIndex((item) => item.id === numId);
  if (index === -1) return false;
  col.items.splice(index, 1);
  await persist(resource);
  return true;
}
