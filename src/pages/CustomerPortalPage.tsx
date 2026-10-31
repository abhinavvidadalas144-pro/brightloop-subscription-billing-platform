import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Eye,
  HelpCircle,
  Calendar,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Layers,
  FileText,
  Building,
  Settings,
  Mail,
  Phone,
  User,
  Sliders,
  AlertCircle,
  Receipt,
  Search,
  Filter,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoicePrintModal } from '../components/common/InvoicePrintModal';
import { Invoice, PaymentRecord } from '../types';
import { CustomerPortalTab } from '../components/common/Sidebar';

interface CustomerPortalPageProps {
  activeTab?: CustomerPortalTab;
  onTabChange?: (tab: CustomerPortalTab) => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({
  activeTab: externalActiveTab,
  onTabChange,
}) => {
  const {
    currentUser,
    customers,
    subscriptions,
    invoices,
    payments,
    plans,
    recordPayment,
    updateSubscription,
    updateCustomer,
  } = useBilling();

  const [activeTab, setActiveTab] = useState<CustomerPortalTab>(externalActiveTab || 'overview');

  useEffect(() => {
    if (externalActiveTab && externalActiveTab !== activeTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  const handleTabClick = (tab: CustomerPortalTab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

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
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  const customerId = currentUser.customerId || 'cust-northwind';
  const customerCompany = currentUser.company || 'Northwind Traders';

  const customerRecord = customers.find((c) => c.id === customerId) || {
    id: customerId,
    name: customerCompany,
    contactPerson: currentUser.name,
    email: currentUser.email,
    phone: '+91 98450 11223',
    address: '42 Commercial Street, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    gstin: '29ABCDE1234F1Z5',
    paymentMethod: {
      type: 'Card' as const,
      brand: 'VISA',
      last4: '4242',
      expiry: '06/28',
    },
    createdAt: '2026-01-15',
  };

  // Account Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    name: customerRecord.name,
    contactPerson: customerRecord.contactPerson,
    email: customerRecord.email,
    phone: customerRecord.phone || '+91 98450 11223',
    address: customerRecord.address || '42 Commercial Street, Indiranagar',
    city: customerRecord.city,
    state: customerRecord.state,
    gstin: customerRecord.gstin || '',
    billingEmailNotifications: true,
    smsPaymentAlerts: true,
  });

  const customerSubs = subscriptions.filter(
    (s) => s.customerId === customerId || s.customerName.toLowerCase().includes(customerCompany.toLowerCase())
  );
  const activeSub = customerSubs.find((s) => s.status === 'Active') || customerSubs[0] || subscriptions[0];

  const customerInvoices = invoices.filter(
    (i) => i.customerId === customerId || i.customerName.toLowerCase().includes(customerCompany.toLowerCase())
  );

  const customerInvoiceIds = new Set(customerInvoices.map((i) => i.id));
  const customerPayments = payments.filter((p) => customerInvoiceIds.has(p.invoiceId));

  const totalOutstandingBalance = customerInvoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
  const totalSettledAmount = customerPayments.reduce((acc, p) => acc + p.amount, 0);

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
      setToast(`Payment of ${formatINR(showPayModal.balance || showPayModal.totalAmount)} processed successfully.`);
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
      const seatCost = extraSeats * 36000;
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
      setToast(`Subscription updated to ${newPlanName} (${extraSeats} seats).`);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateCustomer({
      ...customerRecord,
      name: settingsForm.name,
      contactPerson: settingsForm.contactPerson,
      email: settingsForm.email,
      phone: settingsForm.phone,
      address: settingsForm.address,
      city: settingsForm.city,
      state: settingsForm.state,
      gstin: settingsForm.gstin,
    });

    if (res.success) {
      setToast('Account details and billing preferences updated successfully.');
      setTimeout(() => setToast(null), 3500);
    } else {
      setToast(res.error || 'Failed to update account details.');
      setTimeout(() => setToast(null), 3500);
    }
  };

  const filteredInvoices = customerInvoices.filter((inv) => {
    if (invoiceFilter === 'unpaid' && inv.status !== 'Overdue' && (inv.status !== 'Confirmed' || inv.balance === 0)) {
      return false;
    }
    if (invoiceFilter === 'paid' && inv.status !== 'Paid') {
      return false;
    }
    if (invoiceSearch) {
      const q = invoiceSearch.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.issueDate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="toast-enter bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between">
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
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Customer Billing Portal</h1>
          <p className="text-xs text-slate-500 mt-0.5">{customerCompany}</p>
        </div>

        <div className="text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs inline-flex items-center gap-1.5 self-start sm:self-auto font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>You’re seeing {customerCompany}ʼs billing only.</span>
        </div>
      </div>

      {/* Horizontal Portal Tabs: Overview, My Plan, Invoices, Payments, Account Settings */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-medium select-none">
        {[
          { id: 'overview' as CustomerPortalTab, label: 'Overview' },
          { id: 'plan' as CustomerPortalTab, label: 'My Plan' },
          { id: 'invoices' as CustomerPortalTab, label: 'Invoices' },
          { id: 'payments' as CustomerPortalTab, label: 'Payments' },
          { id: 'settings' as CustomerPortalTab, label: 'Account Settings' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#0B2E2B] text-[#0B2E2B] font-semibold bg-white rounded-t'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div key="overview" className="page-enter space-y-5">
          {/* Top Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Current Plan
              </span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {activeSub?.planName || 'Growth'} Plan
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Active & In Good Standing</div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Next Renewal
              </span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {activeSub?.renewalDate || '31 Oct 2026'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {formatINR(activeSub?.totalAmount || 124000)} / yr
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Unpaid Balance
              </span>
              <div className={`text-base font-bold mt-0.5 ${totalOutstandingBalance > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {formatINR(totalOutstandingBalance)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {customerInvoices.filter((i) => i.balance > 0).length} invoice(s) pending
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Total Paid to Date
              </span>
              <div className="text-base font-bold text-emerald-700 mt-0.5">
                {formatINR(totalSettledAmount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {customerPayments.length} recorded payments
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 8 cols: Main Plan Card & Invoices Preview */}
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                      Active Contract
                    </span>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {activeSub?.planName || 'Growth'} plan
                      </h2>
                      <StatusBadge status="Active" />
                      <StatusBadge status="Paid" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Subscription ID: <span className="font-mono">{activeSub?.id || 'sub-acme-growth'}</span>
                    </p>
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

                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => handleTabClick('plan')}
                    className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] transition-colors shadow-2xs"
                  >
                    Manage plan & seats
                  </button>
                </div>
              </div>

              {/* Recent Invoices Table Preview */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Recent Invoices
                  </h3>
                  <button
                    onClick={() => handleTabClick('invoices')}
                    className="text-[11px] text-[#0B2E2B] font-semibold hover:underline"
                  >
                    View all ({customerInvoices.length})
                  </button>
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
                      {customerInvoices.slice(0, 4).map((inv) => {
                        const isOverdue = inv.status === 'Overdue';
                        const isPending = (inv.status === 'Confirmed' || inv.status === 'Draft') && inv.balance > 0;

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
                              {isOverdue || isPending ? (
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

            {/* Right 4 cols: Payment Method & Support */}
            <div className="lg:col-span-4 space-y-5">
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

              {/* Support Card */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Billing Assistance
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Need assistance with invoice adjustments, GST details, or billing frequency?
                </p>

                {supportMessageSent ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                    Support request logged. A billing specialist will contact you today.
                  </div>
                ) : (
                  <button
                    onClick={() => setSupportMessageSent(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0C3430] hover:underline pt-1"
                  >
                    <span>Contact billing support</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PLAN */}
      {activeTab === 'plan' && (
        <div key="plan" className="page-enter space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Subscription Plan & Team Usage</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your current tier, change plan options, and configure team usage seats.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0B2E2B] bg-teal-50/50 ring-1 ring-[#0B2E2B]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 text-sm">{p.name}</h3>
                      {isSelected && (
                        <span className="text-[10px] bg-[#0B2E2B] text-white px-2 py-0.5 rounded font-mono">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900">
                      {formatINR(p.price)}
                      <span className="text-xs font-normal text-slate-500 font-sans"> / mo</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <div>Minimum seats: {p.minQuantity}</div>
                      <div className="capitalize">Billing: {p.billingFrequency}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Usage Seats Adjustment */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 text-xs block">Team Usage Seats</span>
                  <span className="text-[11px] text-slate-500">Each additional seat is billed at ₹360 / month</span>
                </div>
                <div className="text-sm font-bold font-mono text-[#0B2E2B] bg-white px-3 py-1 rounded border border-slate-200">
                  {extraSeats} Seats
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={extraSeats}
                onChange={(e) => setExtraSeats(Number(e.target.value))}
                className="w-full accent-[#0B2E2B]"
              />
            </div>

            {/* Price Preview & Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-600">
                <span>Estimated Annual Contract: </span>
                <strong className="text-base font-bold text-slate-900 font-mono">
                  {formatINR(
                    ((plans.find((p) => p.id === selectedPlanId)?.price || 990000) + extraSeats * 36000) * 12
                  )}
                </strong>
                <span className="text-[11px] text-slate-400"> (billed annually with GST)</span>
              </div>

              <button
                onClick={handlePlanSave}
                className="px-4 py-2 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded hover:bg-[#E5A817] transition-colors shadow-2xs"
              >
                Apply & Confirm Plan Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVOICES */}
      {activeTab === 'invoices' && (
        <div key="invoices" className="page-enter space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvoiceFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    invoiceFilter === 'all' ? 'bg-[#0B2E2B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({customerInvoices.length})
                </button>
                <button
                  onClick={() => setInvoiceFilter('unpaid')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    invoiceFilter === 'unpaid' ? 'bg-[#0B2E2B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Unpaid / Overdue ({customerInvoices.filter((i) => i.balance > 0).length})
                </button>
                <button
                  onClick={() => setInvoiceFilter('paid')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    invoiceFilter === 'paid' ? 'bg-[#0B2E2B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Paid ({customerInvoices.filter((i) => i.status === 'Paid').length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search invoice number..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Issue Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                    <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No invoices match your selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isUnsettled = inv.balance > 0;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{inv.issueDate}</td>
                          <td className="py-2.5 px-3 text-slate-600">{inv.dueDate}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900 font-mono">
                            {formatINR(inv.totalAmount)}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono ${inv.balance > 0 ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>
                            {formatINR(inv.balance || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            {isUnsettled && (
                              <button
                                onClick={() => setShowPayModal(inv)}
                                className="px-2.5 py-1 bg-[#F4BA28] text-slate-950 font-semibold rounded text-[11px] hover:bg-[#E5A817]"
                              >
                                Pay
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedInvoiceForPrint(inv)}
                              className="px-2 py-1 text-slate-700 hover:text-[#0B2E2B] font-medium text-[11px]"
                            >
                              View / Download
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === 'payments' && (
        <div key="payments" className="page-enter space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Payment History & Receipts
                </h3>
                <span className="text-[11px] text-slate-400">{customerPayments.length} transactions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                      <th className="py-2.5 px-3">Transaction Ref</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No payment transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      customerPayments.map((p) => {
                        const relatedInvoice = customerInvoices.find((i) => i.id === p.invoiceId);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                              {p.referenceNumber}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{p.receivedDate}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                                {p.method}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                              {formatINR(p.amount)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                                Settled
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {relatedInvoice ? (
                                <button
                                  onClick={() => setSelectedInvoiceForPrint(relatedInvoice)}
                                  className="text-[#0B2E2B] font-semibold hover:underline text-[11px]"
                                >
                                  Receipt
                                </button>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Saved Payment Method
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
                className="w-full py-1.5 bg-[#0B2E2B] hover:bg-[#154442] text-white text-xs font-medium rounded transition-colors text-center"
              >
                Change Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNT SETTINGS */}
      {activeTab === 'settings' && (
        <div key="settings" className="page-enter bg-white rounded-lg border border-slate-200 p-6 shadow-2xs max-w-3xl space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Account & Tax Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear on your GST tax invoices and payment receipts.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={settingsForm.gstin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value })}
                  placeholder="29ABCDE1234F1Z5"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Primary Contact Person</label>
                <input
                  type="text"
                  value={settingsForm.contactPerson}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactPerson: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Billing Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Registered Address</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={settingsForm.city}
                  onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={settingsForm.state}
                  onChange={(e) => setSettingsForm({ ...settingsForm, state: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B2E2B] text-white rounded text-xs font-semibold hover:bg-[#154442] transition-colors shadow-2xs"
              >
                Save Account Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs backdrop-fade flex items-center justify-center p-4">
          <div className="modal-enter bg-white rounded-lg max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-slate-900">Settle Invoice</h3>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-mono font-semibold text-slate-800">{showPayModal.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Amount:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatINR(showPayModal.balance || showPayModal.totalAmount)}
                </span>
              </div>
            </div>

            <form onSubmit={handlePayInvoice} className="space-y-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Card', 'Bank transfer'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-1.5 text-center rounded border transition-colors ${
                        payMethod === m ? 'border-[#0B2E2B] bg-teal-50 font-semibold text-[#0B2E2B]' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
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
        </div>
      )}

      {/* Update Card Modal */}
      {showUpdatePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs backdrop-fade flex items-center justify-center p-4">
          <div className="modal-enter bg-white rounded-lg max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs">
            <h3 className="text-sm font-semibold text-slate-900">Update Payment Method</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 •••• •••• 4242"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\s+/g, '');
                    if (val.length >= 4) {
                      setCardLast4(val.slice(-4));
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUpdatePaymentModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpdatePaymentModal(false);
                  setToast(`Payment method updated to VISA ending in ${cardLast4}.`);
                  setTimeout(() => setToast(null), 3500);
                }}
                className="px-3.5 py-1.5 bg-[#0B2E2B] text-white rounded font-medium hover:bg-[#154442]"
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print & Download Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};
