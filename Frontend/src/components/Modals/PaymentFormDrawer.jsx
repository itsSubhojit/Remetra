import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { paymentsApi } from "../../services/api";
import { normalizeDateToISO } from "../../utils/dateUtils";

const PROVIDER_SUGGESTIONS = {
  Recharge: ["Jio", "Airtel", "Vi", "BSNL", "Google Fi", "Other"],
  Electricity: ["WBSEDCL", "CESC Limited", "Tata Power", "BESCOM", "Adani Electricity", "MSEB", "Other"],
  Subscription: ["Netflix", "JioHotstar", "Spotify", "Amazon Prime", "YouTube Premium", "Apple One", "GitHub", "Other"],
};

export const PaymentFormDrawer = ({ isOpen, onClose, onSave, editingPayment = null }) => {
  const { getToken } = useAuth();

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

  // AI Receipt Extraction States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState("");
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [undetectedFields, setUndetectedFields] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const resetFormToDefaults = () => {
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
  };

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
      resetFormToDefaults();
    }

    // Reset extraction state when drawer opens or changes target
    setError("");
    setIsExtracting(false);
    setExtractionError("");
    setExtractionSuccess(false);
    setUndetectedFields([]);
    setPreviewUrl("");
    setFileType("");
    setFileName("");
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [editingPayment, isOpen]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setUndetectedFields((prev) => prev.filter((f) => f !== "category"));
    const suggested = PROVIDER_SUGGESTIONS[newCat];
    if (suggested && suggested.length > 0) {
      setProvider(suggested[0]);
      setCustomProvider(false);
    }
  };

  /**
   * Processes selected receipt file, validates type/size, extracts data via AI backend,
   * validates document type, and populates form fields without auto-saving.
   */
  const handleReceiptFile = (file) => {
    if (!file) return;

    // 1. File Type Check
    const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setExtractionError("Unsupported file type. Please upload a JPG, PNG, WebP image or PDF document.");
      return;
    }

    // 2. Client-Side Size Check (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setExtractionError("File size exceeds 10MB. Please choose a smaller file.");
      return;
    }

    // 3. Clear previous extraction error/success
    setExtractionError("");
    setExtractionSuccess(false);
    setUndetectedFields([]);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") return;
      const base64Data = dataUrl.split(",")[1];

      setFileName(file.name);
      setFileType(file.type);
      setIsExtracting(true);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required. Please log in again.");
        }

        const res = await paymentsApi.extractReceipt(
          {
            imageData: base64Data,
            mimeType: file.type,
          },
          token
        );

        const extracted = res?.data;
        if (!extracted) {
          throw new Error("No data returned from receipt analysis.");
        }

        // Validation: Verify document is a supported payment receipt/bill
        if (extracted.isValidReceipt === false) {
          setPreviewUrl("");
          setFileType("");
          setFileName("");
          setExtractionSuccess(false);
          setUndetectedFields([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setExtractionError("Not a supported bill or receipt. Please upload a valid payment receipt or bill.");
          return;
        }

        // Supported receipt: set preview URL and populate form state
        setPreviewUrl(dataUrl);

        const missing = [];

        // Category (strictly one of Recharge, Electricity, Subscription)
        if (extracted.category && ["Recharge", "Electricity", "Subscription"].includes(extracted.category)) {
          setCategory(extracted.category);
          if (extracted.provider) {
            const suggestions = PROVIDER_SUGGESTIONS[extracted.category] || [];
            if (suggestions.includes(extracted.provider)) {
              setProvider(extracted.provider);
              setCustomProvider(false);
            } else {
              setProvider(extracted.provider);
              setCustomProvider(true);
            }
          } else {
            missing.push("provider");
          }
        } else {
          missing.push("category");
          if (extracted.provider) {
            setProvider(extracted.provider);
            setCustomProvider(true);
          } else {
            missing.push("provider");
          }
        }

        // Person Name
        if (extracted.personName && typeof extracted.personName === "string" && extracted.personName.trim()) {
          setPersonName(extracted.personName.trim());
        } else {
          missing.push("personName");
        }

        // Title
        if (extracted.title && typeof extracted.title === "string" && extracted.title.trim()) {
          setTitle(extracted.title.trim());
        } else {
          missing.push("title");
        }

        // Amount
        if (extracted.amount !== null && extracted.amount !== undefined && !isNaN(Number(extracted.amount))) {
          setAmount(String(extracted.amount));
        } else {
          missing.push("amount");
        }

        // Due Date
        if (extracted.dueDate) {
          const normalized = normalizeDateToISO(extracted.dueDate);
          if (normalized) {
            setDueDate(normalized);
          } else {
            missing.push("dueDate");
          }
        } else {
          missing.push("dueDate");
        }

        // Frequency
        if (extracted.frequency && ["Weekly", "Monthly", "Yearly"].includes(extracted.frequency)) {
          setFrequency(extracted.frequency);
        }

        setUndetectedFields(missing);
        setExtractionSuccess(true);
      } catch (err) {
        // Safe diagnostic logging: log only sanitized metadata, never raw error message or request payloads
        const errorStatus = err?.status || "Unknown";
        const errorType = err?.name || "ExtractionError";
        console.error(`[Receipt AI Client] Extraction request failed. Status: ${errorStatus}, Type: ${errorType}`);

        setPreviewUrl("");
        setFileType("");
        setFileName("");
        setExtractionSuccess(false);
        setUndetectedFields([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Friendly error message: never expose raw backend JSON, Gemini quota, or technical error messages
        let userMessage = "We couldn’t process your receipt at the moment. Please try again later or enter the payment details manually.";
        if (err.message && err.message.includes("Authentication required")) {
          userMessage = "Authentication required. Please log in again.";
        }

        setExtractionError(userMessage);
      } finally {
        setIsExtracting(false);
      }
    };

    reader.onerror = () => {
      setPreviewUrl("");
      setFileType("");
      setFileName("");
      setExtractionSuccess(false);
      setUndetectedFields([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setExtractionError("We couldn’t process your receipt at the moment. Please try again later or enter the payment details manually.");
    };

    reader.readAsDataURL(file);
  };

  /**
   * Resets scanner state AND resets the Add Payment form to its clean initial default state,
   * clearing any AI-populated or edited values.
   */
  const handleClearReceipt = () => {
    setPreviewUrl("");
    setFileType("");
    setFileName("");
    setExtractionSuccess(false);
    setExtractionError("");
    setUndetectedFields([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    resetFormToDefaults();
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

            {/* AI Receipt Upload Card (Only visible in Add Payment flow) */}
            {!editingPayment && (
              <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 p-3.5 transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="text-label-md font-label-md font-semibold text-on-surface">Auto-fill with AI Scanner</h3>
                      <p className="text-label-sm text-outline">Upload a bill or recharge receipt to populate details</p>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpg,image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReceiptFile(file);
                    e.target.value = "";
                  }}
                />

                {isExtracting ? (
                  <div className="p-4 rounded-lg bg-primary-container/10 border border-primary/30 flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px] animate-spin">progress_activity</span>
                    <div className="text-left">
                      <p className="text-body-sm font-medium text-on-surface">Analyzing bill with AI...</p>
                      <p className="text-label-sm text-outline">Extracting Your Receipt Data's</p>
                    </div>
                  </div>
                ) : previewUrl && extractionSuccess ? (
                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {fileType === "application/pdf" || previewUrl.startsWith("data:application/pdf") ? (
                        <div
                          className="w-11 h-11 rounded-md bg-error-container/20 border border-error/30 flex items-center justify-center text-error flex-shrink-0"
                          title="PDF Document"
                        >
                          <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                        </div>
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Receipt preview"
                          className="w-11 h-11 object-cover rounded-md border border-outline-variant flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-body-sm font-medium text-on-surface truncate">{fileName}</p>
                          {(fileType === "application/pdf" || previewUrl.startsWith("data:application/pdf")) && (
                            <span className="px-1.5 py-0.5 bg-error-container/30 text-error border border-error/20 text-[10px] font-semibold rounded uppercase tracking-wider flex-shrink-0">
                              PDF
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-label-sm text-emerald-400 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span>Extracted — review fields below</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearReceipt}
                      className="px-2.5 py-1 rounded-lg text-label-sm font-medium text-outline hover:text-error hover:bg-error-container/20 border border-outline-variant/60 hover:border-error/40 transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                      <span>Clear</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleReceiptFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-primary bg-primary-container/15 text-primary"
                        : "border-outline-variant/50 hover:border-primary/60 hover:bg-surface-container-low text-outline hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-primary">upload_file</span>
                      <span className="text-body-sm font-medium">Click to upload or drag & drop</span>
                    </div>
                    <p className="text-label-sm text-outline mt-0.5">Supports JPG, JPEG, PNG, WebP, PDF (Max 10MB)</p>
                  </div>
                )}

                {/* Extraction Error Alert */}
                {extractionError && (
                  <div className="p-2.5 rounded-lg bg-error-container/20 border border-error/40 text-error text-label-md flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] flex-shrink-0">error</span>
                      <span className="text-body-sm">{extractionError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearReceipt}
                      className="px-2 py-0.5 rounded text-label-sm font-medium hover:bg-error-container/40 border border-error/30 transition-colors flex items-center gap-1 flex-shrink-0 text-error"
                      title="Clear error"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                      <span>Clear</span>
                    </button>
                  </div>
                )}

                {/* Undetected / Null Notice Banner */}
                {extractionSuccess && undetectedFields.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-label-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-400 flex-shrink-0">info</span>
                    <span>
                      {`Some details couldn't be detected (${undetectedFields.join(", ")}). Please review and complete below.`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Category Selector Tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-label-md font-label-md text-outline">Category</label>
                {undetectedFields.includes("category") && (
                  <span className="text-amber-400 text-label-sm flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">info</span> Couldn't detect — please select
                  </span>
                )}
              </div>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-label-md font-label-md text-outline">Assigned Person</label>
                  {undetectedFields.includes("personName") && (
                    <span className="text-amber-400 text-label-sm flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">info</span> Couldn't detect
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => {
                    setPersonName(e.target.value);
                    setUndetectedFields((prev) => prev.filter((f) => f !== "personName"));
                  }}
                  placeholder="e.g. Self, Alex, Household, Office..."
                  className={`w-full h-10 bg-surface-container-lowest border rounded-lg px-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none ${
                    undetectedFields.includes("personName")
                      ? "border-amber-500/80 focus:border-amber-400"
                      : "border-outline-variant focus:border-primary"
                  }`}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-label-md font-label-md text-outline">Payment Title</label>
                  {undetectedFields.includes("title") && (
                    <span className="text-amber-400 text-label-sm flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">info</span> Couldn't detect
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setUndetectedFields((prev) => prev.filter((f) => f !== "title"));
                  }}
                  placeholder="e.g. Jio 5G Unlimited"
                  className={`w-full h-10 bg-surface-container-lowest border rounded-lg px-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none ${
                    undetectedFields.includes("title")
                      ? "border-amber-500/80 focus:border-amber-400"
                      : "border-outline-variant focus:border-primary"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Suggested Provider Dropdown + Custom Provider Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-label-md font-label-md text-outline">Service Provider</label>
                  {undetectedFields.includes("provider") && (
                    <span className="text-amber-400 text-label-sm flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">info</span> Couldn't detect
                    </span>
                  )}
                </div>
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
                  onChange={(e) => {
                    setProvider(e.target.value);
                    setUndetectedFields((prev) => prev.filter((f) => f !== "provider"));
                  }}
                  placeholder="e.g. WBSEDCL, Netflix, Vi"
                  className={`w-full h-10 bg-surface-container-lowest border rounded-lg px-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none ${
                    undetectedFields.includes("provider")
                      ? "border-amber-500/80 focus:border-amber-400"
                      : "border-outline-variant focus:border-primary"
                  }`}
                  required
                />
              ) : (
                <select
                  value={provider}
                  onChange={(e) => {
                    setUndetectedFields((prev) => prev.filter((f) => f !== "provider"));
                    if (e.target.value === "Other") {
                      setCustomProvider(true);
                      setProvider("");
                    } else {
                      setProvider(e.target.value);
                    }
                  }}
                  className={`w-full h-10 bg-surface-container-lowest border rounded-lg px-3 text-body-md text-on-surface focus:outline-none ${
                    undetectedFields.includes("provider")
                      ? "border-amber-500/80 focus:border-amber-400"
                      : "border-outline-variant focus:border-primary"
                  }`}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-label-md font-label-md text-outline">Amount (₹)</label>
                  {undetectedFields.includes("amount") && (
                    <span className="text-amber-400 text-label-sm flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">info</span> Couldn't detect
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-semibold">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setUndetectedFields((prev) => prev.filter((f) => f !== "amount"));
                    }}
                    placeholder="0.00"
                    className={`w-full h-10 pl-7 pr-3 bg-surface-container-lowest border rounded-lg text-body-md text-on-surface placeholder:text-outline focus:outline-none font-numeric-metric ${
                      undetectedFields.includes("amount")
                        ? "border-amber-500/80 focus:border-amber-400"
                        : "border-outline-variant focus:border-primary"
                    }`}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-label-md font-label-md text-outline">Due / Expiry Date</label>
                  {undetectedFields.includes("dueDate") && (
                    <span className="text-amber-400 text-label-sm flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">info</span> Couldn't detect
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setUndetectedFields((prev) => prev.filter((f) => f !== "dueDate"));
                  }}
                  className={`w-full h-10 bg-surface-container-lowest border rounded-lg px-3 text-body-md text-on-surface focus:outline-none ${
                    undetectedFields.includes("dueDate")
                      ? "border-amber-500/80 focus:border-amber-400"
                      : "border-outline-variant focus:border-primary"
                  }`}
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
              disabled={submitting || isExtracting}
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
