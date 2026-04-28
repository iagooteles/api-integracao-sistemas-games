import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = join(__dirname, "..", "..", "storage");

const RESOURCE_KEYS = ["games", "users", "achievements", "publishers"];

const inMemoryCollections = new Map();

function jsonPathForResource(resourceKey) {
  return join(STORAGE_DIR, `${resourceKey}.json`);
}

function coercePersistedShape(parsed) {
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  const storedNextId =
    typeof parsed?.nextId === "number" && parsed.nextId >= 1 ? parsed.nextId : 1;
  const highestExistingId = items.reduce(
    (max, row) => Math.max(max, Number(row?.id) || 0),
    0
  );
  const nextId = Math.max(storedNextId, highestExistingId + 1);
  
  return { items, nextId };
}

async function readCollectionFromDiskOrSeedEmpty(resourceKey) {
  await mkdir(STORAGE_DIR, { recursive: true });
  const filePath = jsonPathForResource(resourceKey);
  try {
    const raw = await readFile(filePath, "utf8");
    return coercePersistedShape(JSON.parse(raw));
  } catch (error) {
    if (error.code === "ENOENT") {
      const empty = { items: [], nextId: 1 };
      await writeFile(filePath, JSON.stringify(empty, null, 2), "utf8");
      return empty;
    }
    throw error;
  }
}

async function writeCollectionToDisk(resourceKey) {
  const collection = getLoadedCollection(resourceKey);
  await writeFile(
    jsonPathForResource(resourceKey),
    JSON.stringify({ items: collection.items, nextId: collection.nextId }, null, 2),
    "utf8"
  );
}

function getLoadedCollection(resourceKey) {
  const collection = inMemoryCollections.get(resourceKey);
  if (!collection) {
    throw new Error(`Store não inicializado para "${resourceKey}".`);
  }
  return collection;
}

export async function initJsonStore() {
  for (const resourceKey of RESOURCE_KEYS) {
    const collection = await readCollectionFromDiskOrSeedEmpty(resourceKey);
    inMemoryCollections.set(resourceKey, collection);
  }
}

export const db = {
  games: "games",
  users: "users",
  achievements: "achievements",
  publishers: "publishers",
};

export function list(resourceKey) {
  const collection = getLoadedCollection(resourceKey);

  return [...collection.items];
}

export function findById(resourceKey, id) {
  const collection = getLoadedCollection(resourceKey);
  const numericId = Number(id);

  return collection.items.find((row) => row.id === numericId) ?? null;
}

export function findByEmail(resourceKey, email) {
  const collection = getLoadedCollection(resourceKey);
  const normalized = String(email).trim().toLowerCase();
  return (
    collection.items.find(
      (row) => String(row.email ?? "").trim().toLowerCase() === normalized
    ) ?? null
  );
}

export async function create(resourceKey, payload) {
  const collection = getLoadedCollection(resourceKey);
  const id = collection.nextId++;
  const record = { id, ...payload };
  collection.items.push(record);
  await writeCollectionToDisk(resourceKey);

  return record;
}

export async function update(resourceKey, id, partial) {
  const collection = getLoadedCollection(resourceKey);
  const numericId = Number(id);
  const index = collection.items.findIndex((row) => row.id === numericId);
  if (index === -1) return null;
  const merged = { ...collection.items[index], ...partial, id: numericId };
  collection.items[index] = merged;
  await writeCollectionToDisk(resourceKey);

  return merged;
}

export async function remove(resourceKey, id) {
  const collection = getLoadedCollection(resourceKey);
  const numericId = Number(id);
  const index = collection.items.findIndex((row) => row.id === numericId);
  if (index === -1) return false;
  collection.items.splice(index, 1);
  await writeCollectionToDisk(resourceKey);

  return true;
}
