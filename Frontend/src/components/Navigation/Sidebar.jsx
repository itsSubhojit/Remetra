import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Sidebar = ({ onOpenNewPayment }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
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
              to="/dashboard#spend-breakdown"
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg px-3 py-2.5 text-label-lg font-label-lg transition-all duration-150"
            >
              <span className="material-symbols-outlined">insights</span>
              <span>Spend Insights</span>
            </Link>
          </nav>
        </div>

        {/* User Profile Block & Footer Actions */}
        <div className="pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-[#1E293B]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-label-md flex-shrink-0 ring-2 ring-indigo-400/20">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-label-md font-label-md font-semibold text-on-surface truncate">{displayName}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant truncate">{displayEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
              title="Logout from Vault"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-1 text-on-surface-variant text-label-sm font-label-sm">
            <span className="flex items-center gap-1.5 text-tertiary">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              Vault Active
            </span>
            <button
              onClick={handleLogout}
              className="text-outline hover:text-on-surface transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/40 shadow-lg">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-colors ${
            isOverview
              ? "bg-primary-container text-on-primary-container font-semibold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={isOverview ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            dashboard
          </span>
          <span className="text-label-sm font-label-sm mt-0.5">Overview</span>
        </Link>

        <Link
          to="/payments"
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-colors ${
            isPayments
              ? "bg-primary-container text-on-primary-container font-semibold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={isPayments ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            receipt_long
          </span>
          <span className="text-label-sm font-label-sm mt-0.5">Payments</span>
        </Link>

        <button
          onClick={onOpenNewPayment}
          className="flex flex-col items-center justify-center p-2 rounded-full bg-primary-container text-on-primary shadow-lg shadow-primary-container/30 active:scale-95"
          type="button"
          title="Add Payment"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-error px-3 py-1.5 transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-label-sm font-label-sm mt-0.5">Logout</span>
        </button>
      </nav>
    </>
  );
};
