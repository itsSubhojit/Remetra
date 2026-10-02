import crypto from "crypto";
import { getAuth } from "firebase-admin/auth";
import EmailVerification from "../models/EmailVerification.js";
import { sendVerificationOtpEmail } from "../services/emailService.js";

/**
 * Predictable, linear email validation helper (RFC 5321 length & ReDoS safe)
 */
export const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;

  const atParts = trimmed.split("@");
  if (atParts.length !== 2) return false;

  const [localPart, domainPart] = atParts;
  if (!localPart || !domainPart || localPart.length > 64 || domainPart.length > 253) return false;

  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRegex.test(localPart)) return false;

  const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return domainRegex.test(domainPart);
};

/**
 * Controller to send a 6-digit OTP for new user email verification.
 */
export const sendRegistrationOtp = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    
    // 1. Strict Input Type & Bounded Email Validation (CWE-1333 ReDoS Protection)
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // 2. Check if user already exists in Firebase Authentication (CWE-204 Account Enumeration Defense)
    let userAlreadyExists = false;
    try {
      const existingUser = await getAuth().getUserByEmail(trimmedEmail);
      if (existingUser) {
        userAlreadyExists = true;
      }
    } catch (firebaseErr) {
      if (firebaseErr.code !== "auth/user-not-found") {
        console.error("Firebase user check error:", firebaseErr.message);
      }
    }

    // If account already exists, return uniform response without revealing account existence
    if (userAlreadyExists) {
      return res.status(200).json({
        success: true,
        message: "If this email is eligible for registration, a 6-digit verification code has been sent.",
      });
    }

    // 3. Atomic Cooldown & Claim Check (CWE-362 OTP Resend Race Condition Defense)
    const now = new Date();
    const cooldownCutoff = new Date(now.getTime() - 60 * 1000); // 60 seconds minimum between OTP requests
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes OTP lifetime

    const existingOtpRecord = await EmailVerification.findOne({
      email: trimmedEmail,
      purpose: "registration",
      verified: false,
    });

    if (existingOtpRecord && existingOtpRecord.createdAt > cooldownCutoff) {
      const timeSinceCreationMs = now.getTime() - new Date(existingOtpRecord.createdAt).getTime();
      const remainingSeconds = Math.ceil((60000 - timeSinceCreationMs) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
      });
    }

    // 4. Generate Cryptographically Secure 6-Digit OTP (100000 to 999999)
    const rawOtpNumber = crypto.randomInt(100000, 1000000);
    const rawOtpString = String(rawOtpNumber);

    // 5. Hash OTP using SHA-256 (Never store plaintext OTP)
    const otpHash = crypto.createHash("sha256").update(rawOtpString).digest("hex");

    // 6. Atomically upsert or update OTP record to prevent race conditions
    let claimedRecord;
    try {
      claimedRecord = await EmailVerification.findOneAndUpdate(
        {
          email: trimmedEmail,
          purpose: "registration",
          $or: [
            { createdAt: { $lte: cooldownCutoff } },
            { verified: true },
          ],
        },
        {
          $set: {
            otpHash,
            attempts: 0,
            verified: false,
            expiresAt,
            createdAt: now,
            verificationTokenHash: null,
            verificationTokenExpiresAt: null,
          },
        },
        { new: true }
      );

      if (!claimedRecord) {
        claimedRecord = await EmailVerification.create({
          email: trimmedEmail,
          purpose: "registration",
          otpHash,
          attempts: 0,
          verified: false,
          expiresAt,
          createdAt: now,
        });
      }
    } catch (dbErr) {
      // E11000 duplicate key error means a concurrent request just claimed the record
      if (dbErr.code === 11000) {
        return res.status(429).json({
          success: false,
          message: "A verification code was just requested. Please wait 60 seconds before requesting another.",
        });
      }
      throw dbErr;
    }

    // 7. Dispatch OTP Email
    await sendVerificationOtpEmail(trimmedEmail, rawOtpString);

    return res.status(200).json({
      success: true,
      message: "If this email is eligible for registration, a 6-digit verification code has been sent.",
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
 * Implements atomic attempt increments (CWE-362) to prevent brute-force race conditions.
 */
export const verifyRegistrationOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};

    if (typeof email !== "string" || typeof otp !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email address and 6-digit verification code are required.",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

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

    const now = new Date();

    // 1. Atomically reserve an attempt count (prevents concurrent brute-force race conditions)
    const otpRecord = await EmailVerification.findOneAndUpdate(
      {
        email: trimmedEmail,
        purpose: "registration",
        verified: false,
        attempts: { $lt: 5 },
        expiresAt: { $gt: now },
      },
      {
        $inc: { attempts: 1 },
      },
      { new: true }
    );

    if (!otpRecord) {
      const existing = await EmailVerification.findOne({
        email: trimmedEmail,
        purpose: "registration",
      });

      if (!existing) {
        return res.status(400).json({
          success: false,
          message: "No active verification request found. Please request a new code.",
        });
      }

      if (existing.verified) {
        return res.status(400).json({
          success: false,
          message: "This code has already been verified.",
        });
      }

      if (new Date(existing.expiresAt) <= now) {
        await EmailVerification.deleteOne({ _id: existing._id });
        return res.status(400).json({
          success: false,
          message: "Verification code has expired. Please request a new code.",
        });
      }

      if (existing.attempts >= 5) {
        return res.status(429).json({
          success: false,
          message: "Maximum verification attempts exceeded. Please request a new verification code.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Unable to verify code. Please request a new code.",
      });
    }

    // 2. Compare Hashed OTP
    const submittedOtpHash = crypto.createHash("sha256").update(trimmedOtp).digest("hex");

    if (submittedOtpHash !== otpRecord.otpHash) {
      const remainingAttempts = Math.max(0, 5 - otpRecord.attempts);
      if (remainingAttempts === 0) {
        return res.status(429).json({
          success: false,
          message: "Maximum verification attempts exceeded. Please request a new verification code.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`,
      });
    }

    // 3. Atomically consume OTP and store single-use verification proof token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute window

    const verifiedRecord = await EmailVerification.findOneAndUpdate(
      {
        _id: otpRecord._id,
        verified: false, // Prevents concurrent double-consumption
      },
      {
        $set: {
          verified: true,
          otpHash: null,
          verificationTokenHash,
          verificationTokenExpiresAt: tokenExpiresAt,
        },
      },
      { new: true }
    );

    if (!verifiedRecord) {
      return res.status(400).json({
        success: false,
        message: "Verification code has already been consumed.",
      });
    }

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
    if (typeof email !== "string" || typeof verificationToken !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and verification token must be valid strings.",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedToken = verificationToken.trim();

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

/**
 * Controller to confirm email verification for authenticated user and mark Firebase user as emailVerified: true
 * (CWE-287 Reminder Email Authentication Defense)
 */
export const confirmEmailVerification = async (req, res, next) => {
  try {
    const { email, verificationToken } = req.body || {};
    if (typeof email !== "string" || typeof verificationToken !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and verification token must be valid strings.",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedToken = verificationToken.trim();
    const firebaseUid = req.user?.uid;

    if (!trimmedEmail || !trimmedToken || !firebaseUid) {
      return res.status(400).json({
        success: false,
        message: "Email address, verification token, and user authentication are required.",
      });
    }

    if (req.user.email?.toLowerCase() !== trimmedEmail) {
      return res.status(403).json({
        success: false,
        message: "Authenticated account email does not match verification request.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(trimmedToken).digest("hex");

    const record = await EmailVerification.findOneAndUpdate(
      {
        email: trimmedEmail,
        purpose: "registration",
        verified: true,
        verificationTokenHash: tokenHash,
        verificationTokenExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          verificationTokenHash: null, // Single-use consumption
        },
      },
      { new: true }
    );

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Verification proof token is invalid or has expired.",
      });
    }

    // Set emailVerified to true in Firebase Admin
    await getAuth().updateUser(firebaseUid, { emailVerified: true });

    return res.status(200).json({
      success: true,
      message: "Email address successfully confirmed and bound to user account.",
    });
  } catch (error) {
    console.error("Error in confirmEmailVerification:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to confirm email verification.",
    });
  }
};
