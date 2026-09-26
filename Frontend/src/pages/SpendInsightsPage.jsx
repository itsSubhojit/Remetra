import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { paymentsApi } from "../services/api";
import { Sidebar } from "../components/Navigation/Sidebar";
import { PaymentFormDrawer } from "../components/Modals/PaymentFormDrawer";
import { PaymentDetailsModal } from "../components/Modals/PaymentDetailsModal";

export const SpendInsightsPage = () => {
  const { user, getToken } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [detailsPayment, setDetailsPayment] = useState(null);

  // Time filter: 'all' | 'month'
  const [timeFilter, setTimeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Vault Member";

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
      setError(err.message || "Failed to load spending insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSavePayment = async (payload, id) => {
    const token = await getToken();
    if (id) {
      await paymentsApi.update(id, payload, token);
    } else {
      await paymentsApi.create(payload, token);
    }
    await fetchPayments();
  };

  // Filter payments by time period if desired
  const filteredByTime = useMemo(() => {
    if (timeFilter === "month") {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return payments.filter((p) => {
        const d = p.paidDate ? new Date(p.paidDate) : (p.dueDate ? new Date(p.dueDate) : null);
        if (!d) return true;
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }
    return payments;
  }, [payments, timeFilter]);

  // Derived Analytics from verified payments
  const metrics = useMemo(() => {
    let totalPaid = 0;
    let totalPending = 0;
    let totalAll = 0;
    let paidCount = 0;

    const catTotals = { Electricity: 0, Recharge: 0, Subscription: 0 };
    const catCounts = { Electricity: 0, Recharge: 0, Subscription: 0 };
    const personMap = {};

    filteredByTime.forEach((p) => {
      const amt = Number(p.amount) || 0;
      totalAll += amt;

      if (p.status === "Paid") {
        totalPaid += amt;
        paidCount++;

        // Categorical split of settled spend
        if (p.category && catTotals[p.category] !== undefined) {
          catTotals[p.category] += amt;
          catCounts[p.category] += 1;
        }

        // Person split of settled spend
        const person = p.personName || "Household / Shared";
        if (!personMap[person]) {
          personMap[person] = { total: 0, count: 0 };
        }
        personMap[person].total += amt;
        personMap[person].count += 1;
      } else {
        totalPending += amt;
      }
    });

    const catTotalSum = catTotals.Electricity + catTotals.Recharge + catTotals.Subscription;
    const catPercentages = {
      Electricity: catTotalSum > 0 ? Math.round((catTotals.Electricity / catTotalSum) * 100) : 0,
      Recharge: catTotalSum > 0 ? Math.round((catTotals.Recharge / catTotalSum) * 100) : 0,
      Subscription: catTotalSum > 0 ? Math.round((catTotals.Subscription / catTotalSum) * 100) : 0,
    };

    // Sort persons by spend descending
    const personArray = Object.keys(personMap)
      .map((name) => ({
        name,
        amount: personMap[name].total,
        count: personMap[name].count,
        percentage: totalPaid > 0 ? Math.round((personMap[name].total / totalPaid) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top category identification
    let topCategory = "None";
    let topCategoryAmount = 0;
    Object.entries(catTotals).forEach(([cat, val]) => {
      if (val > topCategoryAmount) {
        topCategoryAmount = val;
        topCategory = cat;
      }
    });

    // Top individual spender
    const topPerson = personArray.length > 0 ? personArray[0] : null;

    // Average transaction size for settled payments
    const avgSettled = paidCount > 0 ? Math.round(totalPaid / paidCount) : 0;

    return {
      totalPaid,
      totalPending,
      totalAll,
      paidCount,
      catTotals,
      catCounts,
      catTotalSum,
      catPercentages,
      personArray,
      topCategory,
      topCategoryAmount,
      topPerson,
      avgSettled,
    };
  }, [filteredByTime]);

  // Settled Payments List for Ledger Table
  const settledPayments = useMemo(() => {
    return filteredByTime
      .filter((p) => p.status === "Paid")
      .filter((p) => {
        if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchProvider = p.provider?.toLowerCase().includes(q);
          const matchPerson = p.personName?.toLowerCase().includes(q);
          return matchTitle || matchProvider || matchPerson;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = a.paidDate ? new Date(a.paidDate) : new Date(a.dueDate || 0);
        const dateB = b.paidDate ? new Date(b.paidDate) : new Date(b.dueDate || 0);
        return dateB - dateA;
      });
  }, [filteredByTime, categoryFilter, searchQuery]);

  // Donut chart calculations
  const circumference = 2 * Math.PI * 48; // ≈ 301.59
  const electLen = (circumference * metrics.catPercentages.Electricity) / 100;
  const rechLen = (circumference * metrics.catPercentages.Recharge) / 100;
  const subLen = (circumference * metrics.catPercentages.Subscription) / 100;

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row text-on-surface antialiased font-body-md">
      {/* Persistent Left Sidebar */}
      <Sidebar onOpenNewPayment={() => { setEditingPayment(null); setIsDrawerOpen(true); }} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen pb-28 md:pb-12">
        {/* Sticky Top Header */}
        <header className="h-16 px-4 md:px-8 border-b border-[#1E293B] flex items-center justify-between sticky top-0 bg-[#0B0F17]/95 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <div>
              <h1 className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight">
                Spend Insights
              </h1>
              <p className="text-body-sm font-body-sm text-on-surface-variant hidden sm:block">
                Deep analytical breakdowns &amp; verified settlement intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Filter Toggle */}
            <div className="bg-[#151D2A] border border-[#1E293B] p-0.5 rounded-lg flex items-center text-label-sm font-label-sm">
              <button
                type="button"
                onClick={() => setTimeFilter("all")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeFilter === "all"
                    ? "bg-primary text-on-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("month")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeFilter === "month"
                    ? "bg-primary text-on-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                This Month
              </button>
            </div>

            <button
              onClick={fetchPayments}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Refresh Insights"
              type="button"
            >
              <span className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}>refresh</span>
            </button>
          </div>
        </header>

        {/* Content Workspace */}
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

          {/* KEY ANALYTICS KPI SUMMARY TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Tile 1: Total Cleared Spend */}
            <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:border-indigo-500/30">
              <div className="flex items-start justify-between">
                <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold">Cleared Spend</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[rgba(16,185,129,0.25)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  Paid
                </span>
              </div>
              <div className="mt-3">
                <h2 className="text-numeric-metric font-numeric-metric text-on-surface font-semibold tracking-tight">
                  ₹{metrics.totalPaid.toLocaleString("en-IN")}
                </h2>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">
                  Across {metrics.paidCount} verified settled bill(s)
                </p>
              </div>
            </div>

            {/* Tile 2: Pending Obligations */}
            <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:border-sky-500/30">
              <div className="flex items-start justify-between">
                <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold">Pending Commitments</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-[rgba(56,189,248,0.12)] text-[#38BDF8] border border-[rgba(56,189,248,0.25)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                  Upcoming
                </span>
              </div>
              <div className="mt-3">
                <h2 className="text-numeric-metric font-numeric-metric text-on-surface font-semibold tracking-tight">
                  ₹{metrics.totalPending.toLocaleString("en-IN")}
                </h2>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">
                  Earmarked for future settlement
                </p>
              </div>
            </div>

            {/* Tile 3: Top Category */}
            <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:border-indigo-500/30">
              <div className="flex items-start justify-between">
                <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold">Top Expense Category</span>
                <span className="material-symbols-outlined text-primary text-xl">category</span>
              </div>
              <div className="mt-3">
                <h2 className="text-headline-md font-headline-md text-on-surface font-bold truncate">
                  {metrics.topCategory !== "None" ? metrics.topCategory : "No Spend Yet"}
                </h2>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">
                  {metrics.topCategoryAmount > 0
                    ? `₹${metrics.topCategoryAmount.toLocaleString("en-IN")} (${metrics.catPercentages[metrics.topCategory] || 0}% of settled)`
                    : "Zero cleared bills"}
                </p>
              </div>
            </div>

            {/* Tile 4: Average Bill Size */}
            <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:border-indigo-500/30">
              <div className="flex items-start justify-between">
                <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold">Avg. Settled Bill</span>
                <span className="material-symbols-outlined text-tertiary text-xl">query_stats</span>
              </div>
              <div className="mt-3">
                <h2 className="text-numeric-metric font-numeric-metric text-on-surface font-semibold tracking-tight">
                  ₹{metrics.avgSettled.toLocaleString("en-IN")}
                </h2>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">
                  Average amount disbursed per bill
                </p>
              </div>
            </div>
          </div>

          {/* MAIN CHARTS SECTION: Side-by-side Distribution & Family breakdown */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Donut Chart: Categorical Split (7 cols) */}
            <div className="lg:col-span-7 bg-[#151D2A] border border-[#1E293B] rounded-xl p-5 md:p-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-4">
                <div>
                  <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Category Spending Distribution</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Categorical split of settled commitments</p>
                </div>
                <span className="self-start sm:self-auto text-label-sm font-label-sm px-2.5 py-1 rounded-md bg-surface-container-high text-primary border border-outline-variant/30">
                  {timeFilter === "month"
                    ? new Date().toLocaleString("default", { month: "long", year: "numeric" })
                    : "All Time"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-6">
                {/* SVG Donut */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
                  <svg className="w-40 h-40 sm:w-48 sm:h-48 transform -rotate-90" viewBox="0 0 120 120">
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
                          strokeDasharray={`${electLen} ${circumference - electLen}`}
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
                          strokeDasharray={`${rechLen} ${circumference - rechLen}`}
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
                          strokeDasharray={`${subLen} ${circumference - subLen}`}
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

                {/* Legend & Breakdown */}
                <div className="sm:col-span-7 space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors bg-[#0B0F17]/40 border border-[#1E293B]/50">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                      <div>
                        <p className="text-label-md font-label-md font-semibold text-on-surface">Electricity</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">Power &amp; Utilities ({metrics.catCounts.Electricity} bills)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-label-md font-label-md font-bold text-on-surface">{metrics.catPercentages.Electricity}%</span>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">₹{metrics.catTotals.Electricity.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors bg-[#0B0F17]/40 border border-[#1E293B]/50">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span>
                      <div>
                        <p className="text-label-md font-label-md font-semibold text-on-surface">Recharge</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">Telecom &amp; Fiber ({metrics.catCounts.Recharge} bills)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-label-md font-label-md font-bold text-on-surface">{metrics.catPercentages.Recharge}%</span>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">₹{metrics.catTotals.Recharge.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors bg-[#0B0F17]/40 border border-[#1E293B]/50">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      <div>
                        <p className="text-label-md font-label-md font-semibold text-on-surface">Subscription</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">Streaming &amp; Cloud ({metrics.catCounts.Subscription} bills)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-label-md font-label-md font-bold text-on-surface">{metrics.catPercentages.Subscription}%</span>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">₹{metrics.catTotals.Subscription.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                <span>Calculated strictly from Paid payments. Excludes unfulfilled obligations.</span>
              </div>
            </div>

            {/* Person Spending Bar Chart (5 cols) */}
            <div className="lg:col-span-5 bg-[#151D2A] border border-[#1E293B] rounded-xl p-5 md:p-6 flex flex-col justify-between">
              <div className="border-b border-[#1E293B] pb-4">
                <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Spending by Family Member</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Verified disbursement per individual</p>
              </div>

              <div className="my-6 space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
                {metrics.personArray.length > 0 ? (
                  metrics.personArray.map((p, idx) => {
                    const colors = [
                      "from-[#6366F1] to-[#8083ff]",
                      "from-[#38BDF8] to-[#7bd0ff]",
                      "from-[#10B981] to-[#4edea3]",
                      "from-[#F59E0B] to-[#FBBF24]",
                    ];
                    const barColor = colors[idx % colors.length];

                    return (
                      <div key={p.name} className="p-3 rounded-xl bg-[#0B0F17]/40 border border-[#1E293B]/50">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                            <span className="text-label-md font-label-md font-medium text-on-surface">{p.name}</span>
                            <span className="text-[11px] text-on-surface-variant">({p.count} bills)</span>
                          </div>
                          <span className="text-label-md font-label-md font-bold text-on-surface">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#1E293B] overflow-hidden">
                          <div
                            className={`bar-grow h-full bg-gradient-to-r ${barColor} rounded-full`}
                            style={{ width: `${p.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[11px] text-on-surface-variant">
                          <span>Contribution Share</span>
                          <span className="font-semibold text-on-surface">{p.percentage}%</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-outline text-body-sm">
                    No settled payments yet to display family distribution.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <span>Total: ₹{metrics.totalPaid.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </section>

          {/* SETTLED TRANSACTIONS AUDIT LEDGER */}
          <section className="bg-[#151D2A] border border-[#1E293B] rounded-xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
              <div>
                <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
                  Verified Settlement Ledger
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                  Detailed record of all verified disbursements and cleared expenses.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ledger..."
                  className="px-3 py-1.5 bg-[#0B0F17] border border-[#1E293B] rounded-lg text-body-sm text-on-surface placeholder-outline focus:outline-none focus:border-primary"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#0B0F17] border border-[#1E293B] rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Recharge">Recharge</option>
                  <option value="Subscription">Subscription</option>
                </select>
              </div>
            </div>

            {settledPayments.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt_long</span>
                <p className="text-body-md font-body-md text-on-surface font-semibold">No settled payments found</p>
                <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">
                  Once you mark bills as "Paid" in the Payments manager, they will appear here as verified disbursements.
                </p>
                <Link
                  to="/payments"
                  className="mt-4 px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-90 transition-all inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">receipt_long</span>
                  <span>Go to Payments</span>
                </Link>
              </div>
            ) : (
              <>
                {/* 1. Desktop Table (Visible ≥ 768px) */}
                <div className="hidden md:block overflow-x-auto custom-scroll">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-label-sm font-label-sm uppercase text-on-surface-variant/80 tracking-wider bg-[#101722]/50">
                        <th className="py-3 px-4 font-semibold">Person</th>
                        <th className="py-3 px-4 font-semibold">Title</th>
                        <th className="py-3 px-4 font-semibold">Category</th>
                        <th className="py-3 px-4 font-semibold">Provider</th>
                        <th className="py-3 px-4 font-semibold text-right">Amount</th>
                        <th className="py-3 px-4 font-semibold">Cleared Date</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {settledPayments.map((p) => {
                        const paidDateStr = p.paidDate
                          ? new Date(p.paidDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Verified";

                        const categoryColors = {
                          Electricity: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                          Recharge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                          Subscription: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        };

                        return (
                          <tr key={p._id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-3 px-4 text-label-md font-label-md font-semibold text-on-surface">
                              {p.personName || "Household"}
                            </td>
                            <td className="py-3 px-4 text-body-md font-body-md text-on-surface">
                              {p.title}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                  categoryColors[p.category] || "bg-surface-container-high text-on-surface border-outline-variant"
                                }`}
                              >
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-body-sm font-body-sm text-on-surface-variant">
                              {p.provider}
                            </td>
                            <td className="py-3 px-4 text-right text-label-md font-label-md font-bold text-on-surface">
                              ₹{(Number(p.amount) || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-body-sm font-body-sm text-[#10B981] font-medium">
                              {paidDateStr}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setDetailsPayment(p)}
                                className="px-2.5 py-1 text-label-sm font-label-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2. Mobile Cards (Visible < 768px) */}
                <div className="md:hidden space-y-3">
                  {settledPayments.map((p) => {
                    const paidDateStr = p.paidDate
                      ? new Date(p.paidDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "Verified";

                    return (
                      <div key={p._id} className="p-4 rounded-xl bg-[#0B0F17]/60 border border-[#1E293B] space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-label-sm text-primary font-semibold block">{p.personName || "Household"}</span>
                            <h4 className="font-headline-sm font-semibold text-on-surface">{p.title}</h4>
                            <p className="text-body-sm text-on-surface-variant">{p.provider} • {p.category}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                            Cleared
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]/60">
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-outline block">Settled Amount</span>
                            <span className="text-headline-sm font-mono font-bold text-on-surface">
                              ₹{(Number(p.amount) || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] uppercase tracking-wider text-outline block">Date</span>
                            <span className="text-body-sm text-[#10B981] font-medium">{paidDateStr}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#1E293B]/40 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setDetailsPayment(p)}
                            className="px-3 py-1 text-label-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                          >
                            View Full Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* Payment Form Drawer */}
      <PaymentFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSavePayment}
        initialData={editingPayment}
      />

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={Boolean(detailsPayment)}
        onClose={() => setDetailsPayment(null)}
        payment={detailsPayment}
        onEdit={(p) => {
          setDetailsPayment(null);
          setEditingPayment(p);
          setIsDrawerOpen(true);
        }}
      />
    </div>
  );
};
