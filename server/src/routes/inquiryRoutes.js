import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getInquiries,
  submitInquiry,
  updateInquiryStatus,
} from "../controllers/inquiryController.js";
import { requireAdminAuth } from "../middleware/security.js";

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions from this IP. Please try again shortly.",
  },
});

router.post("/", submitLimiter, submitInquiry);
router.get("/", requireAdminAuth, getInquiries);
router.patch("/:id/status", requireAdminAuth, updateInquiryStatus);

export default router;
