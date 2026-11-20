import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// Ephemeral fallback ensures no hardcoded secret exists if env var is omitted.
const EPHEMERAL_SESSION_SECRET = crypto.randomBytes(32).toString("hex");

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || EPHEMERAL_SESSION_SECRET;
}

function sha256Buffer(value) {
  return crypto.createHash("sha256").update(String(value)).digest();
}

export function stripUnsafeKeys(value) {
  if (Array.isArray(value)) {
    return value.map(stripUnsafeKeys);
  }
  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      clean[key] = stripUnsafeKeys(val);
    }
    return clean;
  }
  return value;
}

export function sanitizeNoSqlInput(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = stripUnsafeKeys(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = stripUnsafeKeys(req.query);
  }
  next();
}

export function verifyAdminPasskey(candidate) {
  const configured = process.env.ADMIN_API_KEY;
  if (!configured || typeof candidate !== "string" || candidate.length === 0) {
    return false;
  }
  return crypto.timingSafeEqual(
    sha256Buffer(candidate),
    sha256Buffer(configured)
  );
}

export function createAdminSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Date.now() + SESSION_TTL_MS,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) {
    return null;
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    if (!parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader = "") {
  const cookies = {};
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(val);
  }
  return cookies;
}

export function requireAdminAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  const session = verifyAdminSessionToken(sessionToken);

  if (session && session.role === "admin") {
    req.admin = session;
    return next();
  }

  const headerKey = req.headers["x-admin-key"];
  if (typeof headerKey === "string" && verifyAdminPasskey(headerKey)) {
    req.admin = { role: "admin" };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Admin authentication required.",
  });
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  };
}

export { SESSION_COOKIE_NAME };
