import express from "express";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  verifyEmailToken,
} from "../controllers/authController.js";

const router = express.Router();

// Public endpoints for New User Email Verification flow
router.post("/send-registration-otp", sendRegistrationOtp);
router.post("/verify-registration-otp", verifyRegistrationOtp);
router.post("/verify-email-token", verifyEmailToken);

export default router;
