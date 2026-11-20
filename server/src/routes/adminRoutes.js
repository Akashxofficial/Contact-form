import { Router } from "express";
import rateLimit from "express-rate-limit";
import { adminLoginSchema } from "../validators/inquiryValidator.js";
import {
  createAdminSessionToken,
  getSessionCookieOptions,
  parseCookies,
  SESSION_COOKIE_NAME,
  verifyAdminPasskey,
  verifyAdminSessionToken,
} from "../middleware/security.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

router.post("/login", loginLimiter, (req, res) => {
  if (!process.env.ADMIN_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "Admin access is not configured on this server.",
    });
  }

  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid credentials.",
    });
  }

  if (!verifyAdminPasskey(parsed.data.passkey)) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin passkey.",
    });
  }

  const token = createAdminSessionToken();
  res.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

  return res.json({
    success: true,
    authenticated: true,
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res.json({ success: true, authenticated: false });
});

router.get("/session", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const session = verifyAdminSessionToken(cookies[SESSION_COOKIE_NAME]);
  return res.json({
    success: true,
    authenticated: Boolean(session && session.role === "admin"),
  });
});

export default router;
