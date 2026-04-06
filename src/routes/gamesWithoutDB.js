import { Router } from "express";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();

const items = [];
let nextId = 1;

const FIELDS = [
  "title",
  "genre",
  "releaseYear",
  "price",
  "platform",
  "publisherId",
  "metacriticScore",
];

function findById(id) {
  const numId = Number(id);
  return items.find((row) => row.id === numId) ?? null;
}

router.get("/", (_req, res) => {
  res.json([...items]);
});

router.get("/:id", (req, res) => {
  const row = findById(req.params.id);
  if (!row) return res.status(404).json({ error: "Game não encontrado" });
  res.json(row);
});

router.post("/", requireFields(FIELDS), (req, res) => {
  const {
    title,
    genre,
    releaseYear,
    price,
    platform,
    publisherId,
    metacriticScore,
  } = req.body;
  const record = {
    id: nextId++,
    title: String(title).trim(),
    genre: String(genre).trim(),
    releaseYear: Number(releaseYear),
    price: Number(price),
    platform: String(platform).trim(),
    publisherId: Number(publisherId),
    metacriticScore: Number(metacriticScore),
  };
  items.push(record);
  res.status(201).json(record);
});

router.put("/:id", (req, res) => {
  const existing = findById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Game não encontrado" });
  const patch = {};
  for (const key of FIELDS) {
    if (req.body[key] !== undefined) {
      if (["releaseYear", "price", "publisherId", "metacriticScore"].includes(key)) {
        patch[key] = Number(req.body[key]);
      } else {
        patch[key] = String(req.body[key]).trim();
      }
    }
  }
  const numericId = Number(req.params.id);
  const updated = { ...existing, ...patch, id: numericId };
  const index = items.findIndex((row) => row.id === numericId);
  items[index] = updated;
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const numericId = Number(req.params.id);
  const index = items.findIndex((row) => row.id === numericId);
  if (index === -1) return res.status(404).json({ error: "Game não encontrado" });
  items.splice(index, 1);
  res.status(204).send();
});

export default router;
