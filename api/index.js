import mongoose from "mongoose";
import { createApp } from "../server/src/app.js";

const app = createApp();
let dbConnectPromise = null;

async function ensureDbConnection() {
  if (!process.env.MONGO_URI) {
    return;
  }
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!dbConnectPromise) {
    dbConnectPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .catch((err) => {
        dbConnectPromise = null;
        console.warn("MongoDB connection failed in serverless handler:", err.message);
      });
  }
  await dbConnectPromise;
}

export default async function handler(req, res) {
  await ensureDbConnection();
  return app(req, res);
}
