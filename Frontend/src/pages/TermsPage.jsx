import React from "react";
import { Link } from "react-router-dom";

export const TermsPage = () => {
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
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>Terms of Service Agreement</span>
          </div>
          <h1 className="text-headline-md sm:text-headline-lg font-bold text-on-surface tracking-tight">
            Terms of Service
          </h1>
          <p className="text-body-sm text-outline mt-2">
            Effective Date: September 27, 2026 | Last Updated: September 27, 2026
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">verified</span>
            1. Acceptance of Terms
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            By registering for, accessing, or using <strong>Remetra</strong> (“the Service”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, you must not create an account or use the Service.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">account_circle</span>
            2. Account Eligibility &amp; Security
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials (email and password or Google Auth session). You agree to provide accurate information when scheduling payment commitments and accept full responsibility for all activities that occur under your account identity.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">task_alt</span>
            3. Permitted Use &amp; Prohibited Misuse
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Remetra is intended solely for personal, household, and small business bill scheduling and spend forecasting. You agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
            <li>Use the Service for any unlawful purpose, fraud, or identity misrepresentation.</li>
            <li>Attempt to bypass API token verification or access another user's isolated payment vault.</li>
            <li>Use automated bots or scrapers to overload or disrupt backend infrastructure.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">schedule</span>
            4. Service Delivery &amp; Automated Email Notifications
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Remetra incorporates a 3-day background email reminder system. While we attempt to deliver automated emails reliably before scheduled due dates, delivery depends on external networks, SMTP providers, and user inbox settings. Remetra does not guarantee 100% uninterrupted delivery of reminder notifications.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-error">block</span>
            5. Limitation of Liability
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            To the maximum extent permitted by applicable law, Remetra, its developers, and operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
            <li>Missed utility, recharge, or subscription deadlines.</li>
            <li>Late payment penalties or service disconnections imposed by third-party providers.</li>
            <li>Inaccurate payment amounts or due dates entered by the user.</li>
            <li>Temporary third-party server outages (Firebase, MongoDB Atlas, Render, Vercel, Gmail SMTP).</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">delete_outline</span>
            6. Account Termination &amp; Data Erasure
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            You may terminate your account at any time by using the <code>Delete Account</code> feature in your profile settings. Upon termination, all your stored payment schedules will be deleted from our active database. We reserve the right to suspend or terminate accounts that violate these Terms.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 border-t border-[#1E293B] pt-6">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">balance</span>
            7. Governing Law &amp; Legal Notice
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of these Terms or the use of the Service shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
          <p className="text-body-sm text-outline italic mt-2">
            Notice: These Terms of Service are informational product guidelines. Formal commercial launch may require additional legal review by qualified legal counsel.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-6 px-4 md:px-8 bg-[#0B0F17] text-center text-xs text-outline">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Remetra — Smart Bill Reminders &amp; Spend Insights.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-on-surface transition-colors">Privacy Policy</Link>
            <Link to="/disclaimer" className="hover:text-on-surface transition-colors">Disclaimer</Link>
            <Link to="/cookie-policy" className="hover:text-on-surface transition-colors">Cookie Notice</Link>
            <Link to="/contact" className="hover:text-on-surface transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
