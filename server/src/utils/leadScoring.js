import crypto from "node:crypto";

const BUDGET_WEIGHTS = {
  ">₹1 Crore": 42,
  "₹50 Lakhs-₹1 Crore": 30,
  "<₹50 Lakhs": 18,
  "Prefer not to disclose": 12,
};

const TIMELINE_WEIGHTS = {
  "With in 1 Month": 35,
  "1-3 Months": 24,
  "6-12 Months": 12,
};

export function computeLeadQualification(payload) {
  let score = 0;

  score += BUDGET_WEIGHTS[payload.budgetRange] ?? 12;
  score += TIMELINE_WEIGHTS[payload.timeline] ?? 12;

  if (payload.purposeOfPurchase === "Investment") {
    score += 8;
  } else {
    score += 5;
  }

  if (payload.phone && payload.phone.replace(/\D/g, "").length >= 8) {
    score += 8;
  }

  if (
    payload.referralSource === "Channel Partner" ||
    payload.referralSource === "Employee Referral" ||
    payload.referralSource?.includes("Referral from")
  ) {
    score += 7;
  }

  const clamped = Math.min(100, Math.max(0, score));
  let priority = "standard";
  if (clamped >= 70) {
    priority = "high";
  } else if (clamped >= 45) {
    priority = "medium";
  }

  return { leadScore: clamped, priority };
}

export function generateReferenceCode() {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `UG-${year}-${suffix}`;
}
