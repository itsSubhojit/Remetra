import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { paymentsApi } from "../services/api";
import { Sidebar } from "../components/Navigation/Sidebar";
import { PaymentFormDrawer } from "../components/Modals/PaymentFormDrawer";
import { PaymentDetailsModal } from "../components/Modals/PaymentDetailsModal";
import { DeleteConfirmModal } from "../components/Modals/DeleteConfirmModal";

export const PaymentsPage = () => {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters (Client-side only since backend does not support query filtering yet)
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due-soon"); // 'due-soon' | 'amount-high' | 'recent'

  // Modals & Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [detailsPayment, setDetailsPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const token = await getToken();
      const res = await paymentsApi.getAll(token);
      if (res && res.success && Array.isArray(res.data)) {
        setPayments(res.data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Error fetching payments list:", err);
      setError(err.message || "Failed to load payments from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // CRUD Actions
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
      alert("Error marking payment as paid: " + err.message);
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
      alert("Error deleting payment: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    let upcomingTotal = 0;
    let upcomingCount = 0;
    let overdueTotal = 0;
    let overdueCount = 0;
    let paidTotal = 0;
    let paidCount = 0;
    let cycleTotal = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      cycleTotal += amt;

      if (p.status === "Paid") {
        paidTotal += amt;
        paidCount += 1;
      } else if (p.status === "Overdue") {
        overdueTotal += amt;
        overdueCount += 1;
      } else {
        upcomingTotal += amt;
        upcomingCount += 1;
      }
    });

    return {
      upcomingTotal,
      upcomingCount,
      overdueTotal,
      overdueCount,
      paidTotal,
      paidCount,
      cycleTotal,
    };
  }, [payments]);

  // Unique person list for filter dropdown derived strictly from real payment records
  const uniquePersons = useMemo(() => {
    const persons = new Set();
    payments.forEach((p) => {
      if (p.personName) persons.add(p.personName);
    });
    return Array.from(persons);
  }, [payments]);

  // Client-Side Filtered & Sorted Payments
  // Note: Backend currently returns all user payments in GET /api/payments without pagination or query params.
  // Search, category, person, status, and sorting are evaluated client-side in React.
  const filteredAndSortedPayments = useMemo(() => {
    return payments
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = p.title?.toLowerCase().includes(query);
          const matchesProvider = p.provider?.toLowerCase().includes(query);
          const matchesPerson = p.personName?.toLowerCase().includes(query);
          const matchesNotes = p.notes?.toLowerCase().includes(query);
          if (!matchesTitle && !matchesProvider && !matchesPerson && !matchesNotes) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== "all") {
          if (p.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
            return false;
          }
        }

        // Person filter
        if (personFilter !== "all") {
          if (p.personName !== personFilter) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== "all") {
          if (p.status?.toLowerCase() !== statusFilter.toLowerCase()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "due-soon") {
          return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        }
        if (sortBy === "amount-high") {
          return Number(b.amount || 0) - Number(a.amount || 0);
        }
        if (sortBy === "recent") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return 0;
      });
  }, [payments, searchQuery, categoryFilter, personFilter, statusFilter, sortBy]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Recharge":
        return "phone_iphone";
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
    if (status === "Paid") return "Paid";
    if (!dueDateStr) return "N/A";
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue ${Math.abs(diffDays)}d`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due in 1 day";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen flex w-full max-w-full overflow-x-hidden selection:bg-primary-container selection:text-white">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar
        onOpenNewPayment={() => {
          setEditingPayment(null);
          setIsDrawerOpen(true);
        }}
      />

      {/* Main Content Canvas */}
      <main className="flex-1 min-w-0 w-full md:ml-64 pb-28 md:pb-12 min-h-screen bg-surface-container-lowest overflow-x-hidden">
        {/* TOP BAR NAV */}
        <header className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-full px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-20 bg-surface/95 border-b border-outline-variant shadow-sm backdrop-blur-md">
          {/* Search Input on Left */}
          <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                search
              </span>
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs sm:text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Search bills, providers..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={fetchPayments}
              className="p-2 sm:p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Refresh Payments"
              type="button"
            >
              <span className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}>refresh</span>
            </button>

            <button
              onClick={() => {
                setEditingPayment(null);
                setIsDrawerOpen(true);
              }}
              className="bg-primary-container text-on-primary hover:opacity-95 font-label-md text-label-md px-2.5 sm:px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-sm shrink-0"
              type="button"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span className="hidden sm:inline">Add Payment</span>
            </button>
          </div>
        </header>

        {/* PAGE MAIN BODY */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3.5 sm:py-6 max-w-7xl mx-auto space-y-3.5 sm:space-y-6 w-full min-w-0">
          {/* Executive Header Area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 min-w-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-headline-sm sm:text-headline-lg font-bold text-on-surface tracking-tight">Payments</h2>
                <span className="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-medium shrink-0">
                  {payments.length} Active
                </span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5 hidden sm:block">
                Manage all your recurring payments, subscriptions, and household utilities.
              </p>
            </div>
          </div>

          {/* METRIC SUMMARY TILES (Bento Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
            {/* Total Pending Card */}
            <div className="glass-card p-3.5 sm:p-4 lg:p-5 glass-card-interactive transition-all min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-outline text-[11px] sm:text-label-sm font-label-sm mb-1.5 gap-1">
                <span className="truncate">UPCOMING COMMITMENTS</span>
                <span className="material-symbols-outlined text-secondary text-base sm:text-lg shrink-0">schedule</span>
              </div>
              <div className="text-xl sm:text-2xl xl:text-numeric-metric font-numeric-metric text-on-surface font-semibold truncate">
                ₹{metrics.upcomingTotal.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                <span className="status-upcoming px-2 py-0.5 rounded-full text-[11px] sm:text-label-sm font-label-sm shrink-0">
                  {metrics.upcomingCount} Pending
                </span>
                <span className="text-[11px] sm:text-body-sm font-body-sm text-outline truncate">awaiting due date</span>
              </div>
            </div>

            {/* Overdue Warning Card */}
            <div
              className={`glass-card p-3.5 sm:p-4 lg:p-5 relative overflow-hidden glass-card-interactive transition-all min-w-0 ${
                metrics.overdueCount > 0 ? "border-error-container/40" : ""
              }`}
              style={metrics.overdueCount > 0 ? { boxShadow: "0 0 24px -6px rgba(239, 68, 68, 0.15)" } : {}}
            >
              <div className="flex items-center justify-between text-error text-[11px] sm:text-label-sm font-label-sm mb-1.5 gap-1">
                <span className="truncate">OVERDUE ATTENTION</span>
                <span className="material-symbols-outlined text-error text-base sm:text-lg shrink-0">warning</span>
              </div>
              <div className="text-xl sm:text-2xl xl:text-numeric-metric font-numeric-metric text-on-surface font-semibold truncate">
                ₹{metrics.overdueTotal.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                <span className="status-overdue px-2 py-0.5 rounded-full text-[11px] sm:text-label-sm font-label-sm shrink-0">
                  {metrics.overdueCount} Overdue
                </span>
                <span className="text-[11px] sm:text-body-sm font-body-sm text-outline truncate">Action required</span>
              </div>
            </div>

            {/* Monthly Paid Out Card */}
            <div className="glass-card p-3.5 sm:p-4 lg:p-5 glass-card-interactive transition-all min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-outline text-[11px] sm:text-label-sm font-label-sm mb-1.5 gap-1">
                <span className="truncate">CLEARED ACTUAL SPEND</span>
                <span className="material-symbols-outlined text-tertiary text-base sm:text-lg shrink-0">check_circle</span>
              </div>
              <div className="text-xl sm:text-2xl xl:text-numeric-metric font-numeric-metric text-on-surface font-semibold truncate">
                ₹{metrics.paidTotal.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                <span className="status-paid px-2 py-0.5 rounded-full text-[11px] sm:text-label-sm font-label-sm shrink-0">
                  {metrics.paidCount} Processed
                </span>
                <span className="text-[11px] sm:text-body-sm font-body-sm text-tertiary font-medium truncate">marked paid</span>
              </div>
            </div>

            {/* Cycle Run-Rate Card */}
            <div className="glass-card p-3.5 sm:p-4 lg:p-5 glass-card-interactive transition-all min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-outline text-[11px] sm:text-label-sm font-label-sm mb-1.5 gap-1">
                <span className="truncate">TOTAL COMMITMENTS</span>
                <span className="material-symbols-outlined text-primary text-base sm:text-lg shrink-0">bolt</span>
              </div>
              <div className="text-xl sm:text-2xl xl:text-numeric-metric font-numeric-metric text-on-surface font-semibold truncate">
                ₹{metrics.cycleTotal.toLocaleString("en-IN")}
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 sm:mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                  style={{
                    width: `${metrics.cycleTotal > 0 ? Math.min(100, Math.round((metrics.paidTotal / metrics.cycleTotal) * 100)) : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-[11px] sm:text-label-sm font-label-sm text-outline mt-1.5 truncate">
                {metrics.cycleTotal > 0 ? Math.round((metrics.paidTotal / metrics.cycleTotal) * 100) : 0}% settled of total commitments
              </p>
            </div>
          </div>

          {/* FILTER BAR SECTION */}
          <div className="glass-card p-3 sm:p-4 space-y-3 w-full min-w-0 max-w-full overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-4 min-w-0">
              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 whitespace-nowrap no-scrollbar max-w-full">
                <span className="text-[11px] sm:text-label-sm font-label-sm text-outline uppercase tracking-wider mr-1 shrink-0">Category:</span>
                {["all", "recharge", "electricity", "subscription"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`category-btn px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-label-sm font-label-sm font-medium transition-all capitalize shadow-sm shrink-0 ${
                      categoryFilter === cat
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Person & Sorting Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto min-w-0">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <span className="material-symbols-outlined text-outline text-base shrink-0">person</span>
                  <select
                    className="w-full min-w-0 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs sm:text-body-sm font-body-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary truncate"
                    value={personFilter}
                    onChange={(e) => setPersonFilter(e.target.value)}
                  >
                    <option value="all">All Persons</option>
                    {uniquePersons.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 min-w-0 w-full">
                  <span className="material-symbols-outlined text-outline text-base shrink-0">swap_vert</span>
                  <select
                    className="w-full min-w-0 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs sm:text-body-sm font-body-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary truncate"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="due-soon">Due Date (Soonest)</option>
                    <option value="amount-high">Amount (High-Low)</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status Chips Sub-Row */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-outline-variant/30 overflow-x-auto whitespace-nowrap no-scrollbar max-w-full">
              <span className="text-[11px] sm:text-label-sm font-label-sm text-outline uppercase tracking-wider mr-1 shrink-0">Status:</span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`status-btn px-2.5 py-1 rounded-full text-xs sm:text-label-sm font-label-sm transition-all shrink-0 ${
                  statusFilter === "all" ? "bg-surface-bright text-on-surface font-semibold" : "bg-surface-container text-outline"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={`status-btn status-upcoming px-2.5 py-1 rounded-full text-xs sm:text-label-sm font-label-sm hover:opacity-80 transition-all shrink-0 ${
                  statusFilter === "upcoming" ? "ring-2 ring-sky-400 font-bold" : ""
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter("due")}
                className={`status-btn status-due px-2.5 py-1 rounded-full text-xs sm:text-label-sm font-label-sm hover:opacity-80 transition-all shrink-0 ${
                  statusFilter === "due" ? "ring-2 ring-amber-400 font-bold" : ""
                }`}
              >
                Due
              </button>
              <button
                onClick={() => setStatusFilter("overdue")}
                className={`status-btn status-overdue px-2.5 py-1 rounded-full text-xs sm:text-label-sm font-label-sm hover:opacity-80 transition-all shrink-0 ${
                  statusFilter === "overdue" ? "ring-2 ring-red-400 font-bold" : ""
                }`}
              >
                Overdue
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={`status-btn status-paid px-2.5 py-1 rounded-full text-xs sm:text-label-sm font-label-sm hover:opacity-80 transition-all shrink-0 ${
                  statusFilter === "paid" ? "ring-2 ring-emerald-400 font-bold" : ""
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* PAYMENT DATA PRESENTATION */}
          {filteredAndSortedPayments.length === 0 ? (
            /* Empty State */
            <div className="glass-card p-6 sm:p-12 text-center flex flex-col items-center justify-center min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4 border border-[#1E293B]">
                <span className="material-symbols-outlined text-[32px] sm:text-[36px]">receipt_long</span>
              </div>
              <h4 className="text-headline-sm font-headline-sm font-bold text-on-surface">No payments found</h4>
              <p className="text-body-md font-body-md text-on-surface-variant max-w-sm mt-1 mb-6">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No bills match your active filters. Try resetting search or category chips."
                  : "Add your first recurring payment to activate automated deadline tracking and household ledger forecasting."}
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
                <span>Add Payment</span>
              </button>
            </div>
          ) : (
            <>
              {/* 1. DESKTOP VIEW TABLE (Visible ≥ 1024px) */}
              <div className="hidden lg:block glass-card overflow-hidden w-full min-w-0">
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left border-collapse" id="paymentsTable">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-low text-outline text-label-sm font-label-sm uppercase tracking-wider h-11">
                        <th className="py-3 px-4">Person</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Provider</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-body-md font-body-md">
                      {filteredAndSortedPayments.map((payment) => {
                        const isOverdue = payment.status === "Overdue";
                        const initial = (payment.personName || "F")[0].toUpperCase();
                        const formattedDueDate = payment.dueDate
                          ? new Date(payment.dueDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A";

                        return (
                          <tr key={payment._id} className="hover:bg-surface-container/60 transition-colors group">
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-primary border border-primary/20">
                                <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px]">
                                  {initial}
                                </span>
                                {payment.personName}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-on-surface">{payment.title}</div>
                              {payment.notes && <div className="text-body-sm font-body-sm text-outline truncate max-w-xs">{payment.notes}</div>}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-on-surface-variant">
                                <span className="material-symbols-outlined text-base text-secondary">
                                  {getCategoryIcon(payment.category)}
                                </span>
                                <span>{payment.category}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-on-surface">{payment.provider}</td>
                            <td className={`py-3.5 px-4 whitespace-nowrap text-right font-numeric-metric font-semibold ${isOverdue ? "text-error" : "text-on-surface"}`}>
                              ₹{Number(payment.amount).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`font-medium text-body-sm flex items-center gap-1 ${isOverdue ? "text-error" : "text-on-surface"}`}>
                                {isOverdue && <span className="material-symbols-outlined text-sm">priority_high</span>}
                                {formatDaysRemaining(payment.dueDate, payment.status)}
                              </span>
                              <span className="text-label-sm text-outline block">{formattedDueDate}</span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-center">
                              {getStatusBadge(payment.status)}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                {payment.status !== "Paid" ? (
                                  <button
                                    onClick={() => handleMarkAsPaid(payment._id)}
                                    className="p-1.5 hover:bg-tertiary-container/30 text-tertiary rounded-lg transition-colors"
                                    title="Mark as Paid"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                  </button>
                                ) : (
                                  <span className="p-1.5 text-tertiary" title="Paid">
                                    <span className="material-symbols-outlined text-lg">done_all</span>
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    setEditingPayment(payment);
                                    setIsDrawerOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
                                  title="Edit Payment"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button
                                  onClick={() => setDetailsPayment(payment)}
                                  className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
                                  title="View Details"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-lg">visibility</span>
                                </button>
                                <button
                                  onClick={() => setDeletingPayment(payment)}
                                  className="p-1.5 hover:bg-error-container/30 text-error rounded-lg transition-colors"
                                  title="Delete Payment"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. MOBILE & TABLET STACKING CARDS VIEW (< 1024px) */}
              <div className="lg:hidden space-y-3 w-full min-w-0" id="mobileCardsContainer">
                {filteredAndSortedPayments.map((payment) => {
                  const isOverdue = payment.status === "Overdue";
                  const formattedDueDate = payment.dueDate
                    ? new Date(payment.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "N/A";

                  return (
                    <div key={payment._id} className="glass-card p-3.5 space-y-3 border border-outline-variant/30 min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between gap-2.5 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-container-high text-primary border border-primary/20 shrink-0">
                              {payment.personName || "Self"}
                            </span>
                            <span className="text-xs text-outline font-medium truncate">
                              {payment.category}
                            </span>
                          </div>
                          <h4 className="font-semibold text-on-surface text-body-md truncate">{payment.title}</h4>
                          <p className="text-xs text-outline truncate">
                            {payment.provider}
                          </p>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 gap-2 min-w-0">
                        <div className="min-w-0">
                          <span className="text-[10px] text-outline uppercase tracking-wider block truncate">AMOUNT</span>
                          <span className={`text-base sm:text-lg font-numeric-metric font-bold truncate block ${isOverdue ? "text-error" : "text-on-surface"}`}>
                            ₹{Number(payment.amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="text-right min-w-0">
                          <span className="text-[10px] text-outline uppercase tracking-wider block truncate">DUE DATE</span>
                          <span className={`text-xs font-medium block truncate ${isOverdue ? "text-error font-semibold" : "text-on-surface"}`}>
                            {formatDaysRemaining(payment.dueDate, payment.status)}
                          </span>
                          <span className="text-[10px] text-outline block truncate">{formattedDueDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 gap-2 min-w-0">
                        {payment.status !== "Paid" ? (
                          <button
                            onClick={() => handleMarkAsPaid(payment._id)}
                            className="px-2.5 sm:px-3 py-1.5 text-xs bg-tertiary/15 hover:bg-tertiary/25 text-tertiary rounded-lg border border-tertiary/30 font-semibold transition-colors flex items-center gap-1 active:scale-95 shrink-0"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Mark Paid</span>
                          </button>
                        ) : (
                          <span className="text-xs text-tertiary font-medium flex items-center gap-1 px-1 shrink-0">
                            <span className="material-symbols-outlined text-[16px]">done_all</span>
                            <span>Cleared</span>
                          </span>
                        )}

                        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto shrink-0">
                          <button
                            onClick={() => {
                              setEditingPayment(payment);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 sm:p-2 text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors active:scale-95"
                            type="button"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => setDetailsPayment(payment)}
                            className="p-1.5 sm:p-2 text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors active:scale-95"
                            type="button"
                            title="Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => setDeletingPayment(payment)}
                            className="p-1.5 sm:p-2 text-error bg-error-container/20 hover:bg-error-container/30 rounded-lg transition-colors active:scale-95"
                            type="button"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </main>

      {/* Slide-over PaymentFormDrawer */}
      <PaymentFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingPayment(null);
        }}
        onSave={handleSavePayment}
        editingPayment={editingPayment}
      />

      {/* PaymentDetailsModal */}
      <PaymentDetailsModal
        isOpen={!!detailsPayment}
        onClose={() => setDetailsPayment(null)}
        onEdit={(p) => {
          setEditingPayment(p);
          setIsDrawerOpen(true);
        }}
        payment={detailsPayment}
      />

      {/* DeleteConfirmModal */}
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
