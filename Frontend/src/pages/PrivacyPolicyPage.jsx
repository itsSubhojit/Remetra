import React from "react";
import { Link } from "react-router-dom";

export const PrivacyPolicyPage = () => {
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

      {/* Main Document Body */}
      <main className="max-w-4xl w-full mx-auto px-4 md:px-8 py-10 flex-1 space-y-8">
        <div className="border-b border-[#1E293B] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span>Privacy Policy &amp; Data Transparency</span>
          </div>
          <h1 className="text-headline-md sm:text-headline-lg font-bold text-on-surface tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-body-sm text-outline mt-2">
            Effective Date: September 27, 2026 | Last Updated: September 27, 2026
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">info</span>
            1. Overview
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Welcome to <strong>Remetra</strong> (“we”, “our”, or “us”). Remetra is a household financial vault designed to track recurring bills, mobile plan validity expiries, utility deadlines, and digital subscriptions. We respect your privacy and are committed to protecting your personal data in accordance with the <em>Digital Personal Data Protection Act, 2023 (India)</em> and global data protection standards.
          </p>
        </section>

        {/* Data Categories Itemization */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">database</span>
            2. Personal Data We Collect &amp; Process
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            We collect and process only the minimal personal data required to provide payment scheduling, analytical spend forecasting, and automated 3-day deadline email reminders:
          </p>
          <div className="bg-[#151D2A] p-5 rounded-2xl border border-[#1E293B] space-y-3">
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
              <li><strong>Account Identity Information:</strong> Full Name, Email Address, and Firebase Auth System UID.</li>
              <li><strong>Payment &amp; Bill Records:</strong> Payment Title, Provider Name (e.g. WBSEDCL, Airtel, Netflix), Amount (₹), Due Date, Billing Frequency (Weekly, Monthly, Yearly), Status (Upcoming, Due, Overdue, Paid), and Settlement Date.</li>
              <li><strong>Category-Specific Information:</strong> Mobile Phone Numbers (Recharge category), Recharge Billing Type (Prepaid / Postpaid), Plan Validity Period (Days), Electricity Consumer / Meter ID, and optional user household notes.</li>
              <li><strong>Browser Authentication Session Data:</strong> Firebase Authentication session tokens stored securely in local browser storage for authentication state maintenance.</li>
            </ul>
          </div>
          <p className="text-body-sm text-outline italic">
            Note: Remetra does NOT collect bank account numbers, credit card CVVs, UPI PINs, or raw financial transaction secrets. Remetra is an informational tracking tool, not a payment processor or bank.
          </p>
        </section>

        {/* Operational Purpose */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">target</span>
            3. Purpose of Processing
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Your personal data is processed strictly for the following operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
            <li>Authenticating your account identity and isolating your encrypted payment records.</li>
            <li>Calculating category run-rates, household spend distribution, and upcoming commitments.</li>
            <li>Executing automated 3-day advance email reminders via background cron tasks before payment due dates.</li>
            <li>Maintaining account security, preventing unauthorized access, and responding to user support requests.</li>
          </ul>
        </section>

        {/* Third-Party Service Processors */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">cloud</span>
            4. Third-Party Service Infrastructure
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            We rely on trusted third-party cloud infrastructure providers to operate Remetra:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#151D2A] p-4 rounded-xl border border-[#1E293B]">
              <h4 className="font-semibold text-on-surface text-body-md">Google Firebase Auth</h4>
              <p className="text-body-sm text-outline mt-1">Identity authentication, OAuth Google Login, and token verification.</p>
            </div>
            <div className="bg-[#151D2A] p-4 rounded-xl border border-[#1E293B]">
              <h4 className="font-semibold text-on-surface text-body-md">MongoDB Atlas Cloud</h4>
              <p className="text-body-sm text-outline mt-1">Encrypted database cluster storing user payment records and schedules.</p>
            </div>
            <div className="bg-[#151D2A] p-4 rounded-xl border border-[#1E293B]">
              <h4 className="font-semibold text-on-surface text-body-md">Nodemailer (Gmail SMTP)</h4>
              <p className="text-body-sm text-outline mt-1">Email delivery service for 3-day deadline reminder notifications.</p>
            </div>
            <div className="bg-[#151D2A] p-4 rounded-xl border border-[#1E293B]">
              <h4 className="font-semibold text-on-surface text-body-md">Vercel &amp; Render Cloud</h4>
              <p className="text-body-sm text-outline mt-1">Production hosting environments for SPA frontend and Node.js REST API.</p>
            </div>
          </div>
          <p className="text-body-sm text-outline">
            We do NOT sell, rent, or trade your personal data to third-party advertisers. Remetra does not use Google Analytics, Meta Pixel, or targeted advertising cookies.
          </p>
        </section>

        {/* Account Deletion & Rights */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-error">delete_forever</span>
            5. User Rights &amp; Permanent Account Erasure
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Under data protection regulations, you have the right to access, correct, or permanently delete your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
            <li><strong>Item Deletion:</strong> You can delete any individual payment record instantly inside the Payments Page.</li>
            <li><strong>Complete Account Erasure:</strong> You can purge your entire vault account at any time via <code>Settings &gt; Account &gt; Delete Account</code>. This action immediately deletes all MongoDB payment records associated with your UID and removes your Firebase Auth identity.</li>
            <li><strong>Withdrawal of Processing:</strong> Deleting your account revokes all email reminder permissions and closes your data vault.</li>
          </ul>
        </section>

        {/* Grievance & Contact */}
        <section className="space-y-4 border-t border-[#1E293B] pt-6">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">mail</span>
            6. Contact &amp; Grievance Redressal
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            If you have questions, privacy concerns, or data erasure requests, please contact our support desk or Grievance Officer through our official contact portal:
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-xl font-label-md hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">contact_support</span>
              <span>Visit Remetra Contact &amp; Grievance Portal</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-6 px-4 md:px-8 bg-[#0B0F17] text-center text-xs text-outline">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Remetra — Smart Bill Reminders &amp; Spend Insights.</span>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-on-surface transition-colors">Terms of Service</Link>
            <Link to="/disclaimer" className="hover:text-on-surface transition-colors">Disclaimer</Link>
            <Link to="/cookie-policy" className="hover:text-on-surface transition-colors">Cookie Notice</Link>
            <Link to="/contact" className="hover:text-on-surface transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
