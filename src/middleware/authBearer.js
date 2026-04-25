import { isSessionTokenValid } from "../auth/sessionTokens.js";

export function requireBearerToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || typeof auth !== "string" || !auth.startsWith("Bearer ")) {
    res.set("WWW-Authenticate", 'Bearer realm="api"');
    return res.status(401).json({
      error: "Autenticação necessária",
      message: "Envie o header Authorization: Bearer <token>",
    });
  }

  const token = auth.slice("Bearer ".length).trim();
  if (!isSessionTokenValid(token)) {
    res.set("WWW-Authenticate", 'Bearer realm="api"');
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }

  next();
}
