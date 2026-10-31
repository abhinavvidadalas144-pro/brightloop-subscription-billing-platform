import React, { useState } from 'react';
import { CalendarDays, Plus, Edit2, CheckCircle2, Check } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { SubscriptionPlan, BillingFrequency } from '../types';
import { formatINR, paiseToRupees, rupeesToPaise } from '../components/common/Currency';

export const PlansPage: React.FC = () => {
  const { plans, createPlan, updatePlan, currentUser } = useBilling();
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [priceRupees, setPriceRupees] = useState(9900);
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  const [minQuantity, setMinQuantity] = useState(1);
  const [availableFrom, setAvailableFrom] = useState('2024-01-01');
  const [availableTo, setAvailableTo] = useState('');
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenewal, setAllowRenewal] = useState(true);
  const [description, setDescription] = useState('');

  const isAdmin = currentUser.role === 'Admin';

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setName('');
    setPriceRupees(9900);
    setBillingFrequency('monthly');
    setMinQuantity(1);
    setAvailableFrom(new Date().toISOString().split('T')[0]);
    setAvailableTo('');
    setAutoCloseOnEnd(false);
    setAllowEarlyClose(true);
    setAllowPause(true);
    setAllowRenewal(true);
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPriceRupees(paiseToRupees(plan.price));
    setBillingFrequency(plan.billingFrequency);
    setMinQuantity(plan.minQuantity);
    setAvailableFrom(plan.availableFrom);
    setAvailableTo(plan.availableTo || '');
    setAutoCloseOnEnd(plan.autoCloseOnEnd);
    setAllowEarlyClose(plan.allowEarlyClose);
    setAllowPause(plan.allowPause);
    setAllowRenewal(plan.allowRenewal);
    setDescription(plan.description);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const price = rupeesToPaise(priceRupees);

    if (editingPlan) {
      updatePlan({
        ...editingPlan,
        name,
        price,
        billingFrequency,
        minQuantity,
        availableFrom,
        availableTo: availableTo || undefined,
        autoCloseOnEnd,
        allowEarlyClose,
        allowPause,
        allowRenewal,
        description,
      });
      setToast(`Plan "${name}" updated.`);
    } else {
      createPlan({
        name,
        price,
        billingFrequency,
        minQuantity,
        availableFrom,
        availableTo: availableTo || undefined,
        autoCloseOnEnd,
        allowEarlyClose,
        allowPause,
        allowRenewal,
        description,
        features: ['Full API Access', 'Automated Billing', 'Standard Invoicing'],
      });
      setToast(`Plan "${name}" created.`);
    }

    setShowModal(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Subscription Plans</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadence frequencies, min quantities, and lifecycle termination policies.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] shadow-2xs flex items-center gap-1.5 self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create plan</span>
          </button>
        )}
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                <th className="py-2.5 px-3">Plan Name</th>
                <th className="py-2.5 px-3">Billing Cadence</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-center">Min Qty</th>
                <th className="py-2.5 px-3">Policies</th>
                <th className="py-2.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500 max-w-sm truncate mt-0.5">
                      {p.description}
                    </div>
                  </td>
                  <td className="py-3 px-3 capitalize text-slate-700 font-medium">
                    {p.billingFrequency}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900 tabular-nums">
                    {formatINR(p.price)}
                    <span className="text-[10px] text-slate-400">/{p.billingFrequency.slice(0, 2)}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 font-mono">
                    {p.minQuantity}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-600">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {p.autoCloseOnEnd ? 'Auto-close on end' : 'Auto-renew'}
                      </span>
                      {p.allowPause && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          Pause allowed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Plan Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={priceRupees}
                  onChange={(e) => setPriceRupees(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Frequency</label>
                <select
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Min Qty</label>
                <input
                  type="number"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(Number(e.target.value))}
                  min={1}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5 text-[11px]">
              <span className="font-semibold text-slate-700 block">Termination & Renewal Policies</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCloseOnEnd}
                  onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                  className="rounded text-[#0C3430]"
                />
                <span className="text-slate-700">Auto-close subscription when date ends</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPause}
                  onChange={(e) => setAllowPause(e.target.checked)}
                  className="rounded text-[#0C3430]"
                />
                <span className="text-slate-700">Allow temporary pause</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRenewal}
                  onChange={(e) => setAllowRenewal(e.target.checked)}
                  className="rounded text-[#0C3430]"
                />
                <span className="text-slate-700">Enable automatic recurring renewal</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold rounded hover:bg-[#E5A817]"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
