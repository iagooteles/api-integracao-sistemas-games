import { Router } from "express";
import { issueSessionToken } from "../auth/sessionTokens.js";

const router = Router();

router.post("/token", (_req, res) => {
  const body = issueSessionToken();
  res.status(201).json(body);
});

export default router;
