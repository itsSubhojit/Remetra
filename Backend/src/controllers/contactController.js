import { sendContactInquiryEmail } from "../services/emailService.js";

// In-Memory Rate Limiter Map (IP -> { count, expiresAt })
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Periodic cleanup of expired rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.expiresAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// Comprehensive URL / Link detection regex (detects http, https, ftp, www, and common domain extensions)
const URL_LINK_REGEX = /(https?:\/\/|ftps?:\/\/|www\.[a-z0-9-]+|[a-z0-9-]+\.(com|net|org|io|co|in|info|biz|ru|cn|xyz|online|site|app|dev|me|tech|top|link|store|club|vip|icu|live|mobi|asia|us|uk|ca|de|fr|au|nl|eu)\b)/i;

/**
 * Controller to handle public contact / privacy / grievance submissions securely.
 */
export const submitContactInquiry = async (req, res, next) => {
  try {
    // 1. IP Rate Limiting Protection
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown_ip";
    const now = Date.now();
    const clientData = rateLimitMap.get(clientIp);

    if (clientData && now < clientData.expiresAt) {
      if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
          success: false,
          message: "Too many contact submissions from your IP. Please wait 15 minutes before trying again.",
        });
      }
      clientData.count += 1;
    } else {
      rateLimitMap.set(clientIp, {
        count: 1,
        expiresAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    const { category, name, email, message } = req.body || {};

    // 2. Trim Whitespace & Prevent CRLF Injection in Header Fields
    const trimmedCategory = (category || "").replace(/[\r\n]/g, "").trim();
    const trimmedName = (name || "").replace(/[\r\n]/g, "").trim();
    const trimmedEmail = (email || "").replace(/[\r\n]/g, "").trim();
    const trimmedMessage = (message || "").trim();

    // 3. Required Fields Check
    if (!trimmedCategory || !trimmedName || !trimmedEmail || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "All fields (category, name, email, and message) are required.",
      });
    }

    // 4. Allowed Category Whitelist Check
    const allowedCategories = ["support", "privacy", "grievance"];
    if (!allowedCategories.includes(trimmedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request category selected.",
      });
    }

    // 5. Email Syntax & Structure Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // 6. Strict Link & URL Blocking ("No Links Allowed")
    if (URL_LINK_REGEX.test(trimmedName) || URL_LINK_REGEX.test(trimmedMessage)) {
      return res.status(400).json({
        success: false,
        message: "For security reasons, website links and URLs are not allowed in contact messages.",
      });
    }

    // 7. Input Length Limit Checks (Payload Flooding Prevention)
    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must not exceed 100 characters.",
      });
    }

    if (trimmedEmail.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Email address must not exceed 255 characters.",
      });
    }

    if (trimmedMessage.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Message detail must not exceed 3,000 characters.",
      });
    }

    // 8. Dispatch Email via Secure Nodemailer Service
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
