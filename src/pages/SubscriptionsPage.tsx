import React, { useState } from 'react';
import {
  Search,
  Download,
  Send,
  Plus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  Pause,
  Play,
  RotateCw,
  AlertTriangle,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { Subscription, SubscriptionStatus } from '../types';
import { formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';

export const SubscriptionsPage: React.FC = () => {
  const {
    subscriptions,
    updateSubscriptionStatus,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
    closeSubscriptionEarly,
    createSubscription,
    customers,
    plans,
  } = useBilling();

  const [activeFilter, setActiveFilter] = useState<'All' | SubscriptionStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<string>('SUB-0042');
  const [showDrawer, setShowDrawer] = useState(true);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);
  const [showNewSubModal, setShowNewSubModal] = useState(false);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [sortField, setSortField] = useState<'customer' | 'renewal' | 'amount' | 'status'>('renewal');
  const [sortAsc, setSortAsc] = useState(true);

  // New Sub States
  const [newCustId, setNewCustId] = useState(customers[0]?.id || '');
  const [newPlanId, setNewPlanId] = useState(plans[0]?.id || '');
  const [newSeats, setNewSeats] = useState(25);
  const [newTerms, setNewTerms] = useState('Net 30');

  const selectedSub = subscriptions.find((s) => s.id === selectedSubId) || subscriptions[0];

  const filteredSubs = subscriptions
    .filter((sub) => {
      const matchesFilter = activeFilter === 'All' || sub.status === activeFilter;
      const matchesSearch =
        sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'customer') cmp = a.customerName.localeCompare(b.customerName);
      else if (sortField === 'renewal') cmp = a.renewalDate.localeCompare(b.renewalDate);
      else if (sortField === 'amount') cmp = a.totalAmount - b.totalAmount;
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filteredSubs.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSubs = filteredSubs.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  const handleStatusChange = (newStatus: SubscriptionStatus) => {
    if (!selectedSub) return;
    const res = updateSubscriptionStatus(selectedSub.id, newStatus);
    if (!res.success) {
      setToast({ text: res.error || `Cannot change to ${newStatus}.`, isError: true });
    } else {
      setToast({ text: `Subscription ${selectedSub.id} transitioned to "${newStatus}".` });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handlePause = () => {
    if (!selectedSub) return;
    const res = pauseSubscription(selectedSub.id);
    if (!res.success) {
      setToast({ text: res.error || 'Cannot pause subscription.', isError: true });
    } else {
      setToast({ text: `Subscription ${selectedSub.id} paused.` });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleResume = () => {
    if (!selectedSub) return;
    const res = resumeSubscription(selectedSub.id);
    if (!res.success) {
      setToast({ text: res.error || 'Cannot resume subscription.', isError: true });
    } else {
      setToast({ text: `Subscription ${selectedSub.id} resumed to Active.` });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleRenew = () => {
    if (!selectedSub) return;
    const res = renewSubscription(selectedSub.id);
    if (!res.success) {
      setToast({ text: res.error || 'Cannot renew subscription.', isError: true });
    } else {
      setToast({ text: `Subscription ${selectedSub.id} renewed successfully.` });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleCloseEarly = () => {
    if (!selectedSub) return;
    const res = closeSubscriptionEarly(selectedSub.id);
    if (!res.success) {
      setToast({ text: res.error || 'Cannot close subscription early.', isError: true });
    } else {
      setToast({ text: `Subscription ${selectedSub.id} closed early.` });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const lifecycleSteps: SubscriptionStatus[] = [
    'Draft',
    'Quotation',
    'Confirmed',
    'Active',
    'Closed',
  ];
  const currentStepIndex = lifecycleSteps.indexOf(selectedSub?.status || 'Active');

  const handleCreateNewSub = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId) || customers[0];
    const plan = plans.find((p) => p.id === newPlanId) || plans[0];

    // Enforce plan min quantity
    if (plan && newSeats < plan.minQuantity) {
      setToast({
        text: `Plan "${plan.name}" requires a minimum of ${plan.minQuantity} seats.`,
        isError: true,
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const baseAmount = plan.price * 12; // integer paise
    const seatAmount = newSeats * 36000; // ₹360/seat in paise
    const taxAmount = Math.round((baseAmount + seatAmount) * 0.18);
    const totalAmount = baseAmount + seatAmount + taxAmount;

    const renewalObj = new Date();
    renewalObj.setFullYear(renewalObj.getFullYear() + 1);

    const res = createSubscription({
      customerId: cust.id,
      customerName: cust.name,
      planId: plan.id,
      planName: plan.name,
      billingFrequency: 'yearly',
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: renewalObj.toISOString().split('T')[0],
      paymentTerms: newTerms,
      status: 'Draft',
      lines: [
        { id: `sl-${Date.now()}-1`, productId: 'prod-platform', item: `${plan.name} Platform License`, amount: baseAmount },
        { id: `sl-${Date.now()}-2`, productId: 'prod-seats', item: `Usage Seats (${newSeats} seats)`, amount: seatAmount, quantity: newSeats },
        { id: `sl-${Date.now()}-3`, productId: 'prod-tax', item: 'GST (18%)', amount: taxAmount },
      ],
      subtotal: baseAmount + seatAmount,
      discountAmount: 0,
      taxAmount,
      totalAmount,
      note: `Annual contract for ${plan.name} plan. Includes up to ${newSeats} seats.`,
      nextBillingDate: renewalObj.toISOString().split('T')[0],
    });

    if (!res.success || !res.subscription) {
      setToast({ text: res.error || 'Failed to create subscription.', isError: true });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setShowNewSubModal(false);
    setSelectedSubId(res.subscription.id);
    setToast({ text: `Subscription ${res.subscription.id} created in Draft state.` });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownload = () => {
    if (!selectedSub) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Subscription ID,Customer,Plan,Status,Renewal Date,Subtotal,Tax,Total',
        `${selectedSub.id},"${selectedSub.customerName}","${selectedSub.planName}",${selectedSub.status},${selectedSub.renewalDate},${selectedSub.subtotal / 100},${selectedSub.taxAmount / 100},${selectedSub.totalAmount / 100}`,
        '',
        'Line Item,Quantity,Amount (₹)',
        ...selectedSub.lines.map((l) => `"${l.item}",${l.quantity || 1},${l.amount / 100}`),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedSub.id}_contract.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ text: `Contract summary for ${selectedSub.id} exported.` });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSort = (field: 'customer' | 'renewal' | 'amount' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {toast && (
        <div
          className={`px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between border ${
            toast.isError
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.isError ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Subscriptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full contract lifecycle tracking across all active accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewSubModal(true)}
            className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New subscription</span>
          </button>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Subscriptions Table (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          {/* Toolbar */}
          <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 overflow-x-auto">
              {(['All', 'Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      activeFilter === filter
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden w-full sm:w-40"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                  <th
                    onClick={() => toggleSort('customer')}
                    className="py-2.5 px-3 cursor-pointer select-none hover:text-slate-900"
                  >
                    Customer {sortField === 'customer' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-2.5 px-3">Subscription</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th
                    onClick={() => toggleSort('renewal')}
                    className="py-2.5 px-3 cursor-pointer select-none hover:text-slate-900"
                  >
                    Renewal {sortField === 'renewal' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => toggleSort('amount')}
                    className="py-2.5 px-3 text-right cursor-pointer select-none hover:text-slate-900"
                  >
                    Amount {sortField === 'amount' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => toggleSort('status')}
                    className="py-2.5 px-3 text-center cursor-pointer select-none hover:text-slate-900"
                  >
                    Status {sortField === 'status' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSubs.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubId(sub.id);
                        setShowDrawer(true);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-50/90 font-medium' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-900 font-medium">{sub.customerName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{sub.id}</td>
                      <td className="py-2.5 px-3 text-slate-600">{sub.planName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{sub.renewalDate}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                        {formatINR(sub.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={sub.status} />
                      </td>
                    </tr>
                  );
                })}
                {paginatedSubs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
            <span>
              Showing {filteredSubs.length > 0 ? (validCurrentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(validCurrentPage * itemsPerPage, filteredSubs.length)} of {filteredSubs.length}{' '}
              subscriptions
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
                className="p-1 border border-slate-200 rounded hover:bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-xs text-slate-700">
                {validCurrentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className="p-1 border border-slate-200 rounded hover:bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Subscription Drawer (Right 5 cols) */}
        {showDrawer && selectedSub && (
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                  {selectedSub.id}
                </span>
                <h2 className="text-base font-semibold text-slate-900 mt-0.5">
                  {selectedSub.customerName}
                </h2>
              </div>
              <StatusBadge status={selectedSub.status} />
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-baseline py-1">
              <span className="text-xs text-slate-500">Contract Total</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {formatINR(selectedSub.totalAmount)}
              </span>
            </div>

            {/* Disciplined 5-Stage Stepper */}
            <div className="py-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Lifecycle State
              </div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {lifecycleSteps.map((step, idx) => {
                  const isActive = step === selectedSub.status;
                  const isPassed = idx <= currentStepIndex;

                  return (
                    <button
                      key={step}
                      onClick={() => handleStatusChange(step)}
                      className={`py-1.5 px-1 rounded text-[10px] font-medium transition-colors border ${
                        isActive
                          ? 'bg-[#0C3430] text-white border-[#0C3430] font-semibold'
                          : isPassed
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                    >
                      {step}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plan Lifecycle Controls */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Contract Controls
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSub.status === 'Active' && !selectedSub.isPaused && (
                  <button
                    onClick={handlePause}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded text-xs font-medium flex items-center gap-1.5"
                  >
                    <Pause className="w-3 h-3 text-amber-600" />
                    <span>Pause Subscription</span>
                  </button>
                )}
                {selectedSub.status === 'Active' && selectedSub.isPaused && (
                  <button
                    onClick={handleResume}
                    className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded text-xs font-medium flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 text-emerald-600" />
                    <span>Resume Subscription</span>
                  </button>
                )}
                {selectedSub.status === 'Active' && (
                  <button
                    onClick={handleCloseEarly}
                    className="py-1 px-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 rounded text-xs font-medium flex items-center gap-1.5"
                  >
                    <X className="w-3 h-3" />
                    <span>Close Early</span>
                  </button>
                )}
                {selectedSub.status === 'Closed' && (
                  <button
                    onClick={handleRenew}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded text-xs font-medium flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3 h-3 text-emerald-600" />
                    <span>Renew Contract</span>
                  </button>
                )}
              </div>
            </div>

            {/* Order lines breakdown */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Line items
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                {selectedSub.lines.map((line) => (
                  <div key={line.id} className="flex justify-between">
                    <span className="truncate pr-2">{line.item}</span>
                    <span className="font-mono tabular-nums text-slate-900 font-medium">
                      {formatINR(line.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note box */}
            {selectedSub.note && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
                {selectedSub.note}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  setToast({ text: `Notice dispatched to ${selectedSub.customerName}.` });
                  setTimeout(() => setToast(null), 3000);
                }}
                className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-slate-500" />
                <span>Send Notice</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Subscription Modal */}
      {showNewSubModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewSub}
            className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Create Subscription</h3>
              <button
                type="button"
                onClick={() => setShowNewSubModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Customer Account</label>
              <select
                value={newCustId}
                onChange={(e) => setNewCustId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Plan Tier</label>
              <select
                value={newPlanId}
                onChange={(e) => setNewPlanId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatINR(p.price)}/mo) — Min {p.minQuantity} seats
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Seats</label>
                <input
                  type="number"
                  value={newSeats}
                  onChange={(e) => setNewSeats(Number(e.target.value))}
                  min={1}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Terms</label>
                <select
                  value={newTerms}
                  onChange={(e) => setNewTerms(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Due on receipt">Due on receipt</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewSubModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold rounded hover:bg-[#E5A817]"
              >
                Activate Subscription
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

