import express from "express";
import { firebaseAuth } from "../middlewares/authMiddleware.js";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  verifyEmailToken,
  confirmEmailVerification,
} from "../controllers/authController.js";

const router = express.Router();

// Public endpoints for New User Email Verification flow
router.post("/send-registration-otp", sendRegistrationOtp);
router.post("/verify-registration-otp", verifyRegistrationOtp);
router.post("/verify-email-token", verifyEmailToken);

// Protected endpoint to confirm email verification and mark Firebase account emailVerified: true
router.post("/confirm-email-verification", firebaseAuth, confirmEmailVerification);

export default router;
