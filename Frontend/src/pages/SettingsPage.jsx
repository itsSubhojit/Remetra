import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/Navigation/Sidebar";
import { PaymentFormDrawer } from "../components/Modals/PaymentFormDrawer";

export const SettingsPage = () => {
  const { user, updateUserProfile, resetPassword, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(tabParam);

  const [nameInput, setNameInput] = useState(user?.displayName || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");

  // Drawer state for "+ New Payment" triggered from sidebar
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "profile";
    setActiveTab(currentTab);
  }, [searchParams]);

  useEffect(() => {
    if (user?.displayName) {
      setNameInput(user.displayName);
    }
  }, [user]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Vault Member";
  const displayEmail = user?.email || "vault@remetra.app";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "RV";

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    try {
      setIsSavingName(true);
      setError("");
      if (updateUserProfile) {
        await updateUserProfile(nameInput.trim());
      }
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile name.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSendReset = async () => {
    if (!user?.email) return;
    try {
      setResetLoading(true);
      setError("");
      await resetPassword(user.email);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  return (
    <div className="bg-[#0B0F17] text-on-surface antialiased min-h-screen flex selection:bg-primary-container selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        onOpenNewPayment={() => setIsDrawerOpen(true)}
      />

      {/* Main Page Canvas */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 pb-28 md:pb-12 bg-[#0B0F17]">
        {/* Sticky Header */}
        <header className="flex items-center justify-between w-full px-4 md:px-8 py-3 sticky top-0 z-30 bg-[#0B0F17]/85 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </div>
            <h1 className="text-headline-sm md:text-headline-md font-headline-md font-bold text-on-surface tracking-tight truncate">
              Account &amp; Settings
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-xs text-white font-bold ring-1 ring-white/10">
              {initials}
            </div>
          </div>
        </header>

        {/* Content Workspace */}
        <main className="max-w-4xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/40 text-error text-body-md flex items-center gap-2.5">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Sub-Navigation Segmented Control */}
          <div className="grid grid-cols-3 gap-1 bg-[#151D2A] p-1.5 rounded-2xl border border-[#1E293B] w-full">
            <button
              type="button"
              onClick={() => handleTabChange("profile")}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs sm:text-label-md font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-primary-container text-on-primary-container shadow-md shadow-primary-container/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">person</span>
              <span className="truncate">Profile</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("preferences")}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs sm:text-label-md font-semibold transition-all ${
                activeTab === "preferences"
                  ? "bg-primary-container text-on-primary-container shadow-md shadow-primary-container/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">tune</span>
              <span className="truncate">Settings</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("security")}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs sm:text-label-md font-semibold transition-all ${
                activeTab === "security"
                  ? "bg-primary-container text-on-primary-container shadow-md shadow-primary-container/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">shield</span>
              <span className="truncate">Security</span>
            </button>
          </div>

          {/* TAB 1: PROFILE & ACCOUNT */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="p-6 rounded-2xl bg-[#151D2A] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-400 flex items-center justify-center text-white text-headline-md font-bold shadow-lg shadow-indigo-500/25">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">{displayName}</h2>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">{displayEmail}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-tertiary text-label-sm font-label-sm font-semibold">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                      <span>Verified Household Vault Member</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-full text-label-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                    Active
                  </span>
                </div>
              </div>

              {/* Edit Display Name */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#151D2A] border border-[#1E293B] space-y-4">
                <div>
                  <h3 className="text-label-lg font-label-lg font-semibold text-on-surface">Personal Information</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Update your display name visible across your household reminders and insights.
                  </p>
                </div>

                <form onSubmit={handleUpdateName} className="space-y-4">
                  <div>
                    <label className="text-label-md font-label-md text-on-surface block mb-1.5">
                      Display Name
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full sm:flex-1 h-11 px-3.5 bg-[#0B0F17] border border-[#1E293B] focus:border-primary rounded-xl text-body-md text-on-surface placeholder:text-outline focus:outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={isSavingName || !nameInput.trim() || nameInput.trim() === user?.displayName}
                        className="w-full sm:w-auto px-6 h-11 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md font-semibold transition-all disabled:bg-surface-container-high disabled:text-outline/60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSavingName ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>

                  {nameSuccess && (
                    <div className="p-3 rounded-xl bg-tertiary-container/20 border border-tertiary/40 text-tertiary text-body-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Profile name updated successfully!</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Account Credentials */}
              <div className="p-6 rounded-2xl bg-[#151D2A] border border-[#1E293B] space-y-4">
                <div>
                  <h3 className="text-label-lg font-label-lg font-semibold text-on-surface">Authentication Details</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Your authenticated credentials linked to your Remetra backend records.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
                    <span className="text-label-sm font-label-sm text-outline block">Registered Email</span>
                    <span className="text-body-md font-mono text-on-surface font-medium mt-1 block">
                      {displayEmail}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
                    <span className="text-label-sm font-label-sm text-outline block">Vault Status</span>
                    <span className="text-body-md text-tertiary font-semibold mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      Encrypted &amp; Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VAULT SETTINGS */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#151D2A] border border-[#1E293B] space-y-5">
                <div>
                  <h3 className="text-label-lg font-label-lg font-semibold text-on-surface">Financial Preferences</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Display parameters used throughout your dashboard and spend analytics.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <h4 className="text-label-md font-semibold text-on-surface">Default Currency</h4>
                    <p className="text-body-sm text-on-surface-variant">Active monetary notation</p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-primary font-bold text-label-md border border-outline-variant/30">
                    ₹ INR (Indian Rupee)
                  </span>
                </div>

              </div>

              {/* Notification Preferences */}
              <div className="p-6 rounded-2xl bg-[#151D2A] border border-[#1E293B] space-y-5">
                <div>
                  <h3 className="text-label-lg font-label-lg font-semibold text-on-surface">Reminder Schedule</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Automated alerts sent directly to your email address before bills expire.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <h4 className="text-label-md font-semibold text-on-surface">Reminder Window</h4>
                    <p className="text-body-sm text-on-surface-variant">Alert trigger horizon prior to deadline</p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-amber-400 font-bold text-label-md border border-outline-variant/30 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    3 Days Prior
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <h4 className="text-label-md font-semibold text-on-surface">Email Delivery Address</h4>
                    <p className="text-body-sm text-on-surface-variant">Target recipient for bill alert notifications</p>
                  </div>
                  <span className="text-body-sm font-mono text-tertiary font-semibold">{displayEmail}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & RESET */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Password Reset */}
              <div className="p-6 rounded-2xl bg-[#151D2A] border border-[#1E293B] space-y-4">
                <div>
                  <h3 className="text-label-lg font-label-lg font-semibold text-on-surface">Password &amp; Credentials</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Dispatch an official password reset email to your registered inbox.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleSendReset}
                    disabled={resetLoading}
                    className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container border border-outline-variant/40 text-on-surface font-label-md font-semibold flex items-center gap-2 transition"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                    <span>{resetLoading ? "Sending Link..." : "Send Password Reset Email"}</span>
                  </button>
                </div>

                {resetSuccess && (
                  <div className="p-3.5 rounded-xl bg-tertiary-container/20 border border-tertiary/40 text-tertiary text-body-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    <span>Password reset email dispatched to <strong className="font-mono">{displayEmail}</strong>. Please check your inbox.</span>
                  </div>
                )}
              </div>

              {/* Session Termination */}
              <div className="p-6 rounded-2xl bg-red-950/20 border border-error/30 space-y-4">
                <div>
                  <h3 className="text-label-lg font-label-lg font-semibold text-error">End Vault Session</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Log out of this browser session and clear your active Firebase token.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl bg-error text-on-error hover:opacity-90 font-label-md font-semibold flex items-center gap-2 transition"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out of Remetra</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Payment Drawer Support */}
      <PaymentFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={() => {}}
      />
    </div>
  );
};
