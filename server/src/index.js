import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studio_noire_realestate";

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("Connected to MongoDB.");
  } catch (err) {
    console.warn(
      "MongoDB unavailable at startup — running with in-memory fallback:",
      err.message
    );
  }

  if (!process.env.ADMIN_API_KEY) {
    console.warn(
      "ADMIN_API_KEY is not set — Lead Inbox admin endpoints will reject logins until configured."
    );
  }

  const app = createApp();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
