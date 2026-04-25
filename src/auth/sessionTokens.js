import crypto from "node:crypto";

const SESSION_TOKEN_TTL_MS = 60 * 60 * 1000;

const expiryByToken = new Map();

function removeExpiredTokens() {
  const nowMs = Date.now();
  for (const [issuedToken, expiresAtMs] of expiryByToken) {
    if (nowMs >= expiresAtMs) {
      expiryByToken.delete(issuedToken);
    }
  }
}

setInterval(removeExpiredTokens, 10 * 60 * 1000).unref?.();

export function issueSessionToken() {
  removeExpiredTokens();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAtMs = Date.now() + SESSION_TOKEN_TTL_MS;
  expiryByToken.set(token, expiresAtMs);
  return {
    token,
    expiresAt: new Date(expiresAtMs).toISOString(),
    expiresInSeconds: Math.floor(SESSION_TOKEN_TTL_MS / 1000),
  };
}

export function isSessionTokenValid(candidateToken) {
  if (!candidateToken || typeof candidateToken !== "string") return false;
  removeExpiredTokens();
  const expiresAtMs = expiryByToken.get(candidateToken);
  if (expiresAtMs === undefined) return false;
  if (Date.now() >= expiresAtMs) {
    expiryByToken.delete(candidateToken);
    return false;
  }
  return true;
}
