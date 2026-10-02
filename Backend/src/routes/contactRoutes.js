import express from "express";
import { contactLimiter } from "../middlewares/rateLimiter.js";
import { submitContactInquiry } from "../controllers/contactController.js";

const router = express.Router();

// Public POST endpoint for submitting support/privacy/grievance inquiries (rate-limited)
router.post("/", contactLimiter, submitContactInquiry);

export default router;
