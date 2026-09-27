import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Sidebar = ({ onOpenNewPayment }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      await logout();
      navigate("/auth");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  const handleNavigateToRoute = (tab) => {
    setIsDropdownOpen(false);
    navigate(`/settings?tab=${tab}`);
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Vault Member";
  const displayEmail = user?.email || "vault@remetra.app";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "RV";

  const isOverview = location.pathname === "/dashboard";
  const isPayments = location.pathname === "/payments";
  const isInsights = location.pathname === "/spend-insights" || location.pathname === "/insights";
  const isSettings = location.pathname === "/settings" || location.pathname === "/profile" || location.pathname === "/account";

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col justify-between h-screen w-64 p-4 z-40 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/40">
        <div className="flex flex-col gap-6">
          {/* Brand Anchor */}
          <Link to="/dashboard" className="flex items-center gap-3 px-2 py-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <span className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight block">Remetra</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant tracking-wider uppercase">Household Vault</span>
            </div>
          </Link>

          {/* Quick Action CTA */}
          <button
            onClick={onOpenNewPayment}
            className="w-full flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white py-2.5 px-4 rounded-xl text-label-lg font-label-lg transition-all duration-150 shadow-[0_4px_14px_rgba(99,102,241,0.35)] active:scale-[0.98]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Payment</span>
          </button>

          {/* Primary Navigation Links */}
          <nav className="flex flex-col space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-lg font-label-lg transition-all duration-150 ${
                isOverview
                  ? "text-primary font-bold bg-surface-container-low border-l-2 border-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isOverview ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                dashboard
              </span>
              <span>Overview</span>
            </Link>

            <Link
              to="/payments"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-lg font-label-lg transition-all duration-150 ${
                isPayments
                  ? "text-primary font-bold bg-surface-container-low border-l-2 border-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isPayments ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                receipt_long
              </span>
              <span>Payments</span>
            </Link>

            <Link
              to="/spend-insights"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-lg font-label-lg transition-all duration-150 ${
                isInsights
                  ? "text-primary font-bold bg-surface-container-low border-l-2 border-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isInsights ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                insights
              </span>
              <span>Spend Insights</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-lg font-label-lg transition-all duration-150 ${
                isSettings
                  ? "text-primary font-bold bg-surface-container-low border-l-2 border-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isSettings ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                settings
              </span>
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* User Profile Block & Floating Dropdown Container */}
        <div className="pt-4 border-t border-outline-variant/30 flex flex-col gap-3 relative">
          {/* FLOATING DROPDOWN POPUP BOX */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute bottom-20 left-0 right-0 p-2.5 rounded-2xl bg-[#151D2A] border border-[#1E293B] shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 z-50 space-y-1.5"
            >
              {/* Floating Box Header */}
              <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/60 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-white text-xs ring-1 ring-white/10">
                    {initials}
                  </div>
                  <div className="truncate">
                    <p className="text-label-sm font-label-sm font-semibold text-on-surface truncate">{displayName}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{displayEmail}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-tertiary text-[10px] font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                  <span>Active Firebase Session</span>
                </div>
              </div>

              {/* Menu Item 1: Profile & Account Route */}
              <button
                type="button"
                onClick={() => handleNavigateToRoute("profile")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-surface-container-high transition-colors group text-on-surface"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">account_circle</span>
                </div>
                <div>
                  <p className="text-label-md font-label-md font-medium text-on-surface leading-tight">Profile &amp; Account</p>
                  <p className="text-[11px] text-outline leading-tight mt-0.5">Identity &amp; credentials</p>
                </div>
              </button>

              {/* Menu Item 2: Vault Settings Route */}
              <button
                type="button"
                onClick={() => handleNavigateToRoute("preferences")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-surface-container-high transition-colors group text-on-surface"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-400/10 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </div>
                <div>
                  <p className="text-label-md font-label-md font-medium text-on-surface leading-tight">Vault Settings</p>
                  <p className="text-[11px] text-outline leading-tight mt-0.5">Currency &amp; reminders</p>
                </div>
              </button>

              {/* Menu Item 3: Security & Reset Route */}
              <button
                type="button"
                onClick={() => handleNavigateToRoute("security")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-surface-container-high transition-colors group text-on-surface"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                </div>
                <div>
                  <p className="text-label-md font-label-md font-medium text-on-surface leading-tight">Security &amp; Reset</p>
                  <p className="text-[11px] text-outline leading-tight mt-0.5">Password &amp; tokens</p>
                </div>
              </button>

              <div className="border-t border-[#1E293B] my-1"></div>

              {/* Menu Item 4: Sign Out */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-error-container/20 text-error transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-error-container/30 text-error flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </div>
                <div>
                  <p className="text-label-md font-label-md font-semibold leading-tight">Sign Out</p>
                  <p className="text-[11px] text-error/70 leading-tight mt-0.5">End session</p>
                </div>
              </button>
            </div>
          )}

          {/* Interactive Profile Card Trigger */}
          <div
            ref={triggerRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between p-2 rounded-xl bg-surface-container-low border transition-all cursor-pointer select-none group ${
              isDropdownOpen
                ? "border-primary shadow-[0_0_20px_rgba(99,102,241,0.25)] bg-[#182130]"
                : "border-[#1E293B] hover:border-outline-variant hover:bg-surface-container"
            }`}
            title="Account & Settings"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-label-md flex-shrink-0 ring-2 ring-indigo-400/20 group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-label-md font-label-md font-semibold text-on-surface truncate">{displayName}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant truncate">{displayEmail}</p>
              </div>
            </div>

            <div className="flex items-center text-outline group-hover:text-on-surface transition-colors p-1">
              <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-primary" : ""}`}>
                expand_less
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-on-surface-variant text-label-sm font-label-sm">
            <span className="flex items-center gap-1.5 text-tertiary">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              Vault Active
            </span>
            <button
              onClick={handleLogout}
              className="text-outline hover:text-on-surface transition-colors"
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 grid grid-cols-5 items-center px-1 py-1.5 bg-[#0D131E]/95 backdrop-blur-xl border-t border-[#1E293B] shadow-2xl">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isOverview
              ? "text-primary font-bold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={isOverview ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            dashboard
          </span>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">Overview</span>
        </Link>

        <Link
          to="/payments"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isPayments
              ? "text-primary font-bold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={isPayments ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            receipt_long
          </span>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">Payments</span>
        </Link>

        {/* Center Floating Action Button */}
        <div className="flex justify-center items-center">
          <button
            onClick={onOpenNewPayment}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center active:scale-90 transition-transform -mt-3 ring-4 ring-[#0B0F17]"
            type="button"
            title="Add New Payment"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
          </button>
        </div>

        <Link
          to="/spend-insights"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isInsights
              ? "text-primary font-bold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={isInsights ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            insights
          </span>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">Insights</span>
        </Link>

        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isSettings
              ? "text-primary font-bold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
          title="Account & Settings"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={isSettings ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            settings
          </span>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">Settings</span>
        </Link>
      </nav>
    </>
  );
};
