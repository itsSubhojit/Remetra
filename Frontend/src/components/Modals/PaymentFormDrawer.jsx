import React, { useState, useEffect } from "react";

const PROVIDER_SUGGESTIONS = {
  Recharge: ["Jio", "Airtel", "Vi", "BSNL", "Google Fi", "Other"],
  Electricity: ["WBSEDCL", "CESC Limited", "Tata Power", "BESCOM", "Adani Electricity", "MSEB", "Other"],
  Subscription: ["Netflix", "JioHotstar", "Spotify", "Amazon Prime", "YouTube Premium", "Apple One", "GitHub", "Other"],
};

export const PaymentFormDrawer = ({ isOpen, onClose, onSave, editingPayment = null }) => {
  const [category, setCategory] = useState("Recharge");
  const [personName, setPersonName] = useState("Subhojit");
  const [customPerson, setCustomPerson] = useState("");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [customProvider, setCustomProvider] = useState(false);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [status, setStatus] = useState("Upcoming");
  const [paidDate, setPaidDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingPayment) {
      setCategory(editingPayment.category || "Recharge");
      const person = editingPayment.personName || "Subhojit";
      if (["Subhojit", "Mom", "Family"].includes(person)) {
        setPersonName(person);
        setCustomPerson("");
      } else {
        setPersonName("Custom");
        setCustomPerson(person);
      }
      setTitle(editingPayment.title || "");
      setProvider(editingPayment.provider || "");
      setAmount(editingPayment.amount || "");
      if (editingPayment.dueDate) {
        const formattedDate = new Date(editingPayment.dueDate).toISOString().split("T")[0];
        setDueDate(formattedDate);
      } else {
        setDueDate("");
      }
      setFrequency(editingPayment.frequency || "Monthly");
      setStatus(editingPayment.status || "Upcoming");
      if (editingPayment.paidDate) {
        setPaidDate(new Date(editingPayment.paidDate).toISOString().split("T")[0]);
      } else {
        setPaidDate("");
      }
      setNotes(editingPayment.notes || "");
    } else {
      // Default clean state for new payment
      setCategory("Recharge");
      setPersonName("Subhojit");
      setCustomPerson("");
      setTitle("");
      setProvider(PROVIDER_SUGGESTIONS["Recharge"][0]);
      setCustomProvider(false);
      setAmount("");
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate.toISOString().split("T")[0]);
      setFrequency("Monthly");
      setStatus("Upcoming");
      setPaidDate("");
      setNotes("");
    }
    setError("");
  }, [editingPayment, isOpen]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const suggested = PROVIDER_SUGGESTIONS[newCat];
    if (suggested && suggested.length > 0) {
      setProvider(suggested[0]);
      setCustomProvider(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalPerson = personName === "Custom" ? customPerson.trim() : personName;
    if (!finalPerson) {
      setError("Please specify the assigned person name.");
      return;
    }
    if (!title.trim()) {
      setError("Payment title is required.");
      return;
    }
    if (!provider.trim()) {
      setError("Provider is required.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!dueDate) {
      setError("Due date is required.");
      return;
    }

    const payload = {
      personName: finalPerson,
      title: title.trim(),
      category,
      provider: provider.trim(),
      amount: Number(amount),
      dueDate: new Date(dueDate).toISOString(),
      frequency,
      status,
      notes: notes.trim() || undefined,
    };

    if (status === "Paid") {
      payload.paidDate = paidDate ? new Date(paidDate).toISOString() : new Date().toISOString();
    }

    try {
      setSubmitting(true);
      await onSave(payload, editingPayment?._id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save payment record.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-surface-container-low border-l border-outline-variant/60 shadow-2xl flex flex-col justify-between overflow-y-auto custom-scroll">
          {/* Header */}
          <div className="px-6 py-5 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                {editingPayment ? "Edit Payment" : "Add New Payment"}
              </h2>
              <p className="text-body-sm text-outline mt-0.5">
                {editingPayment ? "Update existing schedule details" : "Schedule a recurring household commitment"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form Content */}
          <form id="paymentForm" onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
            {error && (
              <div className="p-3 rounded-lg bg-error-container/20 border border-error/40 text-error text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Category Selector Tabs */}
            <div>
              <label className="text-label-md font-label-md text-outline block mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-1.5 rounded-xl border border-outline-variant/50">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("Recharge")}
                  className={`py-2 px-3 rounded-lg text-label-md font-label-md transition-all flex items-center justify-center gap-1.5 font-medium ${
                    category === "Recharge"
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
                  <span>Recharge</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange("Electricity")}
                  className={`py-2 px-3 rounded-lg text-label-md font-label-md transition-all flex items-center justify-center gap-1.5 font-medium ${
                    category === "Electricity"
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Electric</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange("Subscription")}
                  className={`py-2 px-3 rounded-lg text-label-md font-label-md transition-all flex items-center justify-center gap-1.5 font-medium ${
                    category === "Subscription"
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">subscriptions</span>
                  <span>Sub</span>
                </button>
              </div>
            </div>

            {/* Assigned Person & Payment Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-label-md font-label-md text-outline block mb-1.5">Assigned Person</label>
                <select
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Subhojit">Subhojit</option>
                  <option value="Mom">Mom</option>
                  <option value="Family">Family</option>
                  <option value="Custom">+ Custom Person...</option>
                </select>
                {personName === "Custom" && (
                  <input
                    type="text"
                    value={customPerson}
                    onChange={(e) => setCustomPerson(e.target.value)}
                    placeholder="Enter name"
                    className="w-full h-9 mt-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                )}
              </div>

              <div>
                <label className="text-label-md font-label-md text-outline block mb-1.5">Payment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Jio 5G Unlimited"
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Suggested Provider Dropdown + Custom Provider Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-label-md font-label-md text-outline">Service Provider</label>
                <button
                  type="button"
                  onClick={() => setCustomProvider(!customProvider)}
                  className="text-label-sm text-primary hover:underline"
                >
                  {customProvider ? "Choose from suggestions" : "Type custom provider"}
                </button>
              </div>

              {customProvider ? (
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. WBSEDCL, Netflix, Vi"
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                  required
                />
              ) : (
                <select
                  value={provider}
                  onChange={(e) => {
                    if (e.target.value === "Other") {
                      setCustomProvider(true);
                      setProvider("");
                    } else {
                      setProvider(e.target.value);
                    }
                  }}
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  {(PROVIDER_SUGGESTIONS[category] || []).map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-label-md font-label-md text-outline block mb-1.5">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-semibold">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-10 pl-7 pr-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-numeric-metric"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-label-md font-label-md text-outline block mb-1.5">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Due Date & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-label-md font-label-md text-outline block mb-1.5">Due / Expiry Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-label-md font-label-md text-outline block mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Due">Due</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Paid Date (Only shown if status is Paid) */}
            {status === "Paid" && (
              <div>
                <label className="text-label-md font-label-md text-tertiary block mb-1.5">Paid Date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full h-10 bg-surface-container-lowest border border-tertiary/40 rounded-lg px-3 text-body-md text-on-surface focus:outline-none focus:border-tertiary"
                />
              </div>
            )}

            {/* Household Notes */}
            <div>
              <label className="text-label-md font-label-md text-outline block mb-1.5">Household Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Split with sibling; verify voucher discount before renewal"
                rows={2}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-end gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant hover:bg-surface-container text-on-surface rounded-xl font-label-md text-label-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="paymentForm"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary rounded-xl font-label-lg text-label-lg shadow-lg shadow-primary-container/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
              <span>{editingPayment ? "Update Payment" : "Save Payment"}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
