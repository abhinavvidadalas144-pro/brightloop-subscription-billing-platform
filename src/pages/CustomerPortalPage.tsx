import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  Eye,
  HelpCircle,
  Calendar,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoicePrintModal } from '../components/common/InvoicePrintModal';
import { Invoice } from '../types';

export const CustomerPortalPage: React.FC = () => {
  const {
    currentUser,
    subscriptions,
    invoices,
    plans,
    recordPayment,
    updateSubscription,
  } = useBilling();

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [showManagePlanModal, setShowManagePlanModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<Invoice | null>(null);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false);
  const [supportMessageSent, setSupportMessageSent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [selectedPlanId, setSelectedPlanId] = useState('plan-growth');
  const [extraSeats, setExtraSeats] = useState(50);
  const [cardLast4, setCardLast4] = useState('4242');
  const [cardExp, setCardExp] = useState('06/28');
  const [payMethod, setPayMethod] = useState<'Card' | 'UPI' | 'Bank transfer'>('UPI');

  const customerId = currentUser.customerId || 'cust-northwind';
  const customerCompany = currentUser.company || 'Northwind Traders';

  const customerSubs = subscriptions.filter(
    (s) => s.customerId === customerId || s.customerName.toLowerCase().includes(customerCompany.toLowerCase())
  );
  const activeSub = customerSubs.find((s) => s.status === 'Active') || customerSubs[0] || subscriptions[0];

  const customerInvoices = invoices.filter(
    (i) => i.customerId === customerId || i.customerName.toLowerCase().includes(customerCompany.toLowerCase())
  );

  const handlePayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal) return;

    const res = recordPayment({
      invoiceId: showPayModal.id,
      amount: showPayModal.balance || showPayModal.totalAmount,
      method: payMethod,
      referenceNumber: `PAY-TXN-${Date.now().toString().slice(-6)}`,
      receivedDate: new Date().toISOString().split('T')[0],
      note: 'Settled via Customer Billing Portal',
    });

    if (res.success) {
      setToast(`Payment of ${formatINR(showPayModal.balance || showPayModal.totalAmount)} processed.`);
      setShowPayModal(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handlePlanSave = () => {
    if (activeSub) {
      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      if (selectedPlan && extraSeats < selectedPlan.minQuantity) {
        setToast(`Plan "${selectedPlan.name}" requires a minimum of ${selectedPlan.minQuantity} seats.`);
        setTimeout(() => setToast(null), 3500);
        return;
      }

      const newPlanName = selectedPlan?.name || activeSub.planName;
      const basePrice = (selectedPlan?.price || 990000) * 12;
      const seatCost = extraSeats * 36000; // ₹360/seat in integer paise
      const newTotal = basePrice + seatCost;

      updateSubscription({
        ...activeSub,
        planId: selectedPlanId,
        planName: newPlanName,
        lines: [
          { id: 'sl-base', productId: 'prod-platform', item: `${newPlanName} Platform Access`, amount: basePrice },
          { id: 'sl-seats', productId: 'prod-seats', item: `Usage seats (${extraSeats} seats)`, amount: seatCost, quantity: extraSeats },
        ],
        totalAmount: newTotal,
        subtotal: newTotal,
      });
      setShowManagePlanModal(false);
      setToast(`Plan updated to ${newPlanName}.`);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Your Brightloop account</h1>
          <p className="text-xs text-slate-500 mt-0.5">{customerCompany}</p>
        </div>

        <div className="text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs inline-flex items-center gap-1.5 self-start sm:self-auto font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>You’re seeing {customerCompany}ʼs billing only.</span>
        </div>
      </div>

      {/* Main Grid: Plan & Invoices (Left 8 cols) vs Payment Method & Support (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Plan Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                  Your Current Plan
                </span>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {activeSub?.planName || 'Growth'} plan
                  </h2>
                  <StatusBadge status="Active" />
                  <StatusBadge status="Paid" />
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                  Next Renewal
                </span>
                <div className="text-sm font-semibold text-slate-900">
                  {activeSub?.renewalDate || '31 Oct 2026'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Renews at{' '}
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatINR(activeSub?.totalAmount || 124000)}
                  </span>{' '}
                  / year
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowManagePlanModal(true)}
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] transition-colors shadow-2xs"
              >
                Manage plan
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Invoices & Statements
              </h3>
              <span className="text-[11px] text-slate-400">{customerInvoices.length} invoices</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                    <th className="py-2.5 px-3">Invoice</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerInvoices.map((inv) => {
                    const isOverdue = inv.status === 'Overdue';
                    const isPending = inv.status === 'Confirmed' || inv.status === 'Draft';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{inv.dueDate}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                          {formatINR(inv.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isOverdue || (isPending && inv.balance > 0) ? (
                            <button
                              onClick={() => setShowPayModal(inv)}
                              className="px-2.5 py-1 bg-[#F4BA28] text-slate-950 rounded text-xs font-semibold hover:bg-[#E5A817] transition-colors"
                            >
                              Pay now
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-slate-600">
                              <button
                                onClick={() => setSelectedInvoiceForPrint(inv)}
                                className="hover:text-[#0C3430] font-medium"
                              >
                                View
                              </button>
                              <span className="text-slate-300">·</span>
                              <button
                                onClick={() => setSelectedInvoiceForPrint(inv)}
                                className="hover:text-[#0C3430] font-medium"
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Method & Support */}
        <div className="lg:col-span-4 space-y-5">
          {/* Payment Method */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Payment Method
            </span>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-slate-800 block">
                  VISA ···· {cardLast4}
                </span>
                <span className="text-[10px] text-slate-400">Expires {cardExp}</span>
              </div>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>

            <button
              onClick={() => setShowUpdatePaymentModal(true)}
              className="w-full py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded transition-colors text-center"
            >
              Update payment method
            </button>
          </div>

          {/* Support Panel */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Support
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Need assistance with billing, invoice adjustments or plan migration?
            </p>

            {supportMessageSent ? (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                Support request sent. Our team will contact you shortly.
              </div>
            ) : (
              <button
                onClick={() => setSupportMessageSent(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0C3430] hover:underline pt-1"
              >
                <span>Contact support</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manage Plan Modal */}
      {showManagePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs">
            <h3 className="text-sm font-semibold text-slate-900">Manage Subscription Plan</h3>

            <div className="space-y-3 pt-1">
              <label className="font-medium text-slate-700 block">Select Plan Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-2.5 rounded border text-center transition-all ${
                      selectedPlanId === p.id
                        ? 'border-[#0C3430] bg-slate-50 font-semibold text-[#0C3430]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{formatINR(p.price)}/mo</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Team Usage Seats: {extraSeats}
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={extraSeats}
                  onChange={(e) => setExtraSeats(Number(e.target.value))}
                  className="w-full accent-[#0C3430]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowManagePlanModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePlanSave}
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 rounded font-semibold hover:bg-[#E5A817]"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handlePayInvoice}
            className="bg-white rounded-lg max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Pay Invoice</h3>
                <span className="font-mono text-slate-500 text-[11px]">
                  {showPayModal.invoiceNumber}
                </span>
              </div>
              <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                {formatINR(showPayModal.balance || showPayModal.totalAmount)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-slate-700 block">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'Card', 'Bank transfer'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayMethod(m)}
                    className={`py-1.5 rounded border text-center font-medium ${
                      payMethod === m
                        ? 'bg-[#0C3430] text-white border-[#0C3430]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPayModal(null)}
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

      {/* Update Payment Modal */}
      {showUpdatePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xs w-full p-5 border border-slate-200 shadow-xl space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-slate-900">Update Payment Card</h3>
            <div>
              <label className="font-medium text-slate-700 block mb-1">Card Number</label>
              <input
                type="text"
                placeholder="4242 •••• •••• 9921"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                onChange={(e) => setCardLast4(e.target.value.slice(-4) || '4242')}
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowUpdatePaymentModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUpdatePaymentModal(false);
                  setToast('Card updated successfully.');
                  setTimeout(() => setToast(null), 3000);
                }}
                className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 rounded font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <InvoicePrintModal
        invoice={selectedInvoiceForPrint}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />
    </div>
  );
};
