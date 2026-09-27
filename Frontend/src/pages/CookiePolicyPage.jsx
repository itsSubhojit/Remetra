import React from "react";
import { Link } from "react-router-dom";

export const CookiePolicyPage = () => {
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
            <span className="material-symbols-outlined text-[16px]">cookie</span>
            <span>Storage &amp; Persistence Transparency</span>
          </div>
          <h1 className="text-headline-md sm:text-headline-lg font-bold text-on-surface tracking-tight">
            Cookie &amp; Browser Storage Notice
          </h1>
          <p className="text-body-sm text-outline mt-2">
            Effective Date: September 27, 2026 | Last Updated: September 27, 2026
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">storage</span>
            1. How Remetra Handles Browser Storage
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Remetra is built with a zero-noise, privacy-first architecture. We do <strong>NOT</strong> set custom HTTP tracking cookies or use third-party advertising cookies.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">vpn_key</span>
            2. Essential Authentication Session Storage
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            To keep you securely logged in across page reloads without requiring you to re-type your credentials on every navigation, the Google Firebase Web SDK utilizes essential browser storage (specifically <code>IndexedDB</code> / <code>localStorage</code>):
          </p>
          <div className="bg-[#151D2A] p-5 rounded-2xl border border-[#1E293B] space-y-3">
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
              <li><strong>Firebase Auth Persistence Token:</strong> Stores an encrypted session token in your browser so you stay authenticated while using the vault.</li>
              <li><strong>Expiry:</strong> Persists until you explicitly click <em>Sign Out</em> or clear your browser site data.</li>
              <li><strong>Strict Scope:</strong> This token is used exclusively to authenticate API calls between your browser and Remetra's Express backend.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">do_not_disturb_on</span>
            3. Zero Third-Party Analytics &amp; Zero Trackers
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            We respect your digital privacy. Remetra does <strong>NOT</strong> include:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
            <li>Google Analytics or Google Tag Manager scripts.</li>
            <li>Meta (Facebook) Pixel or social media tracking beacons.</li>
            <li>Third-party advertising SDKs or data brokers.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 border-t border-[#1E293B] pt-6">
          <h2 className="text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">tune</span>
            4. Managing Your Browser Data
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            You can clear your authentication tokens at any time by signing out of Remetra or by clearing local site storage in your browser settings (under <code>Privacy &amp; Security &gt; Clear Browsing Data</code>).
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
            <Link to="/disclaimer" className="hover:text-on-surface transition-colors">Disclaimer</Link>
            <Link to="/contact" className="hover:text-on-surface transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
