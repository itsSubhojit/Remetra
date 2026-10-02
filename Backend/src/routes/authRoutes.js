import express from "express";
import { firebaseAuth } from "../middlewares/authMiddleware.js";
import {
  authOtpLimiter,
  tokenVerificationLimiter,
} from "../middlewares/rateLimiter.js";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  verifyEmailToken,
  confirmEmailVerification,
} from "../controllers/authController.js";

const router = express.Router();

// Public endpoints for New User Email Verification flow (protected by strict IP rate limiters)
router.post("/send-registration-otp", authOtpLimiter, sendRegistrationOtp);
router.post("/verify-registration-otp", authOtpLimiter, verifyRegistrationOtp);
router.post("/verify-email-token", tokenVerificationLimiter, verifyEmailToken);

// Protected endpoint to confirm email verification and mark Firebase account emailVerified: true
router.post(
  "/confirm-email-verification",
  firebaseAuth,
  tokenVerificationLimiter,
  confirmEmailVerification
);

export default router;
