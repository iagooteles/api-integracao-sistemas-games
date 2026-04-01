import { Router } from "express";
import { db, list, findById, create, update, remove } from "../store/jsonStore.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();
const resource = db.games;

const FIELDS = [
  "title",
  "genre",
  "releaseYear",
  "price",
  "platform",
  "publisherId",
  "metacriticScore",
];

router.get("/", (_req, res) => {
  res.json(list(resource));
});

router.get("/:id", (req, res) => {
  const item = findById(resource, req.params.id);
  if (!item) return res.status(404).json({ error: "Game não encontrado" });
  res.json(item);
});

router.post("/", requireFields(FIELDS), async (req, res, next) => {
  try {
    const {
      title,
      genre,
      releaseYear,
      price,
      platform,
      publisherId,
      metacriticScore,
    } = req.body;
    const record = await create(resource, {
      title: String(title).trim(),
      genre: String(genre).trim(),
      releaseYear: Number(releaseYear),
      price: Number(price),
      platform: String(platform).trim(),
      publisherId: Number(publisherId),
      metacriticScore: Number(metacriticScore),
    });
    res.status(201).json(record);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = findById(resource, req.params.id);
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
    const updated = await update(resource, req.params.id, patch);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const ok = await remove(resource, req.params.id);
    if (!ok) return res.status(404).json({ error: "Game não encontrado" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
