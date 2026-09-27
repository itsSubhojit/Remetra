import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

// Helper function to create/get transporter dynamically with current env vars
const getTransporter = () => {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").trim();

  if (!user || !pass) {
    throw new Error("SMTP authentication credentials (EMAIL_USER / EMAIL_PASS) are missing or empty on backend.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

export const sendReminderEmail = async (to, subject, message) => {
    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: message
        })
    } catch (error) {
        console.log("Email sending failed:", error)
    }
}

/**
 * Sends public contact / privacy / grievance inquiry emails to configured contact address.
 */
export const sendContactInquiryEmail = async ({ category, name, email, message }) => {
    const recipient = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;

    if (!recipient) {
        throw new Error("Target contact email configuration is missing on server.");
    }

    const categoryLabels = {
        support: "General Technical Support",
        privacy: "Privacy & Data Erasure Request",
        grievance: "Formal Grievance Escalation"
    };

    const categoryText = categoryLabels[category] || category || "General Support";
    const timestamp = new Date().toUTCString();

    const escapeHtml = (str) =>
        String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    const subject = `[Remetra Inquiry - ${categoryText}] From ${name}`;

    const textContent = `
NEW INQUIRY RECEIVED — REMETRA SUPPORT PORTAL
------------------------------------------------
Category: ${categoryText}
Submitted By: ${name}
User Email: ${email}
Submission Time: ${timestamp}

INQUIRY DETAILS:
------------------------------------------------
${message}
------------------------------------------------
Notice: Reply directly to this email to respond to ${name} (${email}).
`.trim();

    const htmlContent = `
<div style="font-family: Arial, sans-serif; background-color: #0b0f17; color: #f1f5f9; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
  <h2 style="color: #6366f1; margin-top: 0;">New Support Inquiry Received</h2>
  <div style="background-color: #151d2a; padding: 16px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 20px;">
    <p style="margin: 6px 0;"><strong>Category:</strong> <span style="color: #38bdf8;">${escapeHtml(categoryText)}</span></p>
    <p style="margin: 6px 0;"><strong>User Name:</strong> ${escapeHtml(name)}</p>
    <p style="margin: 6px 0;"><strong>User Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color: #818cf8;">${escapeHtml(email)}</a></p>
    <p style="margin: 6px 0;"><strong>Timestamp:</strong> ${escapeHtml(timestamp)}</p>
  </div>
  <div style="background-color: #0b0f17; padding: 16px; border-radius: 8px; border: 1px solid #1e293b;">
    <h3 style="margin-top: 0; color: #94a3b8; font-size: 14px; text-transform: uppercase;">Message Content:</h3>
    <p style="white-space: pre-wrap; line-height: 1.6; color: #e2e8f0; margin: 0;">${escapeHtml(message)}</p>
  </div>
  <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
    Sent automatically via Remetra Support Portal. Hit Reply to answer ${escapeHtml(name)} directly.
  </p>
</div>
`.trim();

    const transporter = getTransporter();
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        replyTo: email,
        to: recipient,
        subject: subject,
        text: textContent,
        html: htmlContent
    });
};