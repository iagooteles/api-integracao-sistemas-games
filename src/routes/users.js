import { Router } from "express";
import { db, list, findById, create, update, remove } from "../store/jsonStore.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();
const resource = db.users;

const FIELDS = ["name", "email", "username", "country", "birthDate", "bio"];

function withoutPassword(row) {
  if (!row) return row;
  const { passwordHash, ...rest } = row;
  return rest;
}

router.get("/", (_req, res) => {
  res.json(list(resource).map(withoutPassword));
});

router.get("/:id", (req, res) => {
  const item = findById(resource, req.params.id);
  if (!item) return res.status(404).json({ error: "User não encontrado" });
  res.json(withoutPassword(item));
});

router.post("/", requireFields(FIELDS), async (req, res, next) => {
  try {
    const { name, email, username, country, birthDate, bio } = req.body;
    const record = await create(resource, {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      username: String(username).trim(),
      country: String(country).trim(),
      birthDate: String(birthDate).trim(),
      bio: String(bio).trim(),
    });
    res.status(201).json(withoutPassword(record));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = findById(resource, req.params.id);
    if (!existing) return res.status(404).json({ error: "User não encontrado" });
    const patch = {};
    for (const key of FIELDS) {
      if (req.body[key] !== undefined) {
        let v = req.body[key];
        if (key === "email") v = String(v).trim().toLowerCase();
        else if (typeof v === "string") v = String(v).trim();
        patch[key] = v;
      }
    }
    const updated = await update(resource, req.params.id, patch);
    res.json(withoutPassword(updated));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const ok = await remove(resource, req.params.id);
    if (!ok) return res.status(404).json({ error: "User não encontrado" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
