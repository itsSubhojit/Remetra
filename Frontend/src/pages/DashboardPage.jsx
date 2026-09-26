import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { paymentsApi } from "../services/api";
import { Sidebar } from "../components/Navigation/Sidebar";
import { PaymentFormDrawer } from "../components/Modals/PaymentFormDrawer";
import { PaymentDetailsModal } from "../components/Modals/PaymentDetailsModal";
import { DeleteConfirmModal } from "../components/Modals/DeleteConfirmModal";

export const DashboardPage = () => {
  const { user, getToken } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals & Drawers state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [detailsPayment, setDetailsPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Table filter state: 'all' | 'pending' | 'paid'
  const [tableFilter, setTableFilter] = useState("all");

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Subhojit";

  // Fetch payments on mount
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const token = await getToken();
      const response = await paymentsApi.getAll(token);
      if (response && response.success && Array.isArray(response.data)) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setError(err.message || "Failed to load payments from vault.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Action Handlers
  const handleSavePayment = async (payload, id) => {
    const token = await getToken();
    if (id) {
      await paymentsApi.update(id, payload, token);
    } else {
      await paymentsApi.create(payload, token);
    }
    await fetchPayments();
  };

  const handleMarkAsPaid = async (paymentId) => {
    try {
      const token = await getToken();
      await paymentsApi.markAsPaid(paymentId, token);
      await fetchPayments();
    } catch (err) {
      alert("Failed to mark as paid: " + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPayment) return;
    try {
      setIsDeleting(true);
      const token = await getToken();
      await paymentsApi.delete(deletingPayment._id, token);
      setDeletingPayment(null);
      await fetchPayments();
    } catch (err) {
      alert("Failed to delete payment: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-Side Calculations
  const metrics = useMemo(() => {
    let totalPaid = 0;
    let pendingObligations = 0;
    let pendingCount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let upcomingRemindersCount = 0;
    let earliestReminder = null;

    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    // Grouping for Spend Insights
    const categoryTotals = { Recharge: 0, Electricity: 0, Subscription: 0 };
    const personTotals = {};

    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      const due = p.dueDate ? new Date(p.dueDate) : null;

      if (p.status === "Paid") {
        totalPaid += amt;
        if (categoryTotals[p.category] !== undefined) {
          categoryTotals[p.category] += amt;
        } else {
          categoryTotals[p.category] = amt;
        }

        const person = p.personName || "Family";
        personTotals[person] = (personTotals[person] || 0) + amt;
      } else if (p.status === "Overdue") {
        overdueCount += 1;
        overdueAmount += amt;
        pendingObligations += amt;
        pendingCount += 1;
      } else {
        // Upcoming or Due
        pendingObligations += amt;
        pendingCount += 1;

        if (due && due <= in7Days && due >= now) {
          upcomingRemindersCount += 1;
          if (!earliestReminder || due < new Date(earliestReminder.dueDate)) {
            earliestReminder = p;
          }
        }
      }
    });

    // Donut calculations
    const catTotalSum = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const catPercentages = {
      Electricity: catTotalSum > 0 ? Math.round((categoryTotals.Electricity / catTotalSum) * 100) : 0,
      Recharge: catTotalSum > 0 ? Math.round((categoryTotals.Recharge / catTotalSum) * 100) : 0,
      Subscription: catTotalSum > 0 ? Math.round((categoryTotals.Subscription / catTotalSum) * 100) : 0,
    };

    // Person bar calculations
    const personArray = Object.keys(personTotals).map((person) => ({
      name: person,
      amount: personTotals[person],
      percentage: totalPaid > 0 ? Math.min(100, Math.round((personTotals[person] / totalPaid) * 100)) : 0,
    }));

    return {
      totalPaid,
      pendingObligations,
      pendingCount,
      overdueCount,
      overdueAmount,
      upcomingRemindersCount,
      earliestReminder,
      categoryTotals,
      catPercentages,
      catTotalSum,
      personArray,
    };
  }, [payments]);

  // Urgent Attention List
  const urgentBills = useMemo(() => {
    return payments
      .filter((p) => p.status === "Overdue" || p.status === "Due" || (p.status === "Upcoming" && p.dueDate && new Date(p.dueDate) <= new Date(Date.now() + 3 * 86400000)))
      .slice(0, 3);
  }, [payments]);

  // Filtered Table Rows
  const filteredPayments = useMemo(() => {
    if (tableFilter === "paid") {
      return payments.filter((p) => p.status === "Paid");
    }
    if (tableFilter === "pending") {
      return payments.filter((p) => p.status !== "Paid");
    }
    return payments;
  }, [payments, tableFilter]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Recharge":
        return "phone_android";
      case "Electricity":
        return "bolt";
      case "Subscription":
        return "subscriptions";
      default:
        return "receipt_long";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <span className="status-paid px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold">Paid</span>;
      case "Due":
        return <span className="status-due px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold">Due</span>;
      case "Overdue":
        return <span className="status-overdue px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold">Overdue</span>;
      default:
        return <span className="status-upcoming px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold">Upcoming</span>;
    }
  };

  const formatDaysRemaining = (dueDateStr, status) => {
    if (status === "Paid") return "Settled";
    if (!dueDateStr) return "N/A";
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)}d overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  // Donut SVG circumference = 301.59 (r = 48)
  const c = 301.59;
  const electLen = (metrics.catPercentages.Electricity / 100) * c;
  const rechLen = (metrics.catPercentages.Recharge / 100) * c;
  const subLen = (metrics.catPercentages.Subscription / 100) * c;

  return (
    <div className="bg-[#0B0F17] text-on-surface antialiased min-h-screen flex selection:bg-primary-container selection:text-white">
      {/* Shared Persistent Sidebar */}
      <Sidebar
        onOpenNewPayment={() => {
          setEditingPayment(null);
          setIsDrawerOpen(true);
        }}
      />

      {/* Main Content Canvas */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 pb-24 md:pb-12 bg-[#0B0F17]">
        {/* Top Navigation Header */}
        <header className="flex justify-between items-center w-full px-4 md:px-8 py-4 sticky top-0 z-30 bg-[#0B0F17]/85 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </div>
              <span className="text-headline-sm font-headline-sm font-extrabold text-on-surface tracking-tight">Remetra</span>
            </div>
            <div>
              <h1 className="text-headline-sm md:text-headline-md font-headline-md font-bold text-on-surface tracking-tight">
                Good day, {displayName}
              </h1>
              <p className="text-body-sm font-body-sm text-on-surface-variant hidden sm:block">
                Here's your real-time payment schedule &amp; spend insights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayments}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Refresh Data"
              type="button"
            >
              <span className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}>refresh</span>
            </button>

            <button
              onClick={() => {
                setEditingPayment(null);
                setIsDrawerOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white px-4 py-2 rounded-lg text-label-lg font-label-lg shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all duration-150 active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ Add Payment</span>
            </button>
          </div>
        </header>

        {/* Workspace Container */}
        <main className="max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/40 text-error text-body-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
              <button onClick={fetchPayments} className="text-label-sm font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {/* KPI METRIC CARDS (4-Column Bento) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Metric 1: Total Paid Spend */}
            <div className="bg-[#151D2A] border border-[#1E293B] rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-indigo-500/30">
              <div className="flex items-start justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Total Paid Spend</span>
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[rgba(16,185,129,0.25)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  Paid only
                </span>
              </div>
              <div className="mt-4">
                <h2 className="text-numeric-metric font-numeric-metric text-on-surface font-semibold tracking-tight">
                  ₹{metrics.totalPaid.toLocaleString("en-IN")}
                </h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant/80 mt-1">Verified settled spending</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-label-sm font-label-sm text-[#10B981]">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Excludes unfulfilled bills</span>
              </div>
            </div>

            {/* Metric 2: Pending Obligations */}
            <div className="bg-[#151D2A] border border-[#1E293B] rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-sky-500/30 luminous-sky-glow">
              <div className="flex items-start justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Pending Obligations</span>
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-[rgba(56,189,248,0.12)] text-[#38BDF8] border border-[rgba(56,189,248,0.25)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                  Upcoming
                </span>
              </div>
              <div className="mt-4">
                <h2 className="text-numeric-metric font-numeric-metric text-on-surface font-semibold tracking-tight">
                  ₹{metrics.pendingObligations.toLocaleString("en-IN")}
                </h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant/80 mt-1">Earmarked — not spent yet</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-label-sm font-label-sm text-secondary">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>{metrics.pendingCount} commitment(s) remaining</span>
              </div>
            </div>

            {/* Metric 3: Overdue Action Required */}
            <div className={`bg-[#151D2A] border ${metrics.overdueCount > 0 ? "border-red-500/40 luminous-red-glow" : "border-[#1E293B]"} rounded-xl p-5 relative overflow-hidden transition-all duration-200`}>
              <div className="flex items-start justify-between">
                <span className="text-label-md font-label-md text-error font-medium">Overdue</span>
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-[rgba(239,68,68,0.12)] text-[#EF4444] border border-[rgba(239,68,68,0.25)] flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full bg-[#EF4444] ${metrics.overdueCount > 0 ? "animate-pulse" : ""}`}></span>
                  {metrics.overdueCount > 0 ? "Action required" : "Zero overdue"}
                </span>
              </div>
              <div className="mt-4">
                <h2 className="text-numeric-metric font-numeric-metric text-[#EF4444] font-semibold tracking-tight">
                  {metrics.overdueCount > 0 ? `${metrics.overdueCount} payment (₹${metrics.overdueAmount.toLocaleString("en-IN")})` : "₹0"}
                </h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant/90 mt-1">
                  {metrics.overdueCount > 0 ? "Elapsed deadlines requiring clearance" : "All payments are up to date"}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-label-sm font-label-sm text-[#EF4444]">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>{metrics.overdueCount > 0 ? "Immediate clearance advised" : "Vault healthy"}</span>
              </div>
            </div>

            {/* Metric 4: Upcoming Reminders */}
            <div className="bg-[#151D2A] border border-[#1E293B] rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-amber-500/30">
              <div className="flex items-start justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Upcoming Reminders</span>
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border border-[rgba(245,158,11,0.25)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                  Due soon
                </span>
              </div>
              <div className="mt-4">
                <h2 className="text-numeric-metric font-numeric-metric text-on-surface font-semibold tracking-tight">
                  {metrics.upcomingRemindersCount} payment(s)
                </h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant/80 mt-1">Due within next 7 days</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-label-sm font-label-sm text-[#F59E0B]">
                <span className="material-symbols-outlined text-[14px]">event_upcoming</span>
                <span>
                  {metrics.earliestReminder
                    ? `Next: ${metrics.earliestReminder.title} (₹${metrics.earliestReminder.amount})`
                    : "No imminent due dates"}
                </span>
              </div>
            </div>
          </section>

          {/* PRIORITY ATTENTION SECTION */}
          {urgentBills.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">notification_important</span>
                  Priority Attention
                </h3>
                <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                  Household Schedule
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {urgentBills.map((bill) => {
                  const isOverdue = bill.status === "Overdue";
                  const borderColor = isOverdue ? "border-red-500/40" : "border-amber-500/40";
                  const badgeColor = isOverdue ? "text-[#EF4444]" : "text-[#F59E0B]";
                  const iconBg = isOverdue ? "bg-red-500/15 text-[#EF4444]" : "bg-amber-500/15 text-[#F59E0B]";

                  return (
                    <div
                      key={bill._id}
                      className={`p-4 rounded-xl bg-[#151D2A] border ${borderColor} relative overflow-hidden flex flex-col justify-between group`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-[20px]">{getCategoryIcon(bill.category)}</span>
                          </div>
                          <div>
                            <h4 className="text-label-lg font-label-lg font-semibold text-on-surface">{bill.title}</h4>
                            <p className={`text-body-sm font-body-sm ${badgeColor} font-medium`}>
                              ₹{bill.amount} • {formatDaysRemaining(bill.dueDate, bill.status)} ({bill.personName})
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1E293B]">
                        <button
                          onClick={() => handleMarkAsPaid(bill._id)}
                          className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-black py-1.5 px-3 rounded-lg text-label-md font-label-md font-semibold transition-colors"
                          type="button"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => setDetailsPayment(bill)}
                          className="px-3 py-1.5 rounded-lg border border-[#1E293B] hover:bg-surface-container text-on-surface text-label-md font-label-md transition-colors"
                          type="button"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SPENDING ANALYTICS SECTION (Two side-by-side cards) */}
          <section id="spend-breakdown" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Category Spending Donut Chart (7 cols) */}
            <div className="lg:col-span-7 bg-[#151D2A] border border-[#1E293B] rounded-xl p-5 md:p-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-4">
                <div>
                  <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Category Spending Distribution</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Categorical split of settled commitments</p>
                </div>
                <span className="self-start sm:self-auto text-label-sm font-label-sm px-2.5 py-1 rounded-md bg-surface-container-high text-primary border border-outline-variant/30">
                  {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-6">
                {/* SVG Donut Chart */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
                  <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" fill="none" r="48" stroke="#1E293B" strokeWidth="14"></circle>
                    {metrics.catTotalSum > 0 ? (
                      <>
                        {/* Electricity segment */}
                        <circle
                          className="donut-segment"
                          cx="60"
                          cy="60"
                          fill="none"
                          r="48"
                          stroke="#6366F1"
                          strokeDasharray={`${electLen} ${c - electLen}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          strokeWidth="14"
                        ></circle>
                        {/* Recharge segment */}
                        <circle
                          className="donut-segment"
                          cx="60"
                          cy="60"
                          fill="none"
                          r="48"
                          stroke="#38BDF8"
                          strokeDasharray={`${rechLen} ${c - rechLen}`}
                          strokeDashoffset={-electLen}
                          strokeLinecap="round"
                          strokeWidth="14"
                        ></circle>
                        {/* Subscription segment */}
                        <circle
                          className="donut-segment"
                          cx="60"
                          cy="60"
                          fill="none"
                          r="48"
                          stroke="#10B981"
                          strokeDasharray={`${subLen} ${c - subLen}`}
                          strokeDashoffset={-(electLen + rechLen)}
                          strokeLinecap="round"
                          strokeWidth="14"
                        ></circle>
                      </>
                    ) : (
                      <circle cx="60" cy="60" fill="none" r="48" stroke="#31353e" strokeWidth="14"></circle>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-label-sm font-label-sm text-on-surface-variant uppercase">Settled</span>
                    <span className="text-headline-sm font-headline-sm font-bold text-on-surface">
                      ₹{metrics.totalPaid.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="sm:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#6366F1]"></span>
                      <div>
                        <p className="text-label-md font-label-md font-semibold text-on-surface">Electricity</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">Power &amp; Utilities</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-label-md font-label-md font-bold text-on-surface">{metrics.catPercentages.Electricity}%</span>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">₹{metrics.categoryTotals.Electricity.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#38BDF8]"></span>
                      <div>
                        <p className="text-label-md font-label-md font-semibold text-on-surface">Recharge</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">Telecom &amp; Fiber</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-label-md font-label-md font-bold text-on-surface">{metrics.catPercentages.Recharge}%</span>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">₹{metrics.categoryTotals.Recharge.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                      <div>
                        <p className="text-label-md font-label-md font-semibold text-on-surface">Subscription</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">Streaming &amp; Cloud</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-label-md font-label-md font-bold text-on-surface">{metrics.catPercentages.Subscription}%</span>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">₹{metrics.categoryTotals.Subscription.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                <span>Calculated strictly from Paid payments. Excludes pending obligations.</span>
              </div>
            </div>

            {/* Person Spending Bar Chart (5 cols) */}
            <div className="lg:col-span-5 bg-[#151D2A] border border-[#1E293B] rounded-xl p-5 md:p-6 flex flex-col justify-between">
              <div className="border-b border-[#1E293B] pb-4">
                <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Spending by Family Member</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Verified disbursement per individual</p>
              </div>

              <div className="my-6 space-y-5">
                {metrics.personArray.length > 0 ? (
                  metrics.personArray.map((p, idx) => {
                    const colors = [
                      "from-[#6366F1] to-[#8083ff]",
                      "from-[#38BDF8] to-[#7bd0ff]",
                      "from-[#10B981] to-[#4edea3]",
                    ];
                    const barColor = colors[idx % colors.length];

                    return (
                      <div key={p.name}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="text-label-md font-label-md font-medium text-on-surface">{p.name}</span>
                          </div>
                          <span className="text-label-md font-label-md font-bold text-on-surface">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[#1E293B] overflow-hidden">
                          <div
                            className={`bar-grow h-full bg-gradient-to-r ${barColor} rounded-full`}
                            style={{ width: `${p.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-outline text-body-sm">
                    No settled payments yet to display family distribution.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <span>Verified status === 'Paid'</span>
                <span className="text-primary font-semibold">Total: ₹{metrics.totalPaid.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </section>

          {/* RECENT PAYMENTS TABLE SECTION */}
          <section className="bg-[#151D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Recent Obligations &amp; Payments</h3>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                  {filteredPayments.length} entries
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center bg-[#0B0F17] rounded-lg p-1 border border-[#1E293B]">
                  <button
                    onClick={() => setTableFilter("all")}
                    className={`px-3 py-1 text-label-sm font-label-sm font-semibold rounded-md transition-all ${
                      tableFilter === "all" ? "bg-surface-container-high text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTableFilter("pending")}
                    className={`px-3 py-1 text-label-sm font-label-sm font-semibold rounded-md transition-all ${
                      tableFilter === "pending" ? "bg-surface-container-high text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setTableFilter("paid")}
                    className={`px-3 py-1 text-label-sm font-label-sm font-semibold rounded-md transition-all ${
                      tableFilter === "paid" ? "bg-surface-container-high text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Paid
                  </button>
                </div>

                <Link
                  to="/payments"
                  className="px-3 py-1 text-label-sm font-label-sm text-primary hover:underline flex items-center gap-1"
                >
                  <span>View All Payments</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              /* EMPTY STATE VIEW */
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4 border border-[#1E293B]">
                  <span className="material-symbols-outlined text-[36px]">receipt_long</span>
                </div>
                <h4 className="text-headline-sm font-headline-sm font-bold text-on-surface">No payments found</h4>
                <p className="text-body-md font-body-md text-on-surface-variant max-w-sm mt-1 mb-6">
                  Add your first recurring payment to activate automated deadline tracking and household ledger forecasting.
                </p>
                <button
                  onClick={() => {
                    setEditingPayment(null);
                    setIsDrawerOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-label-lg font-label-lg shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>+ Add Payment</span>
                </button>
              </div>
            ) : (
              /* Table Responsive Canvas */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-label-sm font-label-sm uppercase text-on-surface-variant/80 tracking-wider bg-[#101722]/50">
                      <th className="py-3 px-4 font-semibold">Person</th>
                      <th className="py-3 px-4 font-semibold">Title</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Provider</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      <th className="py-3 px-4 font-semibold">Due Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(30,41,59,0.5)] text-body-md font-body-md">
                    {filteredPayments.slice(0, 5).map((payment) => {
                      const initial = (payment.personName || "F")[0].toUpperCase();
                      const isOverdue = payment.status === "Overdue";

                      return (
                        <tr
                          key={payment._id}
                          className={`hover:bg-slate-800/30 transition-colors group ${isOverdue ? "bg-red-950/10" : ""}`}
                        >
                          <td className="py-3.5 px-4 font-medium text-on-surface">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-label-sm font-label-sm flex items-center justify-center font-bold">
                                {initial}
                              </span>
                              <span>{payment.personName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-on-surface">{payment.title}</td>
                          <td className="py-3.5 px-4 text-on-surface-variant">
                            <span className="inline-flex items-center gap-1.5 text-body-sm font-body-sm">
                              <span className="material-symbols-outlined text-[16px] text-sky-400">
                                {getCategoryIcon(payment.category)}
                              </span>
                              {payment.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-on-surface-variant">{payment.provider}</td>
                          <td className={`py-3.5 px-4 text-right font-semibold font-mono ${isOverdue ? "text-error" : "text-on-surface"}`}>
                            ₹{Number(payment.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 text-body-sm font-body-sm text-on-surface-variant">
                            {formatDaysRemaining(payment.dueDate, payment.status)}
                          </td>
                          <td className="py-3.5 px-4">{getStatusBadge(payment.status)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {payment.status !== "Paid" ? (
                                <button
                                  onClick={() => handleMarkAsPaid(payment._id)}
                                  className="px-2.5 py-1 rounded bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/30 text-label-sm font-label-sm font-semibold transition-colors"
                                  title="Mark this payment as paid"
                                >
                                  Mark Paid
                                </button>
                              ) : (
                                <span className="px-2.5 py-1 text-label-sm font-label-sm text-tertiary font-medium flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                  Settled
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  setEditingPayment(payment);
                                  setIsDrawerOpen(true);
                                }}
                                className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => setDeletingPayment(payment)}
                                className="p-1 rounded text-on-surface-variant hover:text-error transition-colors"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-5 py-3 border-t border-[#1E293B] bg-[#101722]/60 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
              <span>Showing {Math.min(5, filteredPayments.length)} of {filteredPayments.length} active scheduled commitments</span>
              <Link to="/payments" className="text-primary hover:underline">
                Open Full Payments Manager →
              </Link>
            </div>
          </section>
        </main>
      </div>

      {/* Modals & Slide-Over Drawers */}
      <PaymentFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingPayment(null);
        }}
        onSave={handleSavePayment}
        editingPayment={editingPayment}
      />

      <PaymentDetailsModal
        isOpen={!!detailsPayment}
        onClose={() => setDetailsPayment(null)}
        onEdit={(p) => {
          setEditingPayment(p);
          setIsDrawerOpen(true);
        }}
        payment={detailsPayment}
      />

      <DeleteConfirmModal
        isOpen={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        onConfirm={handleDeleteConfirm}
        paymentTitle={deletingPayment?.title}
        deleting={isDeleting}
      />
    </div>
  );
};
