import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  Shield,
  FileText,
  Save,
  Check,
  Globe,
  Landmark,
  AlertCircle,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData, currentUser } = useBilling();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [gstin, setGstin] = useState(settings.gstin);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [billingAddress, setBillingAddress] = useState(settings.billingAddress);
  const [bankName, setBankName] = useState(settings.bankName);
  const [accountNumber, setAccountNumber] = useState(settings.accountNumber);
  const [ifsc, setIfsc] = useState(settings.ifsc);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [autoDunning, setAutoDunning] = useState(settings.autoDunning);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if settings change
  useEffect(() => {
    setCompanyName(settings.companyName);
    setGstin(settings.gstin);
    setSupportEmail(settings.supportEmail);
    setBillingAddress(settings.billingAddress);
    setBankName(settings.bankName);
    setAccountNumber(settings.accountNumber);
    setIfsc(settings.ifsc);
    setUpiId(settings.upiId);
    setAutoDunning(settings.autoDunning);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = updateSettings({
      companyName,
      gstin: gstin.trim().toUpperCase(),
      supportEmail,
      billingAddress,
      baseCurrency: 'INR',
      bankName,
      accountNumber,
      ifsc: ifsc.trim().toUpperCase(),
      upiId,
      autoDunning,
    });

    if (res.success) {
      setToast('Organization and billing preferences saved successfully.');
      setTimeout(() => setToast(null), 3500);
    } else {
      setErrorMsg(res.error || 'Failed to save settings.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to the clean initial benchmark state?')) {
      resetToDefaultData();
      setToast('Demo data reset to clean initial state.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {toast && (
        <div className="toast-enter bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="toast-enter p-2.5 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Organization & Billing Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage legal entity identification, GST compliance, bank settlement routes, and automated billing engine parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Legal Entity & Tax Profile */}
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-4 space-y-1">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Legal Entity & GST Profile
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Appears on all printed GST tax invoices, customer portals, and settlement receipts.
              </p>
            </div>

            <div className="md:col-span-8 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Registered Business Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">GSTIN (15-character Tax ID)</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    maxLength={15}
                    placeholder="27AABCB9876C1Z4"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-medium uppercase focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Statutory 15-character alphanumeric GSTIN</span>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Billing Support Contact</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Registered Address</label>
                <input
                  type="text"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Base Ledger Currency</label>
                <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-600 cursor-not-allowed">
                  INR (₹) — Indian Rupee (Default standard for GST compliance)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Bank Settlement Details */}
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-4 space-y-1">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Bank Settlement & UPI
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct wire transfer coordinates rendered on invoice footers and customer payment links.
              </p>
            </div>

            <div className="md:col-span-8 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Beneficiary Bank & Branch</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    placeholder="HDFC0000123"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-medium uppercase focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">UPI VPA Handle</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="brightloop@hdfcbank"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Billing Cadence & Automation */}
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-4 space-y-1">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Automation & Reconciliation
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rules governing duplicate invoice prevention, grace periods, and dunning notifications.
              </p>
            </div>

            <div className="md:col-span-8 space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDunning}
                  onChange={(e) => setAutoDunning(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#0B2E2B] focus:ring-0"
                />
                <div>
                  <span className="font-medium text-slate-900 block">Automatic Overdue Dunning</span>
                  <span className="text-slate-500 text-[11px]">
                    Automatically transitions confirmed past-due invoices to Overdue and triggers collection notices.
                  </span>
                </div>
              </label>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900 block">Duplicate Billing Safeguard</span>
                  <span className="text-slate-500 text-[11px]">
                    Guarantees exactly one invoice per subscription per billing cycle period.
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono text-[10px]">
                  Enforced
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Data Reset & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-700 bg-white hover:bg-red-50 text-xs font-medium rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Records</span>
          </button>

          <button
            type="submit"
            className="px-4 py-1.5 bg-[#F4BA28] text-slate-950 font-medium text-xs rounded hover:bg-[#E5A817] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
