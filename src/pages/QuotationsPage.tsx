import React, { useState } from 'react';
import {
  FileCheck,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  RefreshCw,
  Search,
  Filter,
  Check,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { Quotation } from '../types';
import { Currency, formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';
import { AppPage } from '../components/common/Sidebar';

interface QuotationsPageProps {
  onNavigate: (page: AppPage) => void;
}

export const QuotationsPage: React.FC<QuotationsPageProps> = ({ onNavigate }) => {
  const {
    quotations,
    customers,
    plans,
    products,
    createQuotation,
    convertQuoteToSubscription,
  } = useBilling();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Sent' | 'Accepted' | 'Converted'>('All');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [templateName, setTemplateName] = useState('Enterprise Growth Template');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [planId, setPlanId] = useState(plans[1]?.id || plans[0]?.id || '');
  const [validDays, setValidDays] = useState(30);
  const [seatQuantity, setSeatQuantity] = useState(50);
  const [notes, setNotes] = useState('Includes promotional setup discount and priority onboarding SLA.');

  const filteredQuotes = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedQuote = quotations.find((q) => q.id === selectedQuoteId) || quotations[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId) || customers[0];
    const plan = plans.find((p) => p.id === planId) || plans[0];

    const basePrice = plan.price * 12;
    const seatPrice = seatQuantity * 36000; // ₹360/seat in paise
    const subtotal = basePrice + seatPrice;
    const discountAmount = Math.round(subtotal * 0.1);
    const taxAmount = Math.round((subtotal - discountAmount) * 0.18);
    const totalAmount = subtotal - discountAmount + taxAmount;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validDays);

    const created = createQuotation({
      customerId: cust.id,
      customerName: cust.name,
      planId: plan.id,
      planName: plan.name,
      templateName,
      validDays,
      validUntil: validUntilDate.toISOString().split('T')[0],
      status: 'Sent',
      lines: [
        {
          productId: 'prod-platform',
          productName: `${plan.name} Platform Subscription`,
          quantity: 1,
          unitPrice: basePrice,
          amount: basePrice,
        },
        {
          productId: 'prod-seats',
          productName: 'Usage Seats',
          quantity: seatQuantity,
          unitPrice: 36000,
          amount: seatPrice,
        },
      ],
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      notes,
    });

    setShowModal(false);
    setSelectedQuoteId(created.id);
    setToast(`Quotation ${created.quotationNumber} generated and sent to ${cust.name}.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleConvert = (quoteId: string) => {
    const targetQuote = quotations.find((q) => q.id === quoteId);
    if (targetQuote && new Date(targetQuote.validUntil) < new Date()) {
      setToast(`Quotation ${targetQuote.quotationNumber} expired on ${targetQuote.validUntil}. Please generate a renewed proposal.`);
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const newSub = convertQuoteToSubscription(quoteId);
    if (newSub) {
      setToast(`Quotation converted! Created subscription ${newSub.id} for ${newSub.customerName}.`);
      setTimeout(() => {
        setToast(null);
        onNavigate('subscriptions');
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="toast-enter bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Quotations & Proposals</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              {quotations.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create custom commercial proposals with tiered products and convert directly into live subscriptions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-medium text-xs rounded-md hover:bg-[#E5A817] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200 rounded-md p-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotations by number, customer, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-hidden focus:bg-white focus:border-[#0B2E2B]"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto text-xs">
          {(['All', 'Draft', 'Sent', 'Accepted', 'Converted'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main split ledger / inspector layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Ledger Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Quotation #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Plan / Template</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Valid Until</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((q) => {
                const isSelected = selectedQuote?.id === q.id;
                const canConvert = q.status === 'Accepted' || q.status === 'Sent';

                return (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuoteId(q.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal-50/40' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-2 px-3 font-mono font-medium text-[#0B2E2B]">
                      {q.quotationNumber}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {q.customerName}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      <div>{q.planName}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {q.templateName}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {formatINR(q.totalAmount)}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                      {q.validUntil}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-2 px-3 text-right">
                      {canConvert ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConvert(q.id);
                          }}
                          className="px-2 py-0.5 bg-[#0B2E2B] hover:bg-[#154442] text-white text-[11px] font-medium rounded transition-colors inline-flex items-center gap-1"
                        >
                          <span>Convert</span>
                          <ArrowRight className="w-3 h-3 text-[#F4BA28]" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {q.status === 'Converted' ? 'Subscribed' : 'Closed'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No quotations matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Quotation Inspector (4 cols) */}
        {selectedQuote && (
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Proposal Details</span>
                <div className="font-mono text-sm font-semibold text-[#0B2E2B]">{selectedQuote.quotationNumber}</div>
              </div>
              <StatusBadge status={selectedQuote.status} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer</span>
                <span className="font-medium text-slate-900">{selectedQuote.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Proposed Plan</span>
                <span className="font-medium text-slate-900">{selectedQuote.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Template</span>
                <span className="font-mono text-slate-700">{selectedQuote.templateName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Validity Window</span>
                <span className="font-mono text-slate-700">{selectedQuote.validUntil} ({selectedQuote.validDays}d)</span>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1">Proposed Line Items</div>
              <div className="border border-slate-200 rounded overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100">
                    {selectedQuote.lines.map((ln, idx) => (
                      <tr key={idx} className="bg-slate-50/50">
                        <td className="py-1.5 px-2 text-slate-700">
                          {ln.productName}
                          <span className="text-[10px] text-slate-400 block font-mono">Qty: {ln.quantity} × {formatINR(ln.unitPrice)}</span>
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-medium text-slate-900 tabular-nums">
                          {formatINR(ln.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations breakdown */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatINR(selectedQuote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Discount applied</span>
                <span className="font-mono tabular-nums">-{formatINR(selectedQuote.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (GST 18%)</span>
                <span className="font-mono tabular-nums">+{formatINR(selectedQuote.taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-sm">{formatINR(selectedQuote.totalAmount)}</span>
              </div>
            </div>

            {selectedQuote.notes && (
              <p className="text-[11px] text-slate-500 italic bg-slate-50/50 p-2 rounded border border-slate-100">
                "{selectedQuote.notes}"
              </p>
            )}

            {/* Action buttons */}
            {(selectedQuote.status === 'Accepted' || selectedQuote.status === 'Sent') && (
              <button
                onClick={() => handleConvert(selectedQuote.id)}
                className="w-full py-2 bg-[#0B2E2B] hover:bg-[#154442] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Convert to Active Subscription</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F4BA28]" />
              </button>
            )}

            {selectedQuote.status === 'Converted' && (
              <div className="w-full py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium rounded text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Subscription Active in System</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs backdrop-fade flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="modal-enter bg-white rounded-md max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-[#0B2E2B]">Create Sales Quotation</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">Proposal Template</label>
              <select
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
              >
                <option value="Enterprise Growth Template">Enterprise Growth Template</option>
                <option value="SaaS Starter Annual Bundle">SaaS Starter Annual Bundle</option>
                <option value="Scale Custom Outlets Contract">Scale Custom Outlets Contract</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">Customer Account</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Target Plan</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatINR(p.price)}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Validity Period</label>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                >
                  <option value={15}>15 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">Usage Seats Quota</label>
              <input
                type="number"
                min={5}
                value={seatQuantity}
                onChange={(e) => setSeatQuantity(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">Commercial Notes / Terms</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-medium rounded text-xs hover:bg-[#E5A817]"
              >
                Create & Send Quotation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
