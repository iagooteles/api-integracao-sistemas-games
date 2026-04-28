import { Router } from "express";
import { issueSessionToken } from "../auth/sessionTokens.js";
import { hashPassword, verifyPassword } from "../auth/passwords.js";
import { db, create, findByEmail, list } from "../store/jsonStore.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();
const resource = db.users;

function uniqueUsernameFromEmail(email) {
  const localPart = email.split("@")[0] || "user";
  const base =
    localPart.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "user";
  const existing = list(resource);
  const taken = new Set(existing.map((u) => u.username));
  let username = base;
  let n = 0;
  while (taken.has(username)) {
    n += 1;
    username = `${base}${n}`;
  }
  return username;
}

router.post("/register", requireFields(["email", "password"]), async (req, res, next) => {
  try {
    const email = String(req.body.email).trim().toLowerCase();
    const password = String(req.body.password);
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }
    if (findByEmail(resource, email)) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    const passwordHash = hashPassword(password);
    const record = await create(resource, {
      name: email.split("@")[0] || "Usuário",
      email,
      username: uniqueUsernameFromEmail(email),
      country: "",
      birthDate: "",
      bio: "",
      passwordHash,
    });
    const { passwordHash: _ph, ...safe } = record;
    res.status(201).json(safe);
  } catch (e) {
    next(e);
  }
});

router.post("/login", requireFields(["email", "password"]), async (req, res, next) => {
  try {
    const email = String(req.body.email).trim().toLowerCase();
    const password = String(req.body.password);
    const user = findByEmail(resource, email);
    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }
    const { token, expiresAt, expiresInSeconds } = issueSessionToken();
    res.json({
      token,
      expiresAt,
      expiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
