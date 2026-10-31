import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';
import { AppPage } from '../components/common/Sidebar';

interface AdminDashboardPageProps {
  onNavigate: (page: AppPage) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, invoices, subscriptions, metrics } = useBilling();
  const [dateRange, setDateRange] = useState('Apr - Oct 2026');

  // Compute upcoming renewals dynamically from active subscriptions
  const upcomingRenewals = useMemo(() => {
    const today = new Date();
    return subscriptions
      .filter((s) => s.status === 'Active' && s.renewalDate)
      .map((s) => {
        const renDate = new Date(s.renewalDate);
        const diffTime = renDate.getTime() - today.getTime();
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        return {
          id: s.id,
          customer: s.customerName,
          plan: s.planName,
          date: s.renewalDate,
          amount: s.totalAmount,
          daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  }, [subscriptions]);

  const recentInvoices = invoices.slice(0, 5);

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'Overdue').length;
  const overdueCustomersCount = new Set(
    invoices.filter((i) => i.status === 'Overdue').map((i) => i.customerId)
  ).size;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* 1. Compact Page Header with date-range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Billing overview for {dateRange}. All financial figures in INR (₹).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-hidden text-xs font-medium text-slate-800"
            >
              <option value="Apr - Oct 2026">Apr – Oct 2026</option>
              <option value="Current Quarter">Current Quarter (Q4)</option>
              <option value="Year to Date">Year to Date (2026)</option>
            </select>
          </div>

          <button
            onClick={() => onNavigate('invoices')}
            className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] transition-colors shadow-2xs"
          >
            Run billing
          </button>
        </div>
      </div>

      {/* 2. Unified Financial Overview Strip (Single clean surface with vertical separators) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Active Subscriptions */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Active Subscriptions
            </span>
            <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums tracking-tight">
              {metrics.activeSubscriptionsCount}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mt-1">
              <span>↑ 12.6%</span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>

          {/* Monthly Recurring Revenue */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Monthly Recurring Revenue
            </span>
            <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums tracking-tight">
              {formatINR(metrics.mrr)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mt-1">
              <span>↑ 12.6%</span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>

          {/* Outstanding */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Outstanding
            </span>
            <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums tracking-tight">
              {formatINR(metrics.outstandingTotal)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium mt-1">
              <span>{invoices.filter((i) => i.status === 'Confirmed' || i.status === 'Draft').length} invoices</span>
              <span className="text-slate-400">awaiting receipt</span>
            </div>
          </div>

          {/* Overdue */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Overdue
            </span>
            <div className="text-2xl font-semibold text-rose-700 mt-1 tabular-nums tracking-tight">
              {formatINR(metrics.overdueTotal)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-medium mt-1">
              <span>{overdueInvoicesCount} invoices</span>
              <span className="text-slate-400">past credit term</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Operational Content (Balanced Two-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Revenue Overview (Billed vs Collected Chart) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Revenue overview</h2>
              <p className="text-[11px] text-slate-500">Billed invoices compared to cash collected</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0C3430]" />
                <span className="text-slate-700 font-medium">Billed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                <span className="text-slate-700 font-medium">Collected</span>
              </div>
            </div>
          </div>

          {/* Compact Chart Viewport */}
          <div className="relative pt-2 pb-1">
            {/* Grid Lines */}
            <div className="space-y-5 text-[10px] text-slate-400 font-mono">
              {['₹25L', '₹20L', '₹15L', '₹10L', '₹5L', '₹0'].map((val) => (
                <div key={val} className="flex items-center gap-2">
                  <span className="w-9 text-right">{val}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
              ))}
            </div>

            {/* SVG Lines */}
            <svg
              className="absolute inset-0 left-12 right-2 top-2 h-[140px] w-[calc(100%-3.5rem)] overflow-visible"
              viewBox="0 0 600 140"
              preserveAspectRatio="none"
            >
              {/* Billed line */}
              <polyline
                fill="none"
                stroke="#0C3430"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,85 100,70 200,55 300,26 400,48 500,42 600,18"
              />
              {/* Collected line */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,105 100,90 200,75 300,58 400,68 500,62 600,44"
              />

              {/* Data points */}
              {[
                [0, 85], [100, 70], [200, 55], [300, 26], [400, 48], [500, 42], [600, 18],
              ].map(([x, y], i) => (
                <circle key={`b-${i}`} cx={x} cy={y} r="3" fill="#0C3430" />
              ))}

              {[
                [0, 105], [100, 90], [200, 75], [300, 58], [400, 68], [500, 62], [600, 44],
              ].map(([x, y], i) => (
                <circle key={`c-${i}`} cx={x} cy={y} r="3" fill="#059669" />
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between pl-12 pr-1 text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100 mt-2">
              {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Renewals (Dense, precise list) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Upcoming renewals</h2>
              <p className="text-[11px] text-slate-500">Contracts maturing in next 30 days</p>
            </div>
            <button
              onClick={() => onNavigate('subscriptions')}
              className="text-xs font-medium text-[#0C3430] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {upcomingRenewals.map((r) => (
              <div
                key={r.id}
                onClick={() => onNavigate('subscriptions')}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-800">{r.customer}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {r.plan} · Due {r.date}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-slate-900 tabular-nums">
                    {formatINR(r.amount)}
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                    in {r.daysLeft}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Supporting Operations Section (Recent Invoices Ledger + Collection Efficiency Strip) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Recent Invoices Ledger (Left 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Invoices</h2>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-medium text-[#0C3430] hover:underline flex items-center gap-1"
            >
              <span>Invoice ledger</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium text-[11px]">
                  <th className="pb-2">Invoice</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Due Date</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onNavigate('invoices')}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-mono font-medium text-slate-700">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 text-slate-900 font-medium">{inv.customerName}</td>
                    <td className="py-2.5 text-slate-500">{inv.dueDate}</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold text-slate-900">
                      {formatINR(inv.totalAmount)}
                    </td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collection Efficiency & Overdue Alert Strip (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Collection metrics</h2>

            <div className="space-y-3 text-xs pt-1">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500">Collection efficiency</span>
                  <span className="font-semibold text-emerald-800 tabular-nums font-mono">{metrics.collectionEfficiency}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, metrics.collectionEfficiency)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-100">
                <span className="text-slate-500">Avg. collection period</span>
                <span className="font-semibold text-slate-900 tabular-nums font-mono">{metrics.avgCollectionDays} days</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-100">
                <span className="text-slate-500">Overdue accounts</span>
                <span className="font-semibold text-rose-700 tabular-nums font-mono">
                  {overdueCustomersCount} companies ({overdueInvoicesCount} inv)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigate('reports')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors text-center"
              >
                View full financial report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
