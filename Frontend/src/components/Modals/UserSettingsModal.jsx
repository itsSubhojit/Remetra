import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export const UserSettingsModal = ({ isOpen, onClose, initialTab = "profile" }) => {
  const { user, updateUserProfile, resetPassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'preferences' | 'security'
  const [nameInput, setNameInput] = useState(user?.displayName || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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

  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#151D2A] border border-[#1E293B] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F17]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {initials}
            </div>
            <div>
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Account &amp; Settings</h3>
              <p className="text-body-sm text-on-surface-variant">Household Vault Profile &amp; Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#1E293B] bg-[#0F141F]">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 py-3 px-3.5 text-label-md font-label-md border-b-2 font-medium transition-all ${
              activeTab === "profile"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 py-3 px-3.5 text-label-md font-label-md border-b-2 font-medium transition-all ${
              activeTab === "preferences"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 py-3 px-3.5 text-label-md font-label-md border-b-2 font-medium transition-all ${
              activeTab === "security"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">shield</span>
            <span>Security</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scroll flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-error-container/20 border border-error/40 text-error text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Profile Card Summary */}
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-400 flex items-center justify-center text-white text-headline-sm font-bold shadow-md">
                    {initials}
                  </div>
                  <div>
                    <h4 className="text-label-lg font-label-lg font-semibold text-on-surface">{displayName}</h4>
                    <p className="text-body-sm text-on-surface-variant">{displayEmail}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-tertiary text-label-sm font-label-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                      <span>Verified Household Vault Member</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Name Edit Form */}
              <form onSubmit={handleUpdateName} className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface block">Display Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 h-10 px-3 bg-[#0B0F17] border border-[#1E293B] rounded-xl text-body-md text-on-surface focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="submit"
                    disabled={isSavingName || !nameInput.trim() || nameInput.trim() === user?.displayName}
                    className="px-4 h-10 rounded-xl bg-primary-container text-on-primary-container font-label-md font-semibold hover:opacity-95 transition disabled:opacity-40"
                  >
                    {isSavingName ? "Saving..." : "Save"}
                  </button>
                </div>
                {nameSuccess && (
                  <p className="text-tertiary text-body-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Profile name updated successfully!
                  </p>
                )}
              </form>
            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
                <div>
                  <h4 className="text-label-lg font-semibold text-on-surface">Default Currency</h4>
                  <p className="text-body-sm text-on-surface-variant">Standard monetary display format</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-surface-container-high text-primary font-bold text-label-md border border-outline-variant/30">
                  ₹ INR
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
                <div>
                  <h4 className="text-label-lg font-semibold text-on-surface">Reminder Window</h4>
                  <p className="text-body-sm text-on-surface-variant">Automated email alerts before payment due dates</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-surface-container-high text-amber-400 font-bold text-label-md border border-outline-variant/30 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  3 Days Prior
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
                <div>
                  <h4 className="text-label-lg font-semibold text-on-surface">Email Delivery Channel</h4>
                  <p className="text-body-sm text-on-surface-variant">Destination address for Remetra reminders</p>
                </div>
                <span className="text-body-sm font-mono text-tertiary">{displayEmail}</span>
              </div>

            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
                <div>
                  <h4 className="text-label-lg font-semibold text-on-surface">Password &amp; Credentials</h4>
                  <p className="text-body-sm text-on-surface-variant">
                    Send a verified password reset link directly to your registered email address.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendReset}
                  disabled={resetLoading}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container border border-outline-variant/40 text-on-surface font-label-md font-semibold flex items-center gap-2 transition"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  <span>{resetLoading ? "Sending..." : "Send Password Reset Email"}</span>
                </button>

                {resetSuccess && (
                  <p className="text-tertiary text-body-sm flex items-center gap-1.5 pt-1">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    Password reset link dispatched to <span className="font-semibold">{displayEmail}</span>.
                  </p>
                )}
              </div>
              

              <div className="p-4 rounded-xl bg-red-950/20 border border-error/30 space-y-3">
                <div>
                  <h4 className="text-label-lg font-semibold text-error">End Vault Session</h4>
                  <p className="text-body-sm text-on-surface-variant">
                    Sign out of this browser session and clear secure credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="px-4 py-2 rounded-xl bg-error text-on-error hover:opacity-90 font-label-md font-semibold flex items-center gap-2 transition"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out of Remetra</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1E293B] bg-[#0B0F17]/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
