import React, { useState } from 'react';
import {
  Percent,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Calculator,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { DiscountTaxRule } from '../types';
import { formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';

export const DiscountsTaxesPage: React.FC = () => {
  const { rules, createRule, updateRule, deleteRule } = useBilling();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<string | null>('rule-odoo-discount');

  // Form states
  const [ruleName, setRuleName] = useState('Odoo brand variant +560');
  const [appliesTo, setAppliesTo] = useState<'Products' | 'Subscriptions' | 'Total Invoice'>('Products');
  const [type, setType] = useState<'Discount' | 'Tax'>('Discount');
  const [valueMode, setValueMode] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [value, setValue] = useState(15);
  const [effectiveFrom, setEffectiveFrom] = useState('2024-05-01');
  const [usageLimitType, setUsageLimitType] = useState<'Unlimited' | 'Limited'>('Unlimited');
  const [limitCount, setLimitCount] = useState<number>(50);
  const [toast, setToast] = useState<string | null>(null);

  const basePlatform = 1000000; // ₹10,000.00 in integer paise
  let previewDiscount = 0;
  if (type === 'Discount') {
    previewDiscount = valueMode === 'Percentage' ? Math.round((basePlatform * value) / 100) : value * 100;
  } else {
    previewDiscount = 150000;
  }
  const taxableAmount = Math.max(0, basePlatform - previewDiscount);
  let previewTax = 0;
  if (type === 'Tax') {
    previewTax = valueMode === 'Percentage' ? Math.round((taxableAmount * value) / 100) : value * 100;
  } else {
    previewTax = Math.round(taxableAmount * 0.18);
  }
  const previewTotal = taxableAmount + previewTax;

  const handleSelectRuleForEdit = (rule: DiscountTaxRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setAppliesTo(rule.appliesTo);
    setType(rule.type);
    setValueMode(rule.valueMode);
    setValue(rule.value);
    setEffectiveFrom(rule.effectiveFrom);
    if (rule.usageLimit === null) {
      setUsageLimitType('Unlimited');
    } else {
      setUsageLimitType('Limited');
      setLimitCount(rule.usageLimit);
    }
  };

  const handleNewRule = () => {
    setEditingRuleId(null);
    setRuleName('Annual prepayment discount');
    setAppliesTo('Subscriptions');
    setType('Discount');
    setValueMode('Percentage');
    setValue(10);
    setEffectiveFrom(new Date().toISOString().split('T')[0]);
    setUsageLimitType('Unlimited');
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    if (editingRuleId) {
      const existing = rules.find((r) => r.id === editingRuleId);
      if (existing) {
        updateRule({
          ...existing,
          name: ruleName,
          appliesTo,
          type,
          valueMode,
          value,
          effectiveFrom,
          usageLimit: usageLimitType === 'Unlimited' ? null : limitCount,
        });
        setToast(`Rule "${ruleName}" updated.`);
      }
    } else {
      const created = createRule({
        name: ruleName,
        appliesTo,
        type,
        valueMode,
        value,
        effectiveFrom,
        usageLimit: usageLimitType === 'Unlimited' ? null : limitCount,
        status: 'Active',
      });
      setEditingRuleId(created.id);
      setToast(`Rule "${ruleName}" created.`);
    }

    setTimeout(() => setToast(null), 3000);
  };

  const filteredRules = rules.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {toast && (
        <div className="toast-enter bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between">
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
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Discounts & Taxes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Rules that apply once, correctly.</p>
        </div>

        <button
          onClick={handleNewRule}
          className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] shadow-2xs flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New rule</span>
        </button>
      </div>

      {/* Main Grid: Left Rules Table (7 cols) vs Right Form & Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Rules Table */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2.5">
            <span className="text-xs font-semibold text-slate-900">Configured Rules</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules..."
                className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden w-40"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                  <th className="py-2.5 px-3">Rule Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Usage</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRules.map((rule) => {
                  const isSelected = rule.id === editingRuleId;
                  const isLimited = rule.usageLimit !== null;
                  const usageDisplay = isLimited
                    ? `${Math.max(0, (rule.usageLimit || 0) - rule.usedCount)} remaining`
                    : 'Unlimited';

                  return (
                    <tr
                      key={rule.id}
                      onClick={() => handleSelectRuleForEdit(rule)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-50/90 font-medium' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-900 font-medium">{rule.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{rule.type}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                        {rule.valueMode === 'Percentage' ? `${rule.value}%` : `₹${rule.value}`}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{usageDisplay}</td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={isLimited ? 'Limited' : rule.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRule(rule.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Form & Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3.5 text-xs">
            <h2 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
              {editingRuleId ? 'Edit Rule' : 'Create Rule'}
            </h2>

            <form onSubmit={handleSaveRule} className="space-y-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Rule name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Applies to</label>
                  <select
                    value={appliesTo}
                    onChange={(e) => setAppliesTo(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="Products">Products</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Total Invoice">Total Invoice</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="Discount">Discount</option>
                    <option value="Tax">Tax</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Value</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={valueMode}
                    onChange={(e) => setValueMode(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-medium text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Effective from</label>
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Usage limit</label>
                  <select
                    value={usageLimitType}
                    onChange={(e) => setUsageLimitType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="Unlimited">Unlimited</option>
                    <option value="Limited">Set limit</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#F4BA28] text-slate-950 font-semibold rounded hover:bg-[#E5A817] transition-colors shadow-2xs"
                >
                  Save rule
                </button>
              </div>
            </form>
          </div>

          {/* Live Calculation Preview */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-900">Live calculation preview</span>
              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                SUB-0042
              </span>
            </div>

            <div className="space-y-1.5 divide-y divide-slate-100">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Base Platform</span>
                <span className="font-mono font-medium tabular-nums">{formatINR(basePlatform)}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-800">
                <span>
                  {ruleName} ({value}% off)
                </span>
                <span className="font-mono font-medium tabular-nums">–{formatINR(previewDiscount)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>GST (18%)</span>
                <span className="font-mono font-medium tabular-nums">{formatINR(previewTax)}</span>
              </div>
              <div className="flex justify-between pt-2 font-semibold text-slate-900">
                <span>Effective Invoice Total</span>
                <span className="font-mono text-sm font-bold text-[#0C3430] tabular-nums">
                  {formatINR(previewTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
