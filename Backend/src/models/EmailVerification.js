import mongoose from "mongoose";

/**
 * Schema for storing Email Verification OTP records and temporary verification proofs.
 */
const EmailVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      default: null,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["registration", "email_change"],
      default: "registration",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: {
      type: String,
      default: null,
    },
    verificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: MongoDB automatically removes document when expiresAt timestamp is reached
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index guarantees single record per email & purpose (prevents OTP creation race conditions)
EmailVerificationSchema.index({ email: 1, purpose: 1 }, { unique: true });

export default mongoose.model("EmailVerification", EmailVerificationSchema);
