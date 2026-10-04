import { Router } from "express";
import { firebaseAuth } from "../middlewares/authMiddleware.js";
import {
  paymentGatewayLimiter,
  paymentCrudLimiter,
  accountDeletionLimiter,
  webhookLimiter,
} from "../middlewares/rateLimiter.js";
import {
  paymentUser,
  getAllPayments,
  getPaymentId,
  updatePayment,
  deletePayment,
  deleteUserAccount,
  initiatePayment,
  verifyPayment,
  handleCashfreeWebhook,
  extractReceiptData
} from "../controllers/paymentController.js";

const router = Router();

// Cashfree Webhook listener (Public - rate-limited and authenticated via Cashfree Signature)
router.route("/webhook").post(webhookLimiter, handleCashfreeWebhook);

// User account deletion endpoints (Protected - strict rate limit)
router.route("/account").delete(firebaseAuth, accountDeletionLimiter, deleteUserAccount);
router.route("/user/account").delete(firebaseAuth, accountDeletionLimiter, deleteUserAccount);

// Payment CRUD endpoints (Protected - user-aware rate limit)
router.route("/").post(firebaseAuth, paymentCrudLimiter, paymentUser);
router.route("/").get(firebaseAuth, paymentCrudLimiter, getAllPayments);
router.route("/:id").get(firebaseAuth, paymentCrudLimiter, getPaymentId);
router.route("/:id").put(firebaseAuth, paymentCrudLimiter, updatePayment);
router.route("/:id").delete(firebaseAuth, paymentCrudLimiter, deletePayment);

// Cashfree Payment Initiation & Verification endpoints (Protected - payment gateway limiter)
router.route("/:id/pay").post(firebaseAuth, paymentGatewayLimiter, initiatePayment);
router.route("/:id/verify-payment").get(firebaseAuth, paymentGatewayLimiter, verifyPayment);
router.route("/:id/verify-payment").post(firebaseAuth, paymentGatewayLimiter, verifyPayment);

router.route("/extract-receipt").post(firebaseAuth, extractReceiptData)

export default router;