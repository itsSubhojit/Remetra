import { rateLimit, ipKeyGenerator } from "express-rate-limit";

/**
 * Standard 429 JSON response generator
 */
const createErrorResponse = (message, statusCode = 429) => ({
  success: false,
  statusCode,
  message,
});

/**
 * Global rate limiter: Baseline protection against unbounded volumetric traffic
 * 300 requests per 15 minutes per IP address
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: createErrorResponse(
    "Too many requests from this IP. Please try again later."
  ),
});

/**
 * Auth OTP limiter: Protects OTP dispatch and verification endpoints
 * 10 requests per 15 minutes per IP address
 */
export const authOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: createErrorResponse(
    "Too many OTP requests from this IP. Please wait 15 minutes before trying again."
  ),
});

/**
 * Token verification limiter: Protects email token validation and confirmation
 * 30 requests per 15 minutes per IP address
 */
export const tokenVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: createErrorResponse(
    "Too many token verification attempts. Please wait 15 minutes before trying again."
  ),
});

/**
 * Payment Gateway limiter: Protects Cashfree order creation and active verification
 * 15 requests per 1 minute per authenticated user (fallback to IP)
 */
export const paymentGatewayLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 15,
  keyGenerator: (req) => req.user?.uid || ipKeyGenerator(req),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: createErrorResponse(
    "Too many payment gateway operations. Please slow down and try again in a minute."
  ),
});

/**
 * Payment CRUD limiter: Protects MongoDB payment creation, retrieval, updates, and deletion
 * 60 requests per 1 minute per authenticated user (fallback to IP)
 */
export const paymentCrudLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 60,
  keyGenerator: (req) => req.user?.uid || ipKeyGenerator(req),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: createErrorResponse(
    "Too many payment requests. Please try again shortly."
  ),
});

/**
 * Account Deletion limiter: Protects user and payment data purge endpoint
 * 5 requests per 15 minutes per authenticated user (fallback to IP)
 */
export const accountDeletionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.user?.uid || ipKeyGenerator(req),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: createErrorResponse(
    "Too many account deletion attempts. Please wait before retrying."
  ),
});

/**
 * Cashfree Webhook limiter: Protects server-to-server webhook endpoint from floods
 * High-capacity window to safely absorb legitimate event bursts from Cashfree servers
 * 300 requests per 5 minutes per IP address (Public endpoint - NO Firebase Auth)
 */
export const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many webhook requests. Please retry later.",
    status: 429,
  },
});

/**
 * Contact Inquiry limiter: Protects public contact form and Nodemailer/Resend dispatch
 * 5 requests per 15 minutes per IP address
 */
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many contact submissions from your IP. Please wait 15 minutes before trying again.",
  },
});
