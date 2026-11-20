import mongoose from "mongoose";
import { ContactInquiry } from "../models/ContactInquiry.js";

const memoryStore = [];

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export async function createInquiryRecord(data) {
  if (isMongoConnected()) {
    const doc = await ContactInquiry.create(data);
    return doc.toObject();
  }

  const now = new Date().toISOString();
  const record = {
    _id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  memoryStore.unshift(record);
  return record;
}

export async function listInquiryRecords({ status, priority, limit = 50 } = {}) {
  if (isMongoConnected()) {
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    return ContactInquiry.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  return memoryStore
    .filter((item) => {
      if (status && item.status !== status) return false;
      if (priority && item.priority !== priority) return false;
      return true;
    })
    .slice(0, limit);
}

export async function updateInquiryStatusRecord(id, status) {
  if (isMongoConnected()) {
    return ContactInquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();
  }

  const target = memoryStore.find((item) => item._id === id);
  if (!target) return null;
  target.status = status;
  target.updatedAt = new Date().toISOString();
  return target;
}

