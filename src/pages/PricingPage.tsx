import React, { useState } from 'react';
import {
  Check,
  ArrowRight,
  Shield,
  HelpCircle,
  Building,
  CreditCard,
  Lock,
} from 'lucide-react';
import { BrightloopLogo } from '../components/common/BrightloopLogo';
import { Currency, formatINR } from '../components/common/Currency';
import { AppPage } from '../components/common/Sidebar';

interface PricingPageProps {
  onNavigate: (page: AppPage) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const starterPrice = isAnnual ? 2074 : 2499;
  const growthPrice = isAnnual ? 8217 : 9900;
  const scalePrice = isAnnual ? 20667 : 24900;

  return (
    <div className="min-h-screen bg-[#F8F9F8] text-slate-900 selection:bg-[#F4BA28]/30">
      {/* Public Top Nav matching PDF Page 7 */}
      <nav className="bg-[#0B2E2B] text-white px-6 lg:px-12 py-3 flex items-center justify-between border-b border-[#144743] sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <button onClick={() => onNavigate('landing')} className="focus:outline-hidden">
            <BrightloopLogo variant="light" size="md" />
          </button>
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#B0D0CE]">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-white">
              Product
            </button>
            <button onClick={() => onNavigate('customers')} className="hover:text-white">
              Customers
            </button>
            <button onClick={() => onNavigate('reports')} className="hover:text-white">
              Reports
            </button>
            <button onClick={() => onNavigate('pricing')} className="text-white font-semibold">
              Pricing
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-medium text-white hover:text-[#F4BA28] transition-colors px-2 py-1"
          >
            Log in
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 rounded text-xs font-medium hover:bg-[#E5A817] transition-colors shadow-2xs"
          >
            Start free
          </button>
        </div>
      </nav>

      {/* Main Pricing Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
            Predictable billing plans that scale with subscription count
          </h1>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            Transparent pricing based on active subscriptions managed, with zero transaction fee cuts.
          </p>

          {/* Monthly / Annual Toggle matching PDF Page 7 */}
          <div className="flex items-center gap-3 mt-6">
            <span
              className={`text-xs font-medium cursor-pointer ${
                !isAnnual ? 'text-[#0B2E2B] font-semibold' : 'text-slate-500'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Pay monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-10 h-5 bg-[#0B2E2B] rounded-full p-0.5 relative transition-colors focus:outline-hidden"
              aria-label="Toggle annual billing"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-medium cursor-pointer ${
                isAnnual ? 'text-[#0B2E2B] font-semibold' : 'text-slate-500'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Pay annually
            </span>
            <span className="text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
              Save 17%
            </span>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 items-stretch">
          {/* Card 1: Starter */}
          <div className="bg-white rounded-md border border-slate-200 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Starter</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  For emerging SaaS teams launching their first recurring products.
                </p>
              </div>

              <div className="py-2 border-y border-slate-100">
                <span className="text-2xl sm:text-3xl font-mono font-semibold text-slate-900 tabular-nums">
                  {formatINR(starterPrice)}
                </span>
                <span className="text-xs text-slate-500 ml-1">/month</span>
              </div>

              <div className="text-xs font-mono text-slate-700 font-medium">
                Up to 50 active subscriptions
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Up to 250 invoices /month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Standard bank transfer reconciliation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>GST-compliant printable tax invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>2 internal staff seats</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium rounded transition-colors"
              >
                Select Starter Plan
              </button>
            </div>
          </div>

          {/* Card 2: Growth (MOST POPULAR) */}
          <div className="bg-[#0B2E2B] text-white rounded-md border-2 border-[#F4BA28] p-6 flex flex-col justify-between relative shadow-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F4BA28] text-slate-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded shadow-2xs">
              MOST POPULAR
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">Growth</h2>
                <p className="text-xs text-[#B0D0CE] mt-0.5">
                  For established platforms requiring multi-tier products and automated tax rules.
                </p>
              </div>

              <div className="py-2 border-y border-[#144743]">
                <span className="text-2xl sm:text-3xl font-mono font-semibold text-white tabular-nums">
                  {formatINR(growthPrice)}
                </span>
                <span className="text-xs text-[#B0D0CE] ml-1">/month</span>
              </div>

              <div className="text-xs font-mono text-[#F4BA28] font-medium">
                Up to 500 active subscriptions
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#F4BA28] shrink-0" />
                  <span>Up to 2,500 invoices /month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#F4BA28] shrink-0" />
                  <span>Automated dual GST (CGST+SGST / IGST)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#F4BA28] shrink-0" />
                  <span>Customer self-service portal & payment history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#F4BA28] shrink-0" />
                  <span>10 internal staff seats with RBAC</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-2 bg-[#F4BA28] hover:bg-[#E5A817] text-slate-950 text-xs font-medium rounded transition-colors"
              >
                Select Growth Plan
              </button>
            </div>
          </div>

          {/* Card 3: Scale */}
          <div className="bg-white rounded-md border border-slate-200 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Scale</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  For high-volume operations with custom quotations and custom SLAs.
                </p>
              </div>

              <div className="py-2 border-y border-slate-100">
                <span className="text-2xl sm:text-3xl font-mono font-semibold text-slate-900 tabular-nums">
                  {formatINR(scalePrice)}
                </span>
                <span className="text-xs text-slate-500 ml-1">/month</span>
              </div>

              <div className="text-xs font-mono text-slate-700 font-medium">
                Unlimited subscriptions
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unlimited monthly invoices & billing runs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Intelligent payment reconciliation & dunning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Custom quotation templates & 1-click conversion</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unlimited staff seats & dedicated SLA</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium rounded transition-colors"
              >
                Select Scale Plan
              </button>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-12 bg-white rounded-md border border-slate-200 p-5">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Detailed Feature Comparison
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 uppercase">
                  <th className="py-2.5 w-1/4">Feature</th>
                  <th className="py-2.5 w-1/4">Starter</th>
                  <th className="py-2.5 w-1/4 font-semibold text-[#0B2E2B]">Growth (Popular)</th>
                  <th className="py-2.5 w-1/4">Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 font-medium text-slate-800">Active Subscriptions</td>
                  <td className="py-2 text-slate-600 font-mono">50</td>
                  <td className="py-2 font-medium text-[#0B2E2B] font-mono">500</td>
                  <td className="py-2 text-slate-600 font-mono">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-slate-800">Invoices Included</td>
                  <td className="py-2 text-slate-600 font-mono">250 /mo</td>
                  <td className="py-2 font-medium text-[#0B2E2B] font-mono">2,500 /mo</td>
                  <td className="py-2 text-slate-600 font-mono">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-slate-800">GST Tax Configuration</td>
                  <td className="py-2 text-slate-600">Standard Single Rate</td>
                  <td className="py-2 font-medium text-[#0B2E2B]">Multi-state Dual GST</td>
                  <td className="py-2 text-slate-600">Multi-state + SEZ Exemption</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-slate-800">Customer Portal Access</td>
                  <td className="py-2 text-slate-600">Download-only</td>
                  <td className="py-2 font-medium text-[#0B2E2B]">Self-pay + Invoice History</td>
                  <td className="py-2 text-slate-600">White-label Portal + SSO</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-slate-800">Payment Matching Engine</td>
                  <td className="py-2 text-slate-600">Manual Entry</td>
                  <td className="py-2 font-medium text-[#0B2E2B]">Automated Matching</td>
                  <td className="py-2 text-slate-600">Bank Feed API Reconciliation</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-slate-800">Support Level</td>
                  <td className="py-2 text-slate-600">Email (48h)</td>
                  <td className="py-2 font-medium text-[#0B2E2B]">Priority Email & Chat (12h)</td>
                  <td className="py-2 text-slate-600">Dedicated Account Manager (1h SLA)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Callout Cards: INR note, Overages, Enterprise Security */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-xs">
          <div className="p-4 bg-white rounded border border-slate-200 flex items-start gap-3">
            <span className="font-mono text-base font-semibold text-[#0B2E2B]">₹</span>
            <div>
              <span className="font-semibold text-slate-900 block">INR Standard Billing</span>
              <span className="text-[11px] text-slate-500">
                All charges settled in Indian Rupees with statutory GST tax breakdown.
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded border border-slate-200 flex items-start gap-3">
            <Shield className="w-4 h-4 text-[#0B2E2B] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">No Hidden Revenue Take</span>
              <span className="text-[11px] text-slate-500">
                We never take a percentage cut of your transaction volume. Pure SaaS subscription pricing.
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded border border-slate-200 flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#0B2E2B] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">Enterprise Security Guarantee</span>
              <span className="text-[11px] text-slate-500">
                Role-based access controls, tenant isolation, and audit trails included across all tiers.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
