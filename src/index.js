import express from "express";
import { initJsonStore } from "./store/jsonStore.js";
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

app.get("/", (_req, res) => {
  res.json({
    name: "API Games",
    version: "1.0.0",
    endpoints: {
      games: "/api/games",
      users: "/api/users",
      achievements: "/api/achievements",
      publishers: "/api/publishers",
    },
  });
});

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
  console.log(`Servidor em http://localhost:${PORT}`);
});
