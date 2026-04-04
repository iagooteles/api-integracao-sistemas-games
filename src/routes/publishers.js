import { Router } from "express";
import { db, list, findById, create, update, remove } from "../store/jsonStore.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();
const resource = db.publishers;

const FIELDS = [
  "name",
  "country",
  "foundedYear",
  "website",
  "headquarters",
  "isIndie",
];

router.get("/", (_req, res) => {
  res.json(list(resource));
});

router.get("/:id", (req, res) => {
  const item = findById(resource, req.params.id);
  if (!item) return res.status(404).json({ error: "Publisher não encontrado" });
  res.json(item);
});

router.post("/", requireFields(FIELDS), async (req, res, next) => {
  try {
    const { name, country, foundedYear, website, headquarters, isIndie } = req.body;
    const record = await create(resource, {
      name: String(name).trim(),
      country: String(country).trim(),
      foundedYear: Number(foundedYear),
      website: String(website).trim(),
      headquarters: String(headquarters).trim(),
      isIndie: Boolean(isIndie),
    });
    res.status(201).json(record);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = findById(resource, req.params.id);
    if (!existing) return res.status(404).json({ error: "Publisher não encontrado" });
    const patch = {};
    if (req.body.name !== undefined) patch.name = String(req.body.name).trim();
    if (req.body.country !== undefined) patch.country = String(req.body.country).trim();
    if (req.body.foundedYear !== undefined) patch.foundedYear = Number(req.body.foundedYear);
    if (req.body.website !== undefined) patch.website = String(req.body.website).trim();
    if (req.body.headquarters !== undefined)
      patch.headquarters = String(req.body.headquarters).trim();
    if (req.body.isIndie !== undefined) patch.isIndie = Boolean(req.body.isIndie);
    const updated = await update(resource, req.params.id, patch);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const ok = await remove(resource, req.params.id);
    if (!ok) return res.status(404).json({ error: "Publisher não encontrado" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;