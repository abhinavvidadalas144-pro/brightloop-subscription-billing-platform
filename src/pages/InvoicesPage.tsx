import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Send,
  Printer,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  X,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { Invoice, InvoiceStatus, PaymentMethod } from '../types';
import { formatINR, rupeesToPaise } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoicePrintModal } from '../components/common/InvoicePrintModal';

export const InvoicesPage: React.FC = () => {
  const {
    invoices,
    runBillingRun,
    previewBillingRun,
    confirmInvoice,
    cancelInvoice,
    sendInvoice,
    recordPayment,
  } = useBilling();

  const [selectedPeriod, setSelectedPeriod] = useState('October 2026');
  const [activeFilter, setActiveFilter] = useState<'All' | InvoiceStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>('INV-2026-0187');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Billing Run Modal State
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingPreview, setBillingPreview] = useState<{
    eligibleSubscriptions: any[];
    totalExpectedPaise: number;
    billingPeriod: string;
  } | null>(null);

  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmountRupees, setPayAmountRupees] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank transfer');
  const [payReference, setPayReference] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNote, setPayNote] = useState('');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [sortField, setSortField] = useState<'number' | 'customer' | 'dueDate' | 'amount' | 'status'>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];

  const filteredInvoices = invoices
    .filter((inv) => {
      const matchesFilter = activeFilter === 'All' || inv.status === activeFilter;
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.subscriptionId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'number') cmp = a.invoiceNumber.localeCompare(b.invoiceNumber);
      else if (sortField === 'customer') cmp = a.customerName.localeCompare(b.customerName);
      else if (sortField === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate);
      else if (sortField === 'amount') cmp = a.totalAmount - b.totalAmount;
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedInvoices = filteredInvoices.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  const handleOpenBillingModal = () => {
    const preview = previewBillingRun();
    setBillingPreview(preview);
    setShowBillingModal(true);
  };

  const handleExecuteBilling = () => {
    const res = runBillingRun(selectedPeriod);
    setShowBillingModal(false);
    setToast({
      type: res.success && res.createdCount > 0 ? 'success' : 'info',
      text: res.message,
    });
    setTimeout(() => setToast(null), 5000);
  };

  const handleConfirm = () => {
    if (!selectedInvoice) return;
    const res = confirmInvoice(selectedInvoice.id);
    if (!res.success) {
      setToast({ type: 'error', text: res.error || 'Failed to confirm invoice.' });
    } else {
      setToast({ type: 'success', text: `Invoice ${selectedInvoice.invoiceNumber} confirmed.` });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancelInvoice = () => {
    if (!selectedInvoice) return;
    const res = cancelInvoice(selectedInvoice.id);
    if (!res.success) {
      setToast({ type: 'error', text: res.error || 'Cannot cancel invoice.' });
    } else {
      setToast({ type: 'success', text: `Invoice ${selectedInvoice.invoiceNumber} cancelled.` });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const handleSend = () => {
    if (!selectedInvoice) return;
    const res = sendInvoice(selectedInvoice.id);
    if (!res.success) {
      setToast({ type: 'error', text: res.error || 'Failed to dispatch invoice.' });
    } else {
      setToast({
        type: 'success',
        text: `Invoice ${selectedInvoice.invoiceNumber} dispatched to ${selectedInvoice.customerName}.`,
      });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenPayment = () => {
    if (!selectedInvoice) return;
    setPayAmountRupees(String((selectedInvoice.balance || selectedInvoice.totalAmount) / 100));
    setPayReference(`UTR-${Date.now().toString().slice(-6)}`);
    setPayNote(`Settlement for ${selectedInvoice.invoiceNumber}`);
    setShowPayModal(true);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const parsedRupees = parseFloat(payAmountRupees);
    if (isNaN(parsedRupees) || parsedRupees <= 0) {
      setToast({ type: 'error', text: 'Please enter a valid positive payment amount.' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    const amountPaise = rupeesToPaise(parsedRupees);
    if (amountPaise > selectedInvoice.balance) {
      setToast({
        type: 'error',
        text: `Overpayment blocked. Maximum remaining balance is ${formatINR(selectedInvoice.balance)}.`,
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const res = recordPayment({
      invoiceId: selectedInvoice.id,
      amount: amountPaise,
      method: payMethod,
      referenceNumber: payReference,
      receivedDate: payDate,
      note: payNote,
    });

    if (!res.success) {
      setToast({ type: 'error', text: res.error || 'Payment recording failed.' });
    } else {
      setToast({
        type: 'success',
        text: `Payment of ${formatINR(amountPaise)} recorded against ${selectedInvoice.invoiceNumber}.`,
      });
      setShowPayModal(false);
    }
    setTimeout(() => setToast(null), 3500);
  };

  const toggleSort = (field: 'number' | 'customer' | 'dueDate' | 'amount' | 'status') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between border ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated monthly billing, invoices, payment matching, and collection dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-800 shadow-2xs focus:outline-hidden"
          >
            <option value="October 2026">October 2026</option>
            <option value="November 2026">November 2026</option>
            <option value="December 2026">December 2026</option>
          </select>

          {/* Run Billing Button */}
          <button
            onClick={handleOpenBillingModal}
            className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run billing</span>
          </button>
        </div>
      </div>

      {/* Main Table + Detail Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Workspace (Left 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          {/* Toolbar: Filters & Search */}
          <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {(['All', 'Draft', 'Confirmed', 'Paid', 'Overdue', 'Cancelled'] as const).map((filter) => (
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
              ))}
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter invoices..."
                className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden w-full sm:w-48"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                  <th
                    onClick={() => toggleSort('number')}
                    className="py-2.5 px-3 cursor-pointer select-none hover:text-slate-900"
                  >
                    Invoice {sortField === 'number' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => toggleSort('customer')}
                    className="py-2.5 px-3 cursor-pointer select-none hover:text-slate-900"
                  >
                    Customer {sortField === 'customer' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-2.5 px-3">Subscription</th>
                  <th
                    onClick={() => toggleSort('dueDate')}
                    className="py-2.5 px-3 cursor-pointer select-none hover:text-slate-900"
                  >
                    Due Date {sortField === 'dueDate' ? (sortAsc ? '↑' : '↓') : ''}
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
                {paginatedInvoices.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id;

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-50/90 font-medium' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900">{inv.customerName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{inv.subscriptionId}</td>
                      <td className="py-2.5 px-3 text-slate-500">{inv.dueDate}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  );
                })}
                {paginatedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer stats / pagination */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
            <span>
              Showing {filteredInvoices.length > 0 ? (validCurrentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(validCurrentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length}{' '}
              invoices
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

        {/* Selected Invoice Inspector (Right 4 cols) */}
        {selectedInvoice && (
          <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Invoice Inspector
                </span>
                <div className="font-mono text-base font-semibold text-slate-900 mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </div>
              </div>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Customer</span>
                <span className="font-medium text-slate-900">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Subscription</span>
                <span className="font-mono text-slate-700">{selectedInvoice.subscriptionId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Billing Period</span>
                <span className="text-slate-700">{selectedInvoice.billingPeriod}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Due Date</span>
                <span className="text-slate-700">{selectedInvoice.dueDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-mono text-slate-700 font-medium">
                  {formatINR(selectedInvoice.amountPaid || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Remaining Balance</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatINR(selectedInvoice.balance || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 pt-3">
                <span className="text-slate-700 font-semibold">Total Amount</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {formatINR(selectedInvoice.totalAmount)}
                </span>
              </div>
            </div>

            {/* Line items preview */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Line items
              </span>
              <div className="space-y-1.5 text-xs text-slate-600">
                {selectedInvoice.lines.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span className="truncate pr-2">{l.item}</span>
                    <span className="font-mono font-medium tabular-nums text-slate-900">
                      {formatINR(l.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={selectedInvoice.status !== 'Draft'}
                  className={`py-1.5 px-2 rounded text-xs font-semibold text-center transition-colors ${
                    selectedInvoice.status === 'Draft'
                      ? 'bg-[#F4BA28] text-slate-950 hover:bg-[#E5A817]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm
                </button>

                <button
                  onClick={handleSend}
                  className="py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <Send className="w-3 h-3 text-slate-400" />
                  <span>Send</span>
                </button>

                <button
                  onClick={() => setSelectedInvoiceForPrint(selectedInvoice)}
                  className="py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <Printer className="w-3 h-3 text-slate-400" />
                  <span>Print</span>
                </button>
              </div>

              {/* Secondary Actions: Record Payment & Cancel */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(selectedInvoice.status === 'Confirmed' || selectedInvoice.status === 'Overdue') &&
                  selectedInvoice.balance > 0 && (
                    <button
                      onClick={handleOpenPayment}
                      className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record payment</span>
                    </button>
                  )}

                {(selectedInvoice.status === 'Draft' || selectedInvoice.status === 'Confirmed') && (
                  <button
                    onClick={handleCancelInvoice}
                    className="py-1.5 px-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Invoice</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Billing Run Preview Modal */}
      {showBillingModal && billingPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Execute Billing Run</h3>
              <button
                type="button"
                onClick={() => setShowBillingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Billing run will generate invoices for active contracts for period{' '}
              <span className="font-semibold text-slate-900">{selectedPeriod}</span>.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Eligible Active Subscriptions:</span>
                <span className="font-semibold text-slate-900">
                  {billingPreview.eligibleSubscriptions.length} contracts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Total Run Value:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatINR(billingPreview.totalExpectedPaise)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Duplicate Prevention:</span>
                <span className="text-emerald-700 font-medium">Idempotent (skips already-billed)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBillingModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Dismiss
              </button>
              <button
                onClick={handleExecuteBilling}
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold rounded hover:bg-[#E5A817] flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Confirm & Run Invoicing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordPaymentSubmit}
            className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Record Payment — {selectedInvoice.invoiceNumber}
              </h3>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="font-medium text-slate-900">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Amount:</span>
                <span className="font-mono text-slate-900 font-medium">
                  {formatINR(selectedInvoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Outstanding Balance:</span>
                <span className="font-mono text-rose-700 font-semibold">
                  {formatINR(selectedInvoice.balance)}
                </span>
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">
                Payment Amount (₹) — Max: {formatINR(selectedInvoice.balance)}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={payAmountRupees}
                onChange={(e) => setPayAmountRupees(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="Bank transfer">Bank transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Received Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Reference / UTR Number</label>
              <input
                type="text"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                placeholder="UTR / TXN ID"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                required
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Note (Optional)</label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="e.g. Partial remittance"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold rounded hover:bg-[#E5A817]"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      <InvoicePrintModal
        invoice={selectedInvoiceForPrint}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />
    </div>
  );
};

