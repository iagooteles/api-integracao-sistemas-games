import { Router } from "express";
import { db, list, findById, create, update, remove } from "../store/jsonStore.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();
const resource = db.achievements;

const FIELDS = ["title", "description", "points", "rarity", "gameId", "secret"];

router.get("/", (_req, res) => {
  res.json(list(resource));
});

router.get("/:id", (req, res) => {
  const item = findById(resource, req.params.id);
  if (!item) return res.status(404).json({ error: "Achievement não encontrado" });
  res.json(item);
});

router.post("/", requireFields(FIELDS), async (req, res, next) => {
  try {
    const { title, description, points, rarity, gameId, secret } = req.body;
    const record = await create(resource, {
      title: String(title).trim(),
      description: String(description).trim(),
      points: Number(points),
      rarity: String(rarity).trim(),
      gameId: Number(gameId),
      secret: Boolean(secret),
    });
    res.status(201).json(record);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = findById(resource, req.params.id);
    if (!existing) return res.status(404).json({ error: "Achievement não encontrado" });
    const patch = {};
    if (req.body.title !== undefined) patch.title = String(req.body.title).trim();
    if (req.body.description !== undefined)
      patch.description = String(req.body.description).trim();
    if (req.body.points !== undefined) patch.points = Number(req.body.points);
    if (req.body.rarity !== undefined) patch.rarity = String(req.body.rarity).trim();
    if (req.body.gameId !== undefined) patch.gameId = Number(req.body.gameId);
    if (req.body.secret !== undefined) patch.secret = Boolean(req.body.secret);
    const updated = await update(resource, req.params.id, patch);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const ok = await remove(resource, req.params.id);
    if (!ok) return res.status(404).json({ error: "Achievement não encontrado" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
