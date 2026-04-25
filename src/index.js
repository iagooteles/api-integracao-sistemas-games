import "dotenv/config";
import express from "express";
import { initJsonStore } from "./store/jsonStore.js";
import { issueSessionToken } from "./auth/sessionTokens.js";
import { requireBearerToken } from "./middleware/authBearer.js";
import authRouter from "./routes/auth.js";
import gamesRouter from "./routes/games.js";
import usersRouter from "./routes/users.js";
import achievementsRouter from "./routes/achievements.js";
import publishersRouter from "./routes/publishers.js";

await initJsonStore().catch((err) => {
  console.error("Falha ao carregar storage JSON:", err);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/", requireBearerToken, (_req, res) => {
  res.json({
    name: "API Games",
    version: "1.0.0",
    auth: {
      issueToken: "POST /api/auth/token (público; gera token válido por 1 hora)",
      usage: "Authorization: Bearer <token>",
    },
    endpoints: {
      games: "/api/games",
      users: "/api/users",
      achievements: "/api/achievements",
      publishers: "/api/publishers",
    },
  });
});

app.use("/api", requireBearerToken);
app.use("/api/games", gamesRouter);
app.use("/api/users", usersRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/publishers", publishersRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno ao acessar o armazenamento" });
});

app.listen(PORT, () => {
  const boot = issueSessionToken();
  console.log(`Servidor em http://localhost:${PORT}`);
  console.log(
    "Token gerado automaticamente (válido 1h; copie e use em Authorization: Bearer …):"
  );
  console.log(boot.token);
  console.log(`Expira em (ISO): ${boot.expiresAt}`);
});
