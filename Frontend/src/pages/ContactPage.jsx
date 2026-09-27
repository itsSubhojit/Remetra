import React, { useState } from "react";
import { Link } from "react-router-dom";
import { paymentsApi } from "../services/api";

export const ContactPage = () => {
  const [category, setCategory] = useState("support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setErrorMessage("Please complete all required fields (Name, Email, Message).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // URL & Link Detection Regex
    const urlRegex = /(https?:\/\/|ftps?:\/\/|www\.[a-z0-9-]+|[a-z0-9-]+\.(com|net|org|io|co|in|info|biz|ru|cn|xyz|online|site|app|dev|me|tech|top|link|store|club|vip|live|mobi|asia|us|uk|ca|de|fr|au|nl|eu)\b)/i;
    if (urlRegex.test(trimmedName) || urlRegex.test(trimmedMessage)) {
      setErrorMessage("For security reasons, website links and URLs are not allowed in your inquiry.");
      return;
    }

    try {
      setIsSubmitting(true);
      await paymentsApi.submitContactInquiry({
        category,
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      setSubmittedEmail(trimmedEmail);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      setCategory("support");
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
      setErrorMessage(
        err.message || "Unable to send your inquiry right now. Please verify your connection or try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0B0F17] text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-primary-container selection:text-white font-body-md">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 border-b border-[#1E293B] sticky top-0 bg-[#0B0F17]/90 backdrop-blur-md z-30 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
          <div>
            <span className="text-headline-sm font-headline-sm font-bold text-on-surface tracking-tight block">Remetra</span>
            <span className="text-[10px] text-outline uppercase tracking-wider block">Household Vault</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-95 transition-all shadow-md"
          >
            Access Vault
          </Link>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-4xl w-full mx-auto px-4 md:px-8 py-10 flex-1 space-y-8">
        <div className="border-b border-[#1E293B] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>Support &amp; Grievance Portal</span>
          </div>
          <h1 className="text-headline-md sm:text-headline-lg font-bold text-on-surface tracking-tight">
            Contact &amp; Grievance Redressal
          </h1>
          <p className="text-body-sm text-outline mt-2">
            Have questions about your account, privacy requests, or technical support? We are here to help.
          </p>
        </div>

        {/* Contact Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#151D2A] p-5 rounded-2xl border border-[#1E293B] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-[20px]">help_center</span>
            </div>
            <h3 className="font-semibold text-on-surface text-body-lg">General Support</h3>
            <p className="text-body-sm text-outline">Assistance with setting up bill schedules, mobile recharges, or account preferences.</p>
          </div>

          <div className="bg-[#151D2A] p-5 rounded-2xl border border-[#1E293B] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <h3 className="font-semibold text-on-surface text-body-lg">Privacy &amp; Data Rights</h3>
            <p className="text-body-sm text-outline">Data erasure requests, consent withdrawal, or information handling queries.</p>
          </div>

          <div className="bg-[#151D2A] p-5 rounded-2xl border border-[#1E293B] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <h3 className="font-semibold text-on-surface text-body-lg">Grievance Desk</h3>
            <p className="text-body-sm text-outline">Formal grievance escalations under the Digital Personal Data Protection Act, 2023.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#151D2A] p-6 sm:p-8 rounded-2xl border border-[#1E293B]">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center mx-auto border border-tertiary/30">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface">Message Sent Successfully</h3>
              <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                Thank you for contacting Remetra. Your inquiry has been dispatched to our support desk, and our team will follow up at <strong>{submittedEmail}</strong> within 24 to 48 business hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage("");
                  setErrorMessage("");
                }}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-label-md font-semibold text-on-surface transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-body-sm flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-red-400 shrink-0 mt-0.5">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1.5">Request Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-10 bg-[#0B0F17] border border-[#1E293B] rounded-xl px-3 text-body-md text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="support">General Technical Support</option>
                    <option value="privacy">Privacy &amp; Data Erasure Request</option>
                    <option value="grievance">Formal Grievance Escalation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. Alex Morgan"
                    className="w-full h-10 bg-[#0B0F17] border border-[#1E293B] rounded-xl px-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="alex@example.com"
                  className="w-full h-10 bg-[#0B0F17] border border-[#1E293B] rounded-xl px-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1.5">Message / Inquiry Details</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Describe your question or request..."
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-xl p-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-none disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-outline">Average response time: 24–48 hours</span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary-container text-on-primary font-label-lg font-semibold rounded-xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-6 px-4 md:px-8 bg-[#0B0F17] text-center text-xs text-outline">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Remetra — Smart Bill Reminders &amp; Spend Insights.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-on-surface transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-on-surface transition-colors">Terms of Service</Link>
            <Link to="/disclaimer" className="hover:text-on-surface transition-colors">Disclaimer</Link>
            <Link to="/cookie-policy" className="hover:text-on-surface transition-colors">Cookie Notice</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
