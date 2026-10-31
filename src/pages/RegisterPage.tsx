import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Shield,
  Check,
} from 'lucide-react';
import { BrightloopLogo } from '../components/common/BrightloopLogo';
import { useBilling } from '../context/BillingContext';
import { AppPage } from '../components/common/Sidebar';
import { formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';

interface RegisterPageProps {
  onNavigate: (page: AppPage) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, validatePassword } = useBilling();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pwValidation = validatePassword(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !fullName || !company || !password) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    if (!pwValidation.valid) {
      setErrorMessage('Please ensure your password satisfies all security criteria.');
      return;
    }

    const res = register(fullName, email, company, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
      return;
    }

    // Success -> redirect to admin dashboard
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F8F9F8]">
      {/* Left Column: Deep Teal Registration Form matching PDF Page 8 */}
      <div className="lg:col-span-5 bg-[#0B2E2B] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between border-r border-[#144743]">
        <div>
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="text-left focus:outline-hidden mb-10 block"
          >
            <BrightloopLogo variant="light" size="md" />
          </button>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Set up billing you can trust.
            </h1>
            <p className="text-xs text-[#B0D0CE] mt-1.5 leading-relaxed">
              Automate multi-tier subscriptions, calculate dual GST, and reconcile payments in one audit-ready ledger.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {errorMessage && (
              <div className="p-2.5 bg-red-950/80 border border-red-500/50 text-red-200 rounded text-xs">
                {errorMessage}
              </div>
            )}

            {/* Work email */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-1.5 bg-white text-slate-900 rounded border border-transparent placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#F4BA28] text-xs font-mono"
                required
              />
            </div>

            {/* Full name */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Anika Sharma"
                className="w-full px-3 py-1.5 bg-white text-slate-900 rounded border border-transparent placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#F4BA28] text-xs"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Company legal name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Technologies Pvt. Ltd."
                className="w-full px-3 py-1.5 bg-white text-slate-900 rounded border border-transparent placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#F4BA28] text-xs"
                required
              />
            </div>

            {/* Password with eye toggle */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">Secure Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars, 1 uppercase, 1 symbol"
                  className="w-full px-3 py-1.5 bg-white text-slate-900 rounded border border-transparent placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#F4BA28] text-xs font-mono pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>
            </div>

            {/* Interactive Password Requirements Checklist matching PDF Page 8 */}
            <div className="p-2 bg-[#082321] rounded border border-[#144743] space-y-1 text-slate-300 text-[11px]">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Password Requirements:</div>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1.5">
                  <span className={pwValidation.hasLength ? 'text-emerald-400' : 'text-slate-500'}>
                    {pwValidation.hasLength ? '✓' : '•'}
                  </span>
                  <span className={pwValidation.hasLength ? 'text-emerald-300' : 'text-slate-400'}>
                    8+ characters
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={pwValidation.hasUpper ? 'text-emerald-400' : 'text-slate-500'}>
                    {pwValidation.hasUpper ? '✓' : '•'}
                  </span>
                  <span className={pwValidation.hasUpper ? 'text-emerald-300' : 'text-slate-400'}>
                    Uppercase
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={pwValidation.hasLower ? 'text-emerald-400' : 'text-slate-500'}>
                    {pwValidation.hasLower ? '✓' : '•'}
                  </span>
                  <span className={pwValidation.hasLower ? 'text-emerald-300' : 'text-slate-400'}>
                    Lowercase
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={pwValidation.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}>
                    {pwValidation.hasSpecial ? '✓' : '•'}
                  </span>
                  <span className={pwValidation.hasSpecial ? 'text-emerald-300' : 'text-slate-400'}>
                    Special (!@#$)
                  </span>
                </div>
              </div>
            </div>

            {/* Yellow Create account button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!pwValidation.valid}
                className="w-full py-2 bg-[#F4BA28] hover:bg-[#E5A817] text-slate-950 rounded text-xs font-medium transition-colors disabled:opacity-50"
              >
                Create Account & Launch Platform
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center pt-1">
              By creating an account, you agree to Brightloop's{' '}
              <span className="underline cursor-pointer text-slate-300">Terms of Service</span>.
            </p>
          </form>
        </div>

        {/* Existing account login link */}
        <div className="pt-6 text-center text-xs text-slate-300 border-t border-[#144743]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-medium text-[#F4BA28] hover:underline"
          >
            Log in
          </button>
        </div>
      </div>

      {/* Right Column: Clean White Dashboard Preview matching PDF Page 8 */}
      <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-6">
              <span className="font-semibold text-slate-900 text-xs">Brightloop Billing Ledger Preview</span>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
                <span className="text-[#0B2E2B] font-medium">Overview</span>
                <span>Subscriptions</span>
                <span>Invoices</span>
                <span>Reconciliation</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Live Workspace
            </div>
          </div>

          {/* Unified Metric Strip matching PDF Page 8 */}
          <div className="bg-white border border-slate-200 rounded-md grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden">
            <div className="p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Active Subscriptions
              </span>
              <div className="text-2xl font-mono font-semibold text-slate-900 mt-1">248</div>
              <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block">
                +12% vs previous cycle
              </span>
            </div>

            <div className="p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Current MRR
              </span>
              <div className="text-2xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
                ₹18,42,500
              </div>
              <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block">
                92.5% collected
              </span>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-1">
                <span>MRR Trend</span>
                <span>6M</span>
              </div>
              <div className="h-8 flex items-end justify-between gap-1 pt-1">
                <div className="w-full h-3 bg-slate-100 rounded-xs" />
                <div className="w-full h-4 bg-slate-100 rounded-xs" />
                <div className="w-full h-5 bg-slate-200 rounded-xs" />
                <div className="w-full h-6 bg-slate-200 rounded-xs" />
                <div className="w-full h-7 bg-emerald-600 rounded-xs" />
                <div className="w-full h-8 bg-[#0B2E2B] rounded-xs" />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
              </div>
            </div>
          </div>

          {/* Invoice Status Table Preview */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="py-2 px-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800">
                Recent Invoice Ledger
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Oct 2026</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium text-[10px] uppercase bg-slate-50/75">
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Invoice</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-right">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-800">
                      Northwind Traders
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">INV-2026-0187</td>
                    <td className="py-2 px-3 text-right tabular-nums font-mono font-medium text-slate-900">
                      ₹1,24,000
                    </td>
                    <td className="py-2 px-3 text-center">
                      <StatusBadge status="Paid" />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500 text-[11px]">31 Oct 2026</td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-800">
                      Acme Retail Corp
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">INV-2026-0188</td>
                    <td className="py-2 px-3 text-right tabular-nums font-mono font-medium text-slate-900">
                      ₹86,500
                    </td>
                    <td className="py-2 px-3 text-center">
                      <StatusBadge status="Pending" />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500 text-[11px]">28 Oct 2026</td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-800">
                      Zenith Scientific Labs
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">INV-2026-0189</td>
                    <td className="py-2 px-3 text-right tabular-nums font-mono font-medium text-slate-900">
                      ₹2,18,750
                    </td>
                    <td className="py-2 px-3 text-center">
                      <StatusBadge status="Paid" />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500 text-[11px]">31 Oct 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom system status bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 border-t border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span className="font-medium text-slate-700">All billing pipelines operational</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-400 text-[10px]">
            <span>Audit sync: 31 Oct 2026, 18:30 IST</span>
            <RefreshCw className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
