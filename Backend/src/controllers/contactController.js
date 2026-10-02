import { sendContactInquiryEmail } from "../services/emailService.js";
import { isValidEmail } from "./authController.js";

/**
 * Predictable, linear URL / link detection helper (CWE-1333 ReDoS Safe)
 * Tests bounded strings for protocol headers or common domain links without nested catastrophic backtracking.
 */
const containsUrlOrLink = (text) => {
  if (typeof text !== "string") return false;
  // Protocol prefix check
  if (/(?:https?|ftps?):\/\/\S+/i.test(text)) return true;
  // Common www prefix check
  if (/\bwww\.[a-z0-9-]+\.[a-z]{2,}\b/i.test(text)) return true;
  // Common top-level domain extensions on word boundaries
  const commonTlds = /\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|net|org|io|co|in|info|biz|ru|cn|xyz|online|site|app|dev|me|tech|top|link|store|club|vip|icu|live|mobi|asia|us|uk|ca|de|fr|au|nl|eu)\b/i;
  return commonTlds.test(text);
};

/**
 * Controller to handle public contact / privacy / grievance submissions securely.
 * Note: IP rate-limiting is handled upstream by contactLimiter middleware.
 */
export const submitContactInquiry = async (req, res, next) => {
  try {
    const { category, name, email, message } = req.body || {};

    // 1. Strict Input Type Checks
    if (
      typeof category !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields (category, name, email, and message) must be valid text.",
      });
    }

    // 2. Trim Whitespace & Prevent CRLF Injection in Header Fields
    const trimmedCategory = category.replace(/[\r\n]/g, "").trim();
    const trimmedName = name.replace(/[\r\n]/g, "").trim();
    const trimmedEmail = email.replace(/[\r\n]/g, "").trim();
    const trimmedMessage = message.trim();

    // 3. Required Fields Check
    if (!trimmedCategory || !trimmedName || !trimmedEmail || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "All fields (category, name, email, and message) are required.",
      });
    }

    // 4. Input Length Limit Checks BEFORE expensive scanning (CWE-1333 ReDoS Protection)
    if (trimmedCategory.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Category must not exceed 50 characters.",
      });
    }

    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must not exceed 100 characters.",
      });
    }

    if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
      return res.status(400).json({
        success: false,
        message: "Email address must be between 5 and 254 characters.",
      });
    }

    if (trimmedMessage.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Message detail must not exceed 3,000 characters.",
      });
    }

    // 5. Allowed Category Whitelist Check
    const allowedCategories = ["support", "privacy", "grievance"];
    if (!allowedCategories.includes(trimmedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request category selected.",
      });
    }

    // 6. Predictable Email Syntax Check (CWE-1333 ReDoS Safe)
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // 7. Strict Link & URL Blocking on Bounded Input ("No Links Allowed")
    if (containsUrlOrLink(trimmedName) || containsUrlOrLink(trimmedMessage)) {
      return res.status(400).json({
        success: false,
        message: "For security reasons, website links and URLs are not allowed in contact messages.",
      });
    }

    // 8. Dispatch Email via Secure Email Service
    await sendContactInquiryEmail({
      category: trimmedCategory,
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    });

    return res.status(200).json({
      success: true,
      message: "Your inquiry has been successfully dispatched to the Remetra team.",
    });
  } catch (error) {
    console.error("Contact inquiry dispatch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to process or deliver contact inquiry at this time. Please try again later.",
    });
  }
};
