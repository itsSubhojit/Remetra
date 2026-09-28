import crypto from "crypto";
import { getAuth } from "firebase-admin/auth";
import EmailVerification from "../models/EmailVerification.js";
import { sendVerificationOtpEmail } from "../services/emailService.js";

/**
 * Controller to send a 6-digit OTP for new user email verification.
 */
export const sendRegistrationOtp = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const trimmedEmail = (email || "").trim().toLowerCase();

    // 1. Email format validation
    if (!trimmedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // 2. Check if user already exists in Firebase Authentication
    try {
      const existingUser = await getAuth().getUserByEmail(trimmedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account with this email address already exists. Please sign in instead.",
        });
      }
    } catch (firebaseErr) {
      // auth/user-not-found means user does not exist yet (which is expected for registration)
      if (firebaseErr.code !== "auth/user-not-found") {
        console.error("Firebase user check error:", firebaseErr.message);
      }
    }

    // 3. Resend Cooldown Check (60 seconds minimum between OTP requests)
    const existingOtpRecord = await EmailVerification.findOne({
      email: trimmedEmail,
      purpose: "registration",
      verified: false,
    }).sort({ createdAt: -1 });

    if (existingOtpRecord) {
      const timeSinceCreationMs = Date.now() - new Date(existingOtpRecord.createdAt).getTime();
      if (timeSinceCreationMs < 60 * 1000) {
        const remainingSeconds = Math.ceil((60000 - timeSinceCreationMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
        });
      }
    }

    // 4. Invalidate/Delete any previous registration OTP records for this email
    await EmailVerification.deleteMany({
      email: trimmedEmail,
      purpose: "registration",
    });

    // 5. Generate Cryptographically Secure 6-Digit OTP (100000 to 999999)
    const rawOtpNumber = crypto.randomInt(100000, 1000000);
    const rawOtpString = String(rawOtpNumber);

    // 6. Hash OTP using SHA-256 (Never store plaintext OTP)
    const otpHash = crypto.createHash("sha256").update(rawOtpString).digest("hex");

    // 7. Store OTP record with 10-minute expiration timestamp
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await EmailVerification.create({
      email: trimmedEmail,
      otpHash,
      purpose: "registration",
      attempts: 0,
      verified: false,
      expiresAt,
    });

    // 8. Dispatch OTP Email
    await sendVerificationOtpEmail(trimmedEmail, rawOtpString);

    return res.status(200).json({
      success: true,
      message: "A 6-digit verification code has been sent to your email address.",
    });
  } catch (error) {
    console.error("Error in sendRegistrationOtp:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please check server logs or try again later.",
    });
  }
};

/**
 * Controller to verify the 6-digit OTP submitted by the user.
 */
export const verifyRegistrationOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedOtp = (otp || "").trim();

    // 1. Validation
    if (!trimmedEmail || !trimmedOtp) {
      return res.status(400).json({
        success: false,
        message: "Email address and 6-digit verification code are required.",
      });
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be exactly 6 numeric digits.",
      });
    }

    // 2. Find matching unverified OTP record
    const otpRecord = await EmailVerification.findOne({
      email: trimmedEmail,
      purpose: "registration",
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No active verification request found. Please request a new code.",
      });
    }

    // 3. Expiration Check
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await EmailVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // 4. Maximum Attempt Limit Check (5 attempts max)
    if (otpRecord.attempts >= 5) {
      await EmailVerification.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new verification code.",
      });
    }

    // 5. Compare Hashed OTP
    const submittedOtpHash = crypto.createHash("sha256").update(trimmedOtp).digest("hex");

    if (submittedOtpHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`,
      });
    }

    // 6. Generate Cryptographically Secure Verification Proof Token (32 random bytes -> 64 hex chars)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute window to complete registration

    // 7. Update record to verified status and store proof token
    otpRecord.verified = true;
    otpRecord.otpHash = null; // Single-use: clear OTP hash immediately
    otpRecord.verificationTokenHash = verificationTokenHash;
    otpRecord.verificationTokenExpiresAt = tokenExpiresAt;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      verificationToken,
      verifiedEmail: trimmedEmail,
    });
  } catch (error) {
    console.error("Error in verifyRegistrationOtp:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to verify code. Please try again later.",
    });
  }
};

/**
 * Controller to validate server-side verification proof token.
 */
export const verifyEmailToken = async (req, res, next) => {
  try {
    const { email, verificationToken } = req.body || {};
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedToken = (verificationToken || "").trim();

    if (!trimmedEmail || !trimmedToken) {
      return res.status(400).json({
        success: false,
        message: "Email address and verification token are required.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(trimmedToken).digest("hex");

    const record = await EmailVerification.findOne({
      email: trimmedEmail,
      purpose: "registration",
      verified: true,
      verificationTokenHash: tokenHash,
    });

    if (!record || new Date() > new Date(record.verificationTokenExpiresAt)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Verification token is invalid or has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      email: trimmedEmail,
      message: "Email verification proof is valid.",
    });
  } catch (error) {
    console.error("Error in verifyEmailToken:", error.message);
    return res.status(500).json({
      success: false,
      valid: false,
      message: "Failed to validate verification token.",
    });
  }
};
