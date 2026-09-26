import React from "react";

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, paymentTitle, deleting = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="glass-card max-w-md w-full p-6 space-y-4 shadow-2xl border border-error-container/40 animate-in fade-in zoom-in-95 duration-150"
        style={{ boxShadow: "0 0 24px -6px rgba(239, 68, 68, 0.25)" }}
      >
        <div className="w-12 h-12 rounded-xl bg-error-container/30 border border-error/30 flex items-center justify-center text-error mb-2">
          <span className="material-symbols-outlined text-2xl">delete_forever</span>
        </div>

        <div>
          <h3 className="text-headline-md font-headline-md font-semibold text-on-surface">
            Are you sure you want to delete this payment?
          </h3>
          <p className="text-body-sm font-body-sm text-outline mt-2 leading-relaxed">
            This action cannot be undone and will permanently remove all reminder schedules, recurrence cycles, and vault history for{" "}
            <span className="font-semibold text-on-surface">{paymentTitle || "this payment"}</span>.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="px-4 py-2 border border-outline-variant hover:bg-surface-container text-on-surface rounded-xl text-label-md font-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="px-4 py-2 bg-error text-on-error hover:bg-opacity-90 rounded-xl text-label-md font-label-md font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {deleting && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
            <span>Delete Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
