import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth", { state: { email: emailInput } });
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased overflow-x-hidden selection:bg-primary selection:text-on-primary min-h-screen relative">
      {/* Ambient Light Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed top-1/3 right-10 w-[28rem] h-[28rem] bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-1/3 w-[32rem] h-[32rem] bg-tertiary-container/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header: Docked Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Anchor */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center glow-indigo group-hover:scale-105 transition-all">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-extrabold tracking-tight text-on-surface">Remetra</span>
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">Household Vault</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#features">
              Features
            </a>
            <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">
              How It Works
            </a>
            <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#spend-insights">
              Spend Insights
            </a>
          </nav>

          {/* CTA Action Cluster */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center font-label-lg text-label-lg px-5 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-semibold hover:bg-primary transition-all active:scale-[0.98] shadow-md shadow-primary-container/30"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg px-4 py-2 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center font-label-lg text-label-lg px-5 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-semibold hover:bg-primary transition-all active:scale-[0.98] shadow-md shadow-primary-container/30"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">Smart Recurring Hub</span>
              </div>
              <h1 className="font-display text-display lg:text-[48px] lg:leading-[56px] text-on-surface tracking-tight font-extrabold">
                Never miss a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">recurring payment.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Remetra keeps mobile recharges, electricity bills, and subscriptions organized while helping users understand where their money goes.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/auth"}
                  className="inline-flex items-center justify-center gap-2 font-label-lg text-label-lg px-6 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-semibold hover:bg-primary transition-all active:scale-[0.98] glow-indigo"
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <a
                  className="inline-flex items-center justify-center gap-2 font-label-lg text-label-lg px-6 py-3.5 rounded-xl bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high transition-all"
                  href="#how-it-works"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  <span>See How It Works</span>
                </a>
              </div>
              {/* Proof Metrics Cluster */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-outline-variant/30">
                <div>
                  <div className="font-numeric-metric text-numeric-metric text-on-surface font-bold">100%</div>
                  <div className="font-label-sm text-label-sm text-outline">On-Time Alerts</div>
                </div>
                <div>
                  <div className="font-numeric-metric text-numeric-metric text-on-surface font-bold">₹0</div>
                  <div className="font-label-sm text-label-sm text-outline">Late Penalties</div>
                </div>
                <div>
                  <div className="font-numeric-metric text-numeric-metric text-secondary font-bold">3.2x</div>
                  <div className="font-label-sm text-label-sm text-outline">Clarity Gained</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Interactive Preview Dashboard Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative bg-surface-container-low border border-outline-variant/50 rounded-2xl p-6 glow-indigo backdrop-blur-xl">
                {/* Window Bar */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-error-container"></div>
                    <div className="w-3 h-3 rounded-full bg-surface-bright"></div>
                    <div className="w-3 h-3 rounded-full bg-tertiary-container"></div>
                    <span className="ml-2 font-label-md text-label-md text-on-surface-variant font-medium">Remetra Vault • Household Executive</span>
                  </div>
                  <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary border border-primary/20">
                    Active Sync
                  </span>
                </div>
                {/* Urgent Alerts Cluster */}
                <div className="space-y-3 mb-6">
                  {/* Overdue Alert */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-error-container/10 border border-error/30 glow-red">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-error/20 flex items-center justify-center text-error">
                        <span className="material-symbols-outlined">phone_android</span>
                      </div>
                      <div>
                        <div className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
                          <span>Overdue: Airtel Prepaid</span>
                          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-error/20 text-error border border-error/30">
                            Overdue
                          </span>
                        </div>
                        <div className="font-body-sm text-body-sm text-outline">Validity lapsed yesterday • Subhojit</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-numeric-metric text-[18px] leading-tight text-error font-bold">₹719</div>
                      <Link to="/auth" className="font-label-sm text-label-sm text-primary hover:underline font-medium mt-0.5 inline-block">
                        Pay Now
                      </Link>
                    </div>
                  </div>
                  {/* Due Soon Alert */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary-container/10 border border-secondary/30 glow-sky">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined">bolt</span>
                      </div>
                      <div>
                        <div className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
                          <span>Due in 2 days: Tata Power</span>
                          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                            Due Soon
                          </span>
                        </div>
                        <div className="font-body-sm text-body-sm text-outline">Consumer #9940210 • Home Meter</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-numeric-metric text-[18px] leading-tight text-on-surface font-bold">₹1,420</div>
                      <span className="font-label-sm text-label-sm text-outline">Auto-debit off</span>
                    </div>
                  </div>
                </div>

                {/* Spend Donut Preview Mini Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container rounded-xl p-4 border border-outline-variant/30">
                  <div className="flex items-center gap-4">
                    {/* SVG Donut Chart Mini */}
                    <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <circle className="stroke-surface-container-high" cx="18" cy="18" fill="none" r="14" strokeWidth="3.5"></circle>
                        <circle className="stroke-primary" cx="18" cy="18" fill="none" r="14" strokeDasharray="40 100" strokeDashoffset="0" strokeWidth="3.5"></circle>
                        <circle className="stroke-secondary" cx="18" cy="18" fill="none" r="14" strokeDasharray="30 100" strokeDashoffset="-40" strokeWidth="3.5"></circle>
                        <circle className="stroke-tertiary" cx="18" cy="18" fill="none" r="14" strokeDasharray="18 100" strokeDashoffset="-70" strokeWidth="3.5"></circle>
                      </svg>
                      <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">MAY</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-outline">Monthly Spent</span>
                      <div className="font-numeric-metric text-headline-md font-bold text-on-surface">₹10,150</div>
                      <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        All marked paid
                      </span>
                    </div>
                  </div>
                  {/* Breakdown Pill Tags */}
                  <div className="flex flex-col justify-center gap-2 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-3 sm:pt-0 sm:pl-4">
                    <div className="flex items-center justify-between text-body-sm font-body-sm">
                      <span className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="w-2 h-2 rounded-full bg-primary"></span> Subscriptions
                      </span>
                      <span className="text-on-surface font-semibold">₹4,500</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm font-body-sm">
                      <span className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span> Electricity
                      </span>
                      <span className="text-on-surface font-semibold">₹3,520</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm font-body-sm">
                      <span className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span> Mobile Recharges
                      </span>
                      <span className="text-on-surface font-semibold">₹2,130</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Features Section */}
        <section className="py-20 bg-surface-container-low border-y border-outline-variant/30 relative" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Comprehensive Coverage</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Built for recurring life essentials</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                No more buried emails or SMS panics. Remetra categorizes recurring deadlines with surgical accuracy.
              </p>
            </div>
            {/* 3 Distinct Feature Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Recharge */}
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/50 hover:border-primary/40 transition-all hover:-translate-y-1 glow-indigo group">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">phone_iphone</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Recharge</h3>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Prepaid &amp; Postpaid
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Track prepaid validity expiry and postpaid billing cycles seamlessly. Keep family SIM packs active without surprise blackouts.
                </p>
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-2">
                  <div className="flex justify-between items-center text-body-sm font-body-sm">
                    <span className="text-on-surface font-medium">Jio 5G Annual Plan</span>
                    <span className="text-tertiary">Active (128d left)</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
              </div>

              {/* Card 2: Electricity */}
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/50 hover:border-secondary/40 transition-all hover:-translate-y-1 glow-sky group">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/20 border border-secondary/40 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">bolt</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Electricity</h3>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                    Utility Vault
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Meter readings, consumer ID vaults, and monthly bill alerts with zero friction. Save multiple regional boards in one secure drawer.
                </p>
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-2">
                  <div className="flex justify-between items-center text-body-sm font-body-sm">
                    <span className="text-on-surface font-medium">BESCOM Consumer #1024</span>
                    <span className="text-on-surface-variant">Bill generated</span>
                  </div>
                  <div className="flex justify-between items-center text-label-sm font-label-sm text-outline">
                    <span>Cycle: 1st-30th</span>
                    <span className="text-secondary font-semibold">Due in 5 Days</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Subscriptions */}
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/50 hover:border-tertiary/40 transition-all hover:-translate-y-1 glow-indigo group">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 border border-tertiary/40 flex items-center justify-center text-tertiary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">subscriptions</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Subscriptions</h3>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary border border-tertiary/20">
                    Cloud &amp; OTT
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Manage Netflix, Spotify, AWS, and cloud renewals with automated notices. Eliminate forgotten free-trials before they renew.
                </p>
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-2">
                  <div className="flex justify-between items-center text-body-sm font-body-sm">
                    <span className="text-on-surface font-medium">AWS Cloud Architecture</span>
                    <span className="text-on-surface font-semibold">₹3,450/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-label-sm font-label-sm text-outline">
                    <span>Next debit: 28th</span>
                    <span className="text-tertiary font-medium">Auto-renew alert on</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spend Insights Showcase */}
        <section className="py-24 max-w-7xl mx-auto px-6" id="spend-insights">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left Explainer */}
            <div className="lg:w-5/12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">insights</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
                  Spend Intelligence
                </span>
              </div>
              <h2 className="font-display text-display lg:text-[36px] lg:leading-[44px] text-on-surface font-bold">
                Clarity between what was spent and what is upcoming.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Remetra introduces uncompromising financial truth. We deliberately isolate settled cash outflows from pending obligations to prevent deceptive cashflow projections.
              </p>
              {/* Distinction Banner */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-primary/30 flex gap-3.5 items-start">
                <span className="material-symbols-outlined text-primary mt-0.5">verified</span>
                <div>
                  <div className="font-label-lg text-label-lg text-on-surface font-semibold">Strict Settlement Logic</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Actual spending = payments marked <span className="text-tertiary font-semibold">Paid</span>. Upcoming obligations remain earmarked without skewing past analytics.
                  </div>
                </div>
              </div>
              {/* Feature Bullets */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center text-xs">✓</span>
                  <span className="font-body-md text-body-md text-on-surface">Categorical breakdown by family member</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center text-xs">✓</span>
                  <span className="font-body-md text-body-md text-on-surface">Proactive liquidity warnings before heavy cycles</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center text-xs">✓</span>
                  <span className="font-body-md text-body-md text-on-surface">Export-ready statements for tax audits</span>
                </div>
              </div>
            </div>

            {/* Right Insights Interactive Graphic / Card Matrix */}
            <div className="lg:w-7/12 w-full bg-surface-container-low border border-outline-variant/60 rounded-3xl p-6 lg:p-8 relative">
              {/* Month Metric Header */}
              <div className="flex flex-wrap items-center justify-between pb-6 border-b border-outline-variant/30 gap-4">
                <div>
                  <span className="font-label-md text-label-md text-outline block">Actual Settled Outflow</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="font-numeric-metric text-display text-on-surface font-bold tracking-tight">₹10,150</span>
                    <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary border border-tertiary/30 font-medium">
                      Actual spending = payments marked Paid
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-label-sm text-outline block uppercase tracking-wider">Upcoming Obligations</span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">₹2,139 Due Soon</span>
                </div>
              </div>

              {/* Visual Insights Split: Donut & Household Member Allocations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                {/* Left Half: Category Donut & Proportions */}
                <div className="space-y-4">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    Category Breakdown
                  </span>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 36 36">
                        <circle className="stroke-surface-container" cx="18" cy="18" fill="none" r="14" strokeWidth="3"></circle>
                        <circle className="stroke-primary" cx="18" cy="18" fill="none" r="14" strokeDasharray="21 100" strokeDashoffset="0" strokeWidth="3.6"></circle>
                        <circle className="stroke-secondary" cx="18" cy="18" fill="none" r="14" strokeDasharray="35 100" strokeDashoffset="-21" strokeWidth="3.6"></circle>
                        <circle className="stroke-tertiary" cx="18" cy="18" fill="none" r="14" strokeDasharray="44 100" strokeDashoffset="-56" strokeWidth="3.6"></circle>
                      </svg>
                      <div className="absolute text-center">
                        <span className="font-label-sm text-label-sm text-outline block">Categories</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">3 Sectors</span>
                      </div>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-body-sm font-body-sm">
                      <span className="flex items-center gap-2 text-on-surface">
                        <span className="w-3 h-3 rounded-full bg-primary"></span> Recharge (21%)
                      </span>
                      <span className="text-on-surface-variant">₹2,130</span>
                    </div>
                    <div className="flex justify-between items-center text-body-sm font-body-sm">
                      <span className="flex items-center gap-2 text-on-surface">
                        <span className="w-3 h-3 rounded-full bg-secondary"></span> Electricity (35%)
                      </span>
                      <span className="text-on-surface-variant">₹3,520</span>
                    </div>
                    <div className="flex justify-between items-center text-body-sm font-body-sm">
                      <span className="flex items-center gap-2 text-on-surface">
                        <span className="w-3 h-3 rounded-full bg-tertiary"></span> Subscription (44%)
                      </span>
                      <span className="text-on-surface-variant">₹4,500</span>
                    </div>
                  </div>
                </div>

                {/* Right Half: Person Breakdown Horizontal Bars */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-6 md:pt-0 md:pl-6">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    Household Distribution
                  </span>
                  <div className="space-y-5 pt-2">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-label-md text-label-md">
                        <span className="text-on-surface font-medium flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                          Subhojit
                        </span>
                        <span className="text-on-surface font-bold">₹4,850</span>
                      </div>
                      <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: "48%" }}></div>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline mt-1 block">Airtel 5G, AWS Server, Gym</span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-label-md text-label-md">
                        <span className="text-on-surface font-medium flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-secondary">person_outline</span>
                          Mom
                        </span>
                        <span className="text-on-surface font-bold">₹2,100</span>
                      </div>
                      <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: "21%" }}></div>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline mt-1 block">Jio SIM, Med Top-up</span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-label-md text-label-md">
                        <span className="text-on-surface font-medium flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-tertiary">diversity_3</span>
                          Family (Shared)
                        </span>
                        <span className="text-on-surface font-bold">₹3,200</span>
                      </div>
                      <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                        <div className="bg-tertiary h-full rounded-full" style={{ width: "31%" }}></div>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline mt-1 block">Tata Power, Fiber Net</span>
                    </div>
                  </div>

                  <div className="mt-6 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex justify-between items-center">
                    <span className="font-label-sm text-label-sm text-outline">Household Tracking</span>
                    <span className="font-label-sm text-label-sm text-primary font-bold">Multiple Members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section: 3-step progression */}
        <section className="py-20 bg-surface-container-low border-t border-outline-variant/30 relative" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Effortless Automation</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">How Remetra works</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Three simple steps to take permanent control over monthly obligations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="relative bg-surface-container rounded-2xl p-8 border border-outline-variant/40 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface font-headline-sm font-bold">
                  01
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Add your recurring payment</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Input electricity boards, telecom providers, or streaming services in seconds. Remetra tracks due dates and recurrence frequencies.
                </p>
                <div className="pt-4 flex items-center gap-2 text-primary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Fast 20-second setup</span>
                </div>
              </div>
              {/* Step 2 */}
              <div className="relative bg-surface-container rounded-2xl p-8 border border-outline-variant/40 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary font-headline-sm font-bold glow-indigo">
                  02
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Remetra reminds you before it is due</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Receive smart automated email notifications prior to deadline. Zero surprise late fees or missed recharges.
                </p>
                <div className="pt-4 flex items-center gap-2 text-secondary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                  <span>Contextual email alerts</span>
                </div>
              </div>
              {/* Step 3 */}
              <div className="relative bg-surface-container rounded-2xl p-8 border border-outline-variant/40 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-tertiary font-headline-sm font-bold">
                  03
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Track your actual spending</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Mark items paid and watch your executive dashboard synthesize true outflows, family splits, and monthly consumption trends automatically.
                </p>
                <div className="pt-4 flex items-center gap-2 text-tertiary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                  <span>Zero guesswork ledger</span>
                </div>
              </div>
            </div>
            {/* Conversion Strip */}
            <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-8 glow-indigo" id="get-started">
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Ready to master your household cashflow?</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Join households keeping their electricity, mobile bills, and streaming subscriptions in order.
                </p>
              </div>
              <form onSubmit={handleGetStarted} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  className="px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-body-md text-body-md"
                  placeholder="Enter your email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-container text-on-primary-container font-semibold rounded-xl hover:bg-primary transition-all active:scale-[0.98] font-label-lg text-label-lg whitespace-nowrap"
                >
                  Get Started Free
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-outline-variant/30">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center glow-indigo">
                  <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                </div>
                <span className="font-headline-md text-headline-md font-extrabold text-on-surface">Remetra</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Smart Bill Reminders &amp; Spend Insights. Built for uncompromising household clarity and zero late fees.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container border border-outline-variant/40">
                <span className="material-symbols-outlined text-tertiary text-[16px]">encrypted</span>
                <span className="font-label-sm text-label-sm text-on-surface">Firebase Protected Isolation</span>
              </div>
            </div>
            <div className="space-y-3">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold block">Product</span>
              <ul className="space-y-2 font-body-md text-body-md">
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#features">Recharge Tracker</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#features">Electricity Vault</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#features">Subscription Manager</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#spend-insights">Spend Insights</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold block">Solutions</span>
              <ul className="space-y-2 font-body-md text-body-md">
                <li><Link className="text-on-surface-variant hover:text-on-surface transition-colors" to="/dashboard">Household Overview</Link></li>
                <li><Link className="text-on-surface-variant hover:text-on-surface transition-colors" to="/payments">Payments Management</Link></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">Automated Reminders</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold block">Legal &amp; Trust</span>
              <ul className="space-y-2 font-body-md text-body-md">
                <li><Link className="text-on-surface-variant hover:text-on-surface transition-colors" to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link className="text-on-surface-variant hover:text-on-surface transition-colors" to="/terms">Terms of Service</Link></li>
                <li><Link className="text-on-surface-variant hover:text-on-surface transition-colors" to="/disclaimer">Disclaimer</Link></li>
                <li><Link className="text-on-surface-variant hover:text-on-surface transition-colors" to="/cookie-policy">Cookie Notice</Link></li>
                <li><Link className="text-on-surface-variant hover:text-on-surface transition-colors" to="/contact">Support &amp; Grievance</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-outline">
            <div>© {new Date().getFullYear()} Remetra — Smart Bill Reminders &amp; Spend Insights. All rights reserved.</div>
            <div className="flex items-center gap-4 flex-wrap">
              <Link className="hover:text-on-surface transition-colors" to="/privacy-policy">Privacy</Link>
              <Link className="hover:text-on-surface transition-colors" to="/terms">Terms</Link>
              <Link className="hover:text-on-surface transition-colors" to="/disclaimer">Disclaimer</Link>
              <Link className="hover:text-on-surface transition-colors" to="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
