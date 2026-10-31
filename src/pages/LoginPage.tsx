import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { BrightloopLogo } from '../components/common/BrightloopLogo';
import { useBilling } from '../context/BillingContext';
import { AppPage } from '../components/common/Sidebar';

interface LoginPageProps {
  onNavigate: (page: AppPage) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, requestPasswordReset, resetPassword, validatePassword } = useBilling();

  const [authView, setAuthView] = useState<'login' | 'reset-request' | 'reset-sent'>('login');
  const [email, setEmail] = useState('anika@brightloop.com');
  const [password, setPassword] = useState('Admin@Brightloop2026!');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPasswordVal, setNewPasswordVal] = useState('NewSecure@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = login(email, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      return;
    }

    // Role-based routing
    if (email.includes('northwind') || email.includes('customer')) {
      onNavigate('customer-portal');
    } else {
      onNavigate('dashboard');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    const res = requestPasswordReset(email);
    if (res.token) {
      setResetToken(res.token);
    }
    setAuthView('reset-sent');
  };

  const handleConfirmReset = () => {
    setErrorMsg(null);
    const pwCheck = validatePassword(newPasswordVal);
    if (!pwCheck.valid) {
      setErrorMsg('New password must be more than 8 characters with uppercase, lowercase, and special character.');
      return;
    }

    const res = resetPassword(resetToken, newPasswordVal);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to reset password. Link may be expired.');
      return;
    }

    setAuthView('login');
    setPassword(newPasswordVal);
    setResetSuccess('Password reset successfully! You can now log in.');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F8F9F8]">
      {/* Left Branding Panel matching PDF Page 9 */}
      <div className="lg:col-span-5 bg-[#0B2E2B] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between border-r border-[#144743]">
        <div>
          <button
            onClick={() => onNavigate('landing')}
            className="text-left focus:outline-hidden mb-12 block"
          >
            <BrightloopLogo variant="light" size="md" />
          </button>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug max-w-sm">
            Billing that closes the loop.
          </h1>
          <p className="text-xs text-[#B0D0CE] mt-2 max-w-xs leading-relaxed">
            Eliminate revenue leakage, automate multi-tier subscription billing, and reconcile every rupee seamlessly.
          </p>
        </div>

        {/* Quick Demo Switcher on left */}
        <div className="pt-8 border-t border-[#144743] space-y-2 text-xs">
          <span className="text-[10px] uppercase font-mono font-medium text-[#7EAAA6] tracking-wider block">
            Demo Persona Quick Sign-in
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setEmail('anika@brightloop.com');
                setPassword('Admin@Brightloop2026!');
              }}
              className="px-2.5 py-1.5 bg-[#082321] hover:bg-[#144743] border border-[#144743] text-slate-200 hover:text-white rounded text-[11px] text-left transition-colors font-mono truncate"
            >
              Anika (Admin)
            </button>
            <button
              onClick={() => {
                setEmail('neha@brightloop.com');
                setPassword('Staff@Brightloop2026!');
              }}
              className="px-2.5 py-1.5 bg-[#082321] hover:bg-[#144743] border border-[#144743] text-slate-200 hover:text-white rounded text-[11px] text-left transition-colors font-mono truncate"
            >
              Neha (Staff)
            </button>
            <button
              onClick={() => {
                setEmail('billing@northwindtraders.com');
                setPassword('Customer@Northwind2026!');
              }}
              className="col-span-2 px-2.5 py-1.5 bg-[#082321] hover:bg-[#144743] border border-[#144743] text-slate-200 hover:text-white rounded text-[11px] text-left transition-colors font-mono"
            >
              Neil Thomas (Customer: Northwind Traders)
            </button>
          </div>
        </div>
      </div>

      {/* Right Authentication States Panel */}
      <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-lg mx-auto w-full">
        {/* STATE 1: Welcome Back (Login) */}
        {authView === 'login' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Welcome back<span className="text-[#F4BA28]">.</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Sign in to manage your billing ledger and subscriptions.</p>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              {/* Email */}
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Email address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded font-mono text-slate-800 text-xs focus:outline-hidden focus:border-[#0B2E2B]"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAuthView('reset-request');
                    }}
                    className="text-[11px] text-slate-500 hover:text-[#0B2E2B] underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-1.5 bg-white border border-slate-200 rounded font-mono text-slate-800 text-xs focus:outline-hidden focus:border-[#0B2E2B]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Yellow Log in button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#F4BA28] hover:bg-[#E5A817] text-slate-950 font-medium text-xs rounded transition-colors shadow-2xs"
                >
                  Log in
                </button>
              </div>

              {/* SSO Divider */}
              <div className="pt-2 text-center">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-400">or continue with corporate SSO</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </div>
            </form>

            {/* Invoices Matched 99.98% Card matching PDF Page 9 */}
            <div className="p-3 bg-white border border-slate-200 rounded-md flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#0B2E2B] text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#F4BA28]" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Automatic Reconciliation Rate</span>
                <div className="text-base font-mono font-semibold text-slate-900 tabular-nums">99.98%</div>
                <span className="text-[10px] text-emerald-700 font-medium block">
                  Zero manual invoice chasing required
                </span>
              </div>
            </div>

            {/* Link to Register */}
            <div className="text-center text-xs text-slate-500 pt-2">
              Don't have an account yet?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-medium text-[#0B2E2B] hover:underline"
              >
                Create one now
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: Reset your password matching PDF Page 9 */}
        {authView === 'reset-request' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Reset your password<span className="text-[#F4BA28]">.</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enter your work email address to receive password reset instructions.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Work email address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded font-mono text-slate-800 text-xs focus:outline-hidden focus:border-[#0B2E2B]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#F4BA28] hover:bg-[#E5A817] text-slate-950 font-medium text-xs rounded transition-colors"
              >
                Send reset link
              </button>
            </form>

            <button
              onClick={() => {
                setErrorMsg(null);
                setAuthView('login');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0B2E2B] font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to log in</span>
            </button>
          </div>
        )}

        {/* STATE 3: Reset link sent matching PDF Page 9 */}
        {authView === 'reset-sent' && (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                Reset link sent<span className="text-[#F4BA28]">.</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xs mx-auto">
                Check your inbox at <span className="font-mono font-medium text-slate-900">{email}</span> for the recovery link.
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded text-xs text-slate-600 text-left space-y-2">
              <div className="font-medium text-slate-800">Simulate Password Reset:</div>
              {errorMsg && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-800 rounded text-[11px]">
                  {errorMsg}
                </div>
              )}
              <input
                type="password"
                placeholder="New Password (min 8 chars, Aa1@)"
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleConfirmReset}
                className="w-full py-1.5 bg-[#0B2E2B] text-white font-medium rounded text-xs hover:bg-[#154442] transition-colors"
              >
                Update Password & Return to Login
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setAuthView('login')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0B2E2B] font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to log in</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
