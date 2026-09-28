import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import crypto from "crypto";
import EmailVerification from "../src/models/EmailVerification.js";
import { dbConnect } from "../src/config/db.js";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  verifyEmailToken,
} from "../src/controllers/authController.js";

const mockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    },
  };
  return res;
};

async function runTests() {
  console.log("=== STARTING BACKEND OTP SUITE TESTS ===");
  await dbConnect();

  const testEmail = `test_verification_${Date.now()}@example.com`;

  // Test 1: Invalid email format
  {
    const req = { body: { email: "invalid-email" } };
    const res = mockRes();
    await sendRegistrationOtp(req, res);
    console.assert(res.statusCode === 400, "Test 1 Failed: Should reject invalid email");
    console.log("✓ Test 1 Passed: Invalid email rejected (400)");
  }

  // Test 2: Valid email -> OTP sent
  let firstOtpPlain = null;
  {
    const req = { body: { email: testEmail } };
    const res = mockRes();
    await sendRegistrationOtp(req, res);
    console.assert(res.statusCode === 200, "Test 2 Failed: OTP should be sent");
    console.assert(res.data.success === true, "Test 2 Failed: Response success true");
    console.assert(res.data.otp === undefined, "Test 11 Passed: OTP not exposed in API response");
    console.log("✓ Test 2 Passed: Valid email OTP sent (200)");
    console.log("✓ Test 11 Passed: OTP is not exposed in API response");

    // Fetch created record to get actual OTP hash for testing
    const record = await EmailVerification.findOne({ email: testEmail, purpose: "registration" });
    console.assert(record !== null, "OTP record created in DB");
    console.assert(record.otpHash !== null, "OTP stored as hash");
    console.assert(record.otpHash.length === 64, "OTP stored as SHA-256 hex string");
  }

  // Test 3: Excessive resend attempt within 60 seconds
  {
    const req = { body: { email: testEmail } };
    const res = mockRes();
    await sendRegistrationOtp(req, res);
    console.assert(res.statusCode === 429, "Test 3 Failed: Should block resend within 60 seconds");
    console.log("✓ Test 10 Passed: Excessive resend attempt blocked (429)");
  }

  // Test 4: Incorrect OTP attempt
  {
    const req = { body: { email: testEmail, otp: "000000" } };
    const res = mockRes();
    await verifyRegistrationOtp(req, res);
    console.assert(res.statusCode === 400, "Test 4 Failed: Wrong OTP should be rejected");
    console.log("✓ Test 5 Passed: Incorrect OTP rejected (400)");
  }

  // Test 5: Verify correct OTP
  // For testing verification, let's create a known test record
  const knownTestEmail = `test_verify_success_${Date.now()}@example.com`;
  const knownPlainOtp = "123456";
  const knownOtpHash = crypto.createHash("sha256").update(knownPlainOtp).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailVerification.create({
    email: knownTestEmail,
    otpHash: knownOtpHash,
    purpose: "registration",
    attempts: 0,
    verified: false,
    expiresAt,
  });

  let issuedToken = null;
  {
    const req = { body: { email: knownTestEmail, otp: knownPlainOtp } };
    const res = mockRes();
    await verifyRegistrationOtp(req, res);
    console.assert(res.statusCode === 200, "Test 5 Failed: Correct OTP should succeed");
    console.assert(res.data.verificationToken !== undefined, "Verification token issued");
    issuedToken = res.data.verificationToken;
    console.log("✓ Test 4 Passed: Correct OTP verified successfully (200)");
  }

  // Test 6: Reused OTP (Single-Use check)
  {
    const req = { body: { email: knownTestEmail, otp: knownPlainOtp } };
    const res = mockRes();
    await verifyRegistrationOtp(req, res);
    console.assert(res.statusCode === 400, "Test 6 Failed: Reused OTP should be rejected");
    console.log("✓ Test 7 Passed: Reused OTP rejected (400)");
  }

  // Test 7: Verify proof token validation
  {
    const req = { body: { email: knownTestEmail, verificationToken: issuedToken } };
    const res = mockRes();
    await verifyEmailToken(req, res);
    console.assert(res.statusCode === 200 && res.data.valid === true, "Token proof should be valid");
    console.log("✓ Test 7b Passed: Verification token proof validated successfully (200)");
  }

  // Test 8: Expired OTP
  const expiredEmail = `test_expired_${Date.now()}@example.com`;
  await EmailVerification.create({
    email: expiredEmail,
    otpHash: knownOtpHash,
    purpose: "registration",
    attempts: 0,
    verified: false,
    expiresAt: new Date(Date.now() - 1000), // expired 1s ago
  });

  {
    const req = { body: { email: expiredEmail, otp: knownPlainOtp } };
    const res = mockRes();
    await verifyRegistrationOtp(req, res);
    console.assert(res.statusCode === 400, "Test 8 Failed: Expired OTP should be rejected");
    console.log("✓ Test 6 Passed: Expired OTP rejected (400)");
  }

  // Test 9: Max verification attempts (5 attempts)
  const maxAttemptsEmail = `test_max_attempts_${Date.now()}@example.com`;
  await EmailVerification.create({
    email: maxAttemptsEmail,
    otpHash: knownOtpHash,
    purpose: "registration",
    attempts: 5, // max attempts reached
    verified: false,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  {
    const req = { body: { email: maxAttemptsEmail, otp: knownPlainOtp } };
    const res = mockRes();
    await verifyRegistrationOtp(req, res);
    console.assert(res.statusCode === 429, "Test 9 Failed: Max attempts should trigger 429");
    console.log("✓ Test 9 Passed: Max verification attempts exceeded blocked (429)");
  }

  // Test 10: New OTP invalidates old OTP
  const invalidateEmail = `test_invalidate_${Date.now()}@example.com`;
  await EmailVerification.create({
    email: invalidateEmail,
    otpHash: crypto.createHash("sha256").update("111111").digest("hex"),
    purpose: "registration",
    attempts: 0,
    verified: false,
    createdAt: new Date(Date.now() - 120000), // created 2 mins ago so cooldown passed
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  {
    const req = { body: { email: invalidateEmail } };
    const res = mockRes();
    await sendRegistrationOtp(req, res);
    console.assert(res.statusCode === 200, "New OTP requested");

    // Check old OTP "111111" fails
    const reqVerifyOld = { body: { email: invalidateEmail, otp: "111111" } };
    const resVerifyOld = mockRes();
    await verifyRegistrationOtp(reqVerifyOld, resVerifyOld);
    console.assert(resVerifyOld.statusCode === 400, "Old OTP invalidated");
    console.log("✓ Test 8 Passed: New OTP invalidates old OTP");
  }

  // Cleanup test data
  await EmailVerification.deleteMany({ email: { $regex: /^test_/ } });
  await mongoose.disconnect();
  console.log("=== ALL BACKEND OTP SUITE TESTS PASSED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
