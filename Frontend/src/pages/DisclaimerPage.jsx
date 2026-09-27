import React from "react";
import { Link } from "react-router-dom";

export const DisclaimerPage = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Financial &amp; Operational Scope Statement</span>
          </div>
          <h1 className="text-headline-md sm:text-headline-lg font-bold text-on-surface tracking-tight">
            Financial &amp; Service Disclaimer
          </h1>
          <p className="text-body-sm text-outline mt-2">
            Effective Date: September 27, 2026 | Last Updated: September 27, 2026
          </p>
        </div>

        {/* Section 1: Functional Scope */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">account_balance_wallet</span>
            1. Informational Tracking Tool Only
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            <strong>Remetra</strong> is strictly an <em>informational bill tracking, calendar scheduling, and spend insights application</em>. Remetra does <strong>NOT</strong>:
          </p>
          <div className="bg-[#151D2A] p-5 rounded-2xl border border-[#1E293B]">
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
              <li>Process real-world monetary payments or bank wire transfers.</li>
              <li>Hold, custody, or escrow user funds or cryptocurrency.</li>
              <li>Act as a licensed bank, non-banking financial company (NBFC), or payment gateway.</li>
              <li>Directly connect to open-banking APIs or execute automated bill settlements on your behalf.</li>
              <li>Provide financial, investment, tax, or legal advice.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: User Responsibility */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_check</span>
            2. User Responsibility for Bill Verification &amp; Payments
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            You remain solely responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
            <li>Verifying all bill details, amounts (₹), electricity consumer IDs, and due dates entered into your vault.</li>
            <li>Making actual bill payments directly through official utility provider portals, bank apps, or authorized bill payment channels.</li>
            <li>Confirming payment settlement directly with your service provider (e.g., WBSEDCL, Airtel, Jio, Netflix).</li>
          </ul>
        </section>

        {/* Section 3: Notification Reliance */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">mark_email_unread</span>
            3. Delivery Limitations of Automated Email Reminders
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            While Remetra incorporates an automated background cron worker to dispatch 3-day deadline email reminders, reminder delivery may be delayed, filtered, or prevented by factors beyond our control, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
            <li>Email provider spam/junk filters or inbox quota limits.</li>
            <li>Incorrect or outdated user email addresses.</li>
            <li>Temporary downtime or network disruptions affecting cloud infrastructure or SMTP servers.</li>
          </ul>
          <p className="text-on-surface-variant leading-relaxed font-semibold">
            Do not rely exclusively on automated email reminders as your sole method for tracking critical financial deadlines.
          </p>
        </section>

        {/* Section 4: No Legal or Financial Advice */}
        <section className="space-y-4 border-t border-[#1E293B] pt-6">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">analytics</span>
            4. Analytics &amp; Spend Insights Disclaimer
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Visual graphs, spend breakdowns, category percentages, and person attribution charts displayed in Remetra are mathematical representations based solely on user-entered records. They do not constitute formal auditing, tax accounting, or financial planning.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-6 px-4 md:px-8 bg-[#0B0F17] text-center text-xs text-outline">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Remetra — Smart Bill Reminders &amp; Spend Insights.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-on-surface transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-on-surface transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="hover:text-on-surface transition-colors">Cookie Notice</Link>
            <Link to="/contact" className="hover:text-on-surface transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
