import React, { useState } from 'react';
import {
  Search,
  Download,
  Plus,
  CheckCircle2,
  X,
  CreditCard,
  Building,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { PaymentMethod, PaymentStatus } from '../types';
import { formatINR, rupeesToPaise } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';

export const PaymentsPage: React.FC = () => {
  const { invoices, payments, recordPayment } = useBilling();
  const [activeTab, setActiveTab] = useState<'All' | 'Paid' | 'Outstanding' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Unpaid invoices eligible for recording payment
  const openInvoices = invoices.filter(
    (i) => (i.status === 'Confirmed' || i.status === 'Overdue') && (i.balance || i.totalAmount) > 0
  );

  // Form states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(openInvoices[0]?.id || invoices[0]?.id || '');
  const [amountInput, setAmountInput] = useState(
    openInvoices[0] ? String(openInvoices[0].balance / 100) : '0'
  );
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank transfer');
  const [referenceNumber, setReferenceNumber] = useState(`TXN-${Date.now().toString().slice(-6)}`);
  const [note, setNote] = useState('Electronic payment clearance');

  const targetInvoice = invoices.find(
    (i) => i.id === selectedInvoiceId || i.invoiceNumber === selectedInvoiceId
  );

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = invoices.find((i) => i.id === id || i.invoiceNumber === id);
    if (inv) {
      setAmountInput(String((inv.balance || inv.totalAmount) / 100));
    }
  };

  const handleOpenDrawer = () => {
    if (openInvoices.length > 0) {
      setSelectedInvoiceId(openInvoices[0].id);
      setAmountInput(String(openInvoices[0].balance / 100));
    }
    setReferenceNumber(`TXN-${Date.now().toString().slice(-6)}`);
    setShowDrawer(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvoice) return;

    const parsedRupees = parseFloat(amountInput);
    if (isNaN(parsedRupees) || parsedRupees <= 0) {
      setToast({ text: 'Please enter a valid positive payment amount.', isError: true });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    const amountPaise = rupeesToPaise(parsedRupees);
    if (amountPaise > targetInvoice.balance) {
      setToast({
        text: `Overpayment blocked. Maximum remaining balance is ${formatINR(targetInvoice.balance)}.`,
        isError: true,
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const res = recordPayment({
      invoiceId: targetInvoice.id,
      amount: amountPaise,
      method: paymentMethod,
      referenceNumber,
      receivedDate: paymentDate,
      note,
    });

    if (res.success) {
      setToast({
        text: `Payment of ${formatINR(amountPaise)} recorded against ${targetInvoice.invoiceNumber}.`,
      });
      setShowDrawer(false);
    } else {
      setToast({ text: res.error || 'Payment recording failed.', isError: true });
    }
    setTimeout(() => setToast(null), 3500);
  };

  // Financial Strip Aggregates (Live from data layer in integer paise)
  const paidTotal = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstandingInvoices = invoices.filter(
    (i) => (i.status === 'Confirmed' || i.status === 'Overdue') && i.balance > 0
  );
  const outstandingTotal = outstandingInvoices.reduce((sum, i) => sum + (i.balance || 0), 0);
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue' && i.balance > 0);
  const overdueTotal = overdueInvoices.reduce((sum, i) => sum + (i.balance || 0), 0);

  const totalInvoiced = paidTotal + outstandingTotal;
  const collectionRate = totalInvoiced > 0 ? (paidTotal / totalInvoiced) * 100 : 100;

  // Build unified ledger rows
  const paymentLedgerRows = payments.map((p) => ({
    id: p.id,
    customer: p.customerName,
    invoice: p.invoiceNumber,
    method: p.method,
    received: p.receivedDate,
    amount: p.amount,
    status: p.status,
  }));

  // Also include outstanding/overdue invoice receivables for full ledger transparency
  const outstandingLedgerRows = invoices
    .filter((inv) => (inv.status === 'Confirmed' || inv.status === 'Overdue') && inv.balance > 0)
    .map((inv) => ({
      id: `receivable-${inv.id}`,
      customer: inv.customerName,
      invoice: inv.invoiceNumber,
      method: 'Pending' as any,
      received: `Due ${inv.dueDate}`,
      amount: inv.balance,
      status: (inv.status === 'Overdue' ? 'Overdue' : 'Outstanding') as PaymentStatus,
    }));

  const allRows = [...paymentLedgerRows, ...outstandingLedgerRows];

  const filteredRows = allRows
    .filter((r) => {
      const matchesTab =
        activeTab === 'All'
          ? true
          : r.status.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch =
        r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.method.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = filteredRows.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Customer,Invoice,Payment Method,Received Date,Amount (INR),Status',
        ...filteredRows.map(
          (r) =>
            `"${r.customer}",${r.invoice},${r.method},${r.received},${r.amount / 100},${r.status}`
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Brightloop_Payment_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ text: 'Payment reconciliation report exported as CSV.' });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {toast && (
        <div
          className={`toast-enter px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between border ${
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
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Match every rupee to the invoice it closes. Real-time bank reconciliation.
          </p>
        </div>

        <button
          onClick={handleOpenDrawer}
          className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] shadow-2xs flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record payment</span>
        </button>
      </div>

      {/* Financial Reconciliation Strip */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-4">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Reconciled Paid
            </span>
            <div className="text-xl font-semibold text-slate-900 mt-0.5 tabular-nums">
              {formatINR(paidTotal)}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              {payments.length} transactions
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Outstanding Balance
            </span>
            <div className="text-xl font-semibold text-slate-900 mt-0.5 tabular-nums">
              {formatINR(outstandingTotal)}
            </div>
            <span className="text-[10px] text-amber-700 font-medium">
              {outstandingInvoices.length} payments expected
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Overdue Receivables
            </span>
            <div className="text-xl font-semibold text-rose-700 mt-0.5 tabular-nums">
              {formatINR(overdueTotal)}
            </div>
            <span className="text-[10px] text-rose-700 font-medium">
              {overdueInvoices.length} invoices past due
            </span>
          </div>

          <div className="p-4 bg-slate-50/50">
            <div className="flex justify-between items-center text-[11px] text-slate-600 mb-1">
              <span>Collection rate</span>
              <span className="font-semibold text-emerald-700">
                {collectionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, collectionRate))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Total invoiced: {formatINR(totalInvoiced)}
            </span>
          </div>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {(['All', 'Paid', 'Outstanding', 'Overdue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search ledger..."
                className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden w-full sm:w-40"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded text-xs text-slate-700 font-medium"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Invoice</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Received Date</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.map((row, idx) => (
                <tr key={`${row.id}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-900 font-medium">{row.customer}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.invoice}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.method}</td>
                  <td className="py-2.5 px-3 text-slate-500">{row.received}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                    {formatINR(row.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
          <span>
            Showing {filteredRows.length > 0 ? (validCurrentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(validCurrentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length}{' '}
            records
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

      {/* Record Payment Slide-over Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs backdrop-fade flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordPayment}
            className="modal-enter bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Record Payment</h2>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Invoice</label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.customerName} ({formatINR(inv.balance || inv.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Customer</label>
              <input
                type="text"
                readOnly
                value={targetInvoice?.customerName || 'Select an invoice'}
                className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Amount (₹) — Max: {formatINR(targetInvoice?.balance || 0)}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="Bank transfer">Bank transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Received Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Ref Number</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="UTR/TXN ID"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. November settlement"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold rounded hover:bg-[#E5A817]"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

