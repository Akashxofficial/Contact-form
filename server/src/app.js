import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { isMongoConnected } from "./storage/inquiryRepository.js";
import { sanitizeNoSqlInput } from "./middleware/security.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://flagcdn.com"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      referrerPolicy: { policy: "no-referrer" },
    })
  );

  const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
    : [
        "http://localhost:3000",
        "http://192.168.1.47:3000",
        "http://localhost:3001",
        "http://192.168.1.47:3001",
      ];

  app.use(
    cors({
      origin(origin, callback) {
        const vercelOrigin = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : null;
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          (vercelOrigin && origin === vercelOrigin) ||
          /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
          (process.env.NODE_ENV !== "production" &&
            /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/i.test(origin))
        ) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    })
  );

  app.use(express.json({ limit: "64kb" }));
  app.use(sanitizeNoSqlInput);

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  });
  app.use("/api", apiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      storage: isMongoConnected() ? "mongodb" : "memory-fallback",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/admin", adminRoutes);
  app.use("/api/inquiries", inquiryRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Endpoint not found.",
    });
  });

  app.use((err, req, res, _next) => {
    const status = err.status || 500;
    console.error(
      `[Server Error] ${req.method} ${req.path} -> ${status}: ${
        err.message || "Unexpected error"
      }`
    );
    res.status(status).json({
      success: false,
      message:
        status >= 500
          ? "Internal server error."
          : err.message || "Request failed.",
    });
  });

  return app;
}
