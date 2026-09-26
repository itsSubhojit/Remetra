import React, { useState, useEffect } from "react";

const PROVIDER_SUGGESTIONS = {
  Recharge: ["Jio", "Airtel", "Vi", "BSNL", "Google Fi", "Other"],
  Electricity: ["WBSEDCL", "CESC Limited", "Tata Power", "BESCOM", "Adani Electricity", "MSEB", "Other"],
  Subscription: ["Netflix", "JioHotstar", "Spotify", "Amazon Prime", "YouTube Premium", "Apple One", "GitHub", "Other"],
};

export const PaymentFormDrawer = ({ isOpen, onClose, onSave, editingPayment = null }) => {
  const [category, setCategory] = useState("Recharge");
  const [personName, setPersonName] = useState("");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [customProvider, setCustomProvider] = useState(false);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [status, setStatus] = useState("Upcoming");
  const [paidDate, setPaidDate] = useState("");
  const [notes, setNotes] = useState("");

  // Category-specific fields matching real Payment model
  const [mobileNumber, setMobileNumber] = useState("");
  const [rechargeType, setRechargeType] = useState("Prepaid");
  const [validityDays, setValidityDays] = useState("");
  const [consumerId, setConsumerId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingPayment) {
      setCategory(editingPayment.category || "Recharge");
      setPersonName(editingPayment.personName || "");
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

      // Populate category-specific fields
      setMobileNumber(editingPayment.mobileNumber || "");
      setRechargeType(editingPayment.rechargeType || "Prepaid");
      setValidityDays(editingPayment.validityDays ? String(editingPayment.validityDays) : "");
      setConsumerId(editingPayment.consumerId || "");
    } else {
      // Default clean state for new payment
      setCategory("Recharge");
      setPersonName("");
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

      // Category-specific defaults
      setMobileNumber("");
      setRechargeType("Prepaid");
      setValidityDays("");
      setConsumerId("");
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

    if (!personName.trim()) {
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

    // Common fields supported by Backend schema
    const payload = {
      personName: personName.trim(),
      title: title.trim(),
      category,
      provider: provider.trim(),
      amount: Number(amount),
      dueDate: new Date(dueDate).toISOString(),
      frequency,
      status,
    };

    if (notes.trim()) {
      payload.notes = notes.trim();
    }

    // Attach category-specific fields without inventing non-existent ones
    if (category === "Recharge") {
      if (mobileNumber.trim()) {
        payload.mobileNumber = mobileNumber.trim();
      }
      if (rechargeType) {
        payload.rechargeType = rechargeType;
      }
      if (validityDays && Number(validityDays) > 0) {
        payload.validityDays = Number(validityDays);
      }
    } else if (category === "Electricity") {
      // consumerId is OPTIONAL
      if (consumerId.trim()) {
        payload.consumerId = consumerId.trim();
      }
    }

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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <aside className="w-full sm:w-screen sm:max-w-md bg-surface-container-low border-l border-outline-variant/60 shadow-2xl flex flex-col justify-between overflow-y-auto custom-scroll">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-headline-sm sm:text-headline-md font-headline-md font-bold text-on-surface">
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
          <form id="paymentForm" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
            {error && (
              <div className="p-3 rounded-lg bg-error-container/20 border border-error/40 text-error text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Category Selector Tabs */}
            <div>
              <label className="text-label-md font-label-md text-outline block mb-2">Category</label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-surface-container-lowest p-1.5 rounded-xl border border-outline-variant/50">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("Recharge")}
                  className={`py-2 px-1.5 sm:px-3 rounded-lg text-label-sm sm:text-label-md font-label-md transition-all flex items-center justify-center gap-1 sm:gap-1.5 font-medium ${
                    category === "Recharge"
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">signal_cellular_alt</span>
                  <span className="truncate">Recharge</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange("Electricity")}
                  className={`py-2 px-1.5 sm:px-3 rounded-lg text-label-sm sm:text-label-md font-label-md transition-all flex items-center justify-center gap-1 sm:gap-1.5 font-medium ${
                    category === "Electricity"
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">bolt</span>
                  <span className="truncate">Electric</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange("Subscription")}
                  className={`py-2 px-1.5 sm:px-3 rounded-lg text-label-sm sm:text-label-md font-label-md transition-all flex items-center justify-center gap-1 sm:gap-1.5 font-medium ${
                    category === "Subscription"
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">subscriptions</span>
                  <span className="truncate">Sub</span>
                </button>
              </div>
            </div>

            {/* Assigned Person & Payment Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-label-md font-label-md text-outline block mb-1.5">Assigned Person</label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Self, Alex, Household, Office..."
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                  required
                />
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

            {/* Category-Specific Section */}
            {category === "Recharge" && (
              <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/40 space-y-3.5">
                <div className="text-label-sm font-label-sm uppercase tracking-wider text-outline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-sky-400">phonelink_setup</span>
                  <span>Recharge Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-label-sm font-label-sm text-on-surface-variant block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full h-9 bg-surface-container-low border border-outline-variant rounded-lg px-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-label-sm font-label-sm text-on-surface-variant block mb-1">Recharge Type</label>
                    <div className="flex rounded-lg bg-surface-container-low p-0.5 border border-outline-variant">
                      <button
                        type="button"
                        onClick={() => setRechargeType("Prepaid")}
                        className={`flex-1 py-1.5 text-label-sm font-semibold rounded-md transition ${
                          rechargeType === "Prepaid"
                            ? "bg-primary-container text-on-primary shadow-sm"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Prepaid
                      </button>
                      <button
                        type="button"
                        onClick={() => setRechargeType("Postpaid")}
                        className={`flex-1 py-1.5 text-label-sm font-semibold rounded-md transition ${
                          rechargeType === "Postpaid"
                            ? "bg-primary-container text-on-primary shadow-sm"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Postpaid
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-label-sm font-label-sm text-on-surface-variant block mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    placeholder="e.g. 28, 56, 84, 365"
                    className="w-full h-9 bg-surface-container-low border border-outline-variant rounded-lg px-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {category === "Electricity" && (
              <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/40 space-y-2">
                <div className="text-label-sm font-label-sm uppercase tracking-wider text-outline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">electric_meter</span>
                  <span>Electricity Details</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-label-sm font-label-sm text-on-surface-variant">Consumer ID</label>
                    <span className="text-label-sm text-outline">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={consumerId}
                    onChange={(e) => setConsumerId(e.target.value)}
                    placeholder="e.g. 1029384756 (optional)"
                    className="w-full h-9 bg-surface-container-low border border-outline-variant rounded-lg px-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                  />
                  <p className="text-label-sm text-outline mt-1">Consumer / Meter ID as shown on electricity bill.</p>
                </div>
              </div>
            )}

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
                placeholder="e.g. Split with family; verify meter discount before renewal"
                rows={2}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-end gap-3 sticky bottom-0">
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
