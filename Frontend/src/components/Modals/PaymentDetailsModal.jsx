import React from "react";

export const PaymentDetailsModal = ({ isOpen, onClose, onEdit, payment }) => {
  if (!isOpen || !payment) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <span className="status-paid px-2 py-0.5 rounded-full text-label-sm font-label-sm">Paid</span>;
      case "Due":
        return <span className="status-due px-2 py-0.5 rounded-full text-label-sm font-label-sm">Due Soon</span>;
      case "Overdue":
        return <span className="status-overdue px-2 py-0.5 rounded-full text-label-sm font-label-sm">Overdue</span>;
      default:
        return <span className="status-upcoming px-2 py-0.5 rounded-full text-label-sm font-label-sm">Upcoming</span>;
    }
  };

  const formattedDate = payment.dueDate ? new Date(payment.dueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) : "Not specified";

  const formattedPaidDate = payment.paidDate ? new Date(payment.paidDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) : null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scroll p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl border border-outline-variant animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-outline-variant/40 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-primary">
                {payment.personName}
              </span>
              {getStatusBadge(payment.status)}
            </div>
            <h3 className="text-headline-md font-headline-md font-semibold text-on-surface">
              {payment.title}
            </h3>
            <p className="text-body-sm font-body-sm text-outline">{payment.provider}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-outline hover:text-on-surface rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 py-1">
          <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
            <span className="text-label-sm font-label-sm text-outline block">TOTAL AMOUNT</span>
            <span className="text-headline-sm font-numeric-metric font-semibold text-on-surface mt-0.5 block">
              ₹{Number(payment.amount).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
            <span className="text-label-sm font-label-sm text-outline block">FREQUENCY</span>
            <span className="text-body-md font-medium text-on-surface mt-1 block">
              {payment.frequency}
            </span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="space-y-2 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 text-body-sm">
          <div className="flex justify-between py-1 border-b border-outline-variant/20">
            <span className="text-outline">Category</span>
            <span className="text-on-surface font-medium">{payment.category}</span>
          </div>

          {/* Recharge Category Details */}
          {payment.category === "Recharge" && (
            <>
              {payment.mobileNumber && (
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-outline">Mobile Number</span>
                  <span className="text-on-surface font-mono">{payment.mobileNumber}</span>
                </div>
              )}
              {payment.rechargeType && (
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-outline">Recharge Type</span>
                  <span className="text-on-surface font-medium">{payment.rechargeType}</span>
                </div>
              )}
              {payment.validityDays && (
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-outline">Plan Validity</span>
                  <span className="text-on-surface font-medium">{payment.validityDays} Days</span>
                </div>
              )}
            </>
          )}

          {/* Electricity Category Details */}
          {payment.category === "Electricity" && payment.consumerId && (
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-outline">Consumer ID</span>
              <span className="text-on-surface font-mono">{payment.consumerId}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-outline-variant/20">
            <span className="text-outline">Next Due Date</span>
            <span className="text-on-surface font-mono">{formattedDate}</span>
          </div>
          {formattedPaidDate && (
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-outline">Paid Date</span>
              <span className="text-tertiary font-mono">{formattedPaidDate}</span>
            </div>
          )}
          {payment.notes && (
            <div className="py-1">
              <span className="text-outline block mb-0.5">Notes</span>
              <span className="text-on-surface text-body-sm italic">{payment.notes}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-outline-variant hover:bg-surface-container text-on-surface rounded-xl text-label-md font-label-md transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(payment);
            }}
            className="px-4 py-2 bg-primary-container text-on-primary rounded-xl text-label-md font-label-md hover:opacity-95 transition-all shadow-md shadow-primary-container/20"
          >
            Edit Payment
          </button>
        </div>
      </div>
    </div>
  );
};
