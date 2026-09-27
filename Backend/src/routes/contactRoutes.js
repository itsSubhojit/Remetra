import express from "express";
import { submitContactInquiry } from "../controllers/contactController.js";

const router = express.Router();

// Public POST endpoint for submitting support/privacy/grievance inquiries
router.post("/", submitContactInquiry);

export default router;
