import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Users2,
  FileText,
  Clock,
  Zap,
  TrendingUp,
  Percent,
  Receipt,
  HelpCircle,
  PlayCircle,
  Check,
} from 'lucide-react';
import { BrightloopLogo } from '../components/common/BrightloopLogo';
import { Currency, formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';
import { AppPage } from '../components/common/Sidebar';

interface LandingPageProps {
  onNavigate: (page: AppPage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8F9F8] text-slate-900 selection:bg-[#F4BA28]/30">
      {/* 1. Public Top Navigation Bar as seen in PDF Page 1 */}
      <nav className="bg-[#0B2E2B] text-white px-6 lg:px-12 py-3 flex items-center justify-between border-b border-[#144743] sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <button onClick={() => onNavigate('landing')} className="focus:outline-hidden">
            <BrightloopLogo variant="light" size="md" />
          </button>
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#B0D0CE]">
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-white transition-colors"
            >
              Product
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="hover:text-white transition-colors"
            >
              Compliance
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="hover:text-white transition-colors"
            >
              Finance Reports
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

      {/* 2. Hero Section matching PDF Page 1 */}
      <section className="px-6 lg:px-12 pt-14 pb-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left Copy */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-[#0B2E2B] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Enterprise Subscription Billing & GST Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-slate-900 tracking-tight leading-[1.15]">
              Every invoice goes out on the day it's due.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Brightloop turns sales proposals into active subscriptions, subscriptions into GST-compliant invoices, and payments into verified revenue your finance lead can audit in real time.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 bg-[#F4BA28] text-slate-950 rounded text-xs font-medium hover:bg-[#E5A817] transition-colors shadow-2xs flex items-center gap-2"
              >
                <span>Start 14-day trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[#0B2E2B]" />
                <span>Launch Live Admin Demo</span>
              </button>
            </div>
          </div>

          {/* Hero Right UI Mockup matching PDF Page 1 */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs">Automated Billing Run — October 2026</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Reconciliation progress:</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full w-[92%]" />
                    </div>
                    <span className="font-mono font-medium text-slate-700">92.5%</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('invoices')}
                  className="px-2.5 py-1 bg-[#0B2E2B] text-white rounded text-[11px] font-medium hover:bg-[#154442] transition-colors"
                >
                  View Invoices
                </button>
              </div>

              {/* Table Preview */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-medium text-[11px] border-b border-slate-100">
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Subscription</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 font-medium text-slate-800">Northwind Traders</td>
                      <td className="py-2 text-slate-500 font-mono text-[11px]">SUB-0042</td>
                      <td className="py-2 text-right tabular-nums font-mono font-medium text-slate-900">
                        ₹1,24,000
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-slate-800">Acme Retail Corp</td>
                      <td className="py-2 text-slate-500 font-mono text-[11px]">SUB-0051</td>
                      <td className="py-2 text-right tabular-nums font-mono font-medium text-slate-900">
                        ₹86,500
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-slate-800">Zenith Scientific Labs</td>
                      <td className="py-2 text-slate-500 font-mono text-[11px]">SUB-0063</td>
                      <td className="py-2 text-right tabular-nums font-mono font-medium text-slate-900">
                        ₹2,18,750
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-slate-800">Odoo Enterprise Partner</td>
                      <td className="py-2 text-slate-500 font-mono text-[11px]">SUB-0071</td>
                      <td className="py-2 text-right tabular-nums font-mono font-medium text-slate-900">
                        ₹56,000
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                          Overdue
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Trust Bar matching PDF Page 1 */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-slate-500 text-xs font-medium tracking-wide">
            <span>Northwind Traders</span>
            <span>•</span>
            <span>Acme Retail</span>
            <span>•</span>
            <span>Zenith Labs</span>
            <span>•</span>
            <span>Odoo Partner</span>
            <span>•</span>
            <span>Cyberdyne Logistics</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-base font-semibold text-slate-900 font-mono tabular-nums">₹4.8 Cr</span>
              <span className="text-slate-500 ml-1.5">processed monthly</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <span className="text-base font-semibold text-emerald-700 font-mono tabular-nums">99.98%</span>
              <span className="text-slate-500 ml-1.5">billing precision</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Billing Workflow Timeline matching PDF Page 1 */}
      <section className="bg-white py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-8">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              A complete billing cycle, without the chasing.
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end automation from contract quote approval to bank payment reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50/75 rounded border border-slate-200">
              <span className="text-[10px] font-mono font-medium text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                01 Oct
              </span>
              <h4 className="font-semibold text-slate-900 mt-2 text-xs">Sign-up & Authorization</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Customer signs proposal and saves verified payment method in isolated portal.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50/75 rounded border border-slate-200">
              <span className="text-[10px] font-mono font-medium text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                09 Oct
              </span>
              <h4 className="font-semibold text-slate-900 mt-2 text-xs">Plan & Add-on Launch</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Brand variants (e.g. +560 seat modules) and tiered products provisioned.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50/75 rounded border border-slate-200">
              <span className="text-[10px] font-mono font-medium text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                14 Oct
              </span>
              <h4 className="font-semibold text-slate-900 mt-2 text-xs">Quote Conversion</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Approved sales proposal converts directly to active recurring contract.
              </p>
            </div>
            <div className="p-3.5 bg-amber-50/40 rounded border border-amber-200">
              <span className="text-[10px] font-mono font-medium text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">
                31 Oct
              </span>
              <h4 className="font-semibold text-slate-900 mt-2 text-xs">Automated Billing Run</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Invoices generated, taxes auto-calculated, and bank reconciliation completed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feature Grid matching PDF Page 1 */}
      <section className="py-14 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mb-8">
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Engineered for financial operations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Every module complies with statutory GST requirements and enterprise separation of duties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tile 1: Subscription status, automatic */}
          <div className="bg-white p-4 rounded border border-slate-200 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-xs">Subscription lifecycle, automated</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time lifecycle tracking across all customer accounts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Draft</span>
              <span className="text-slate-400">→</span>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                Quoted
              </span>
              <span className="text-slate-400">→</span>
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-medium">
                Active
              </span>
              <span className="text-slate-400">→</span>
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">Closed</span>
            </div>
          </div>

          {/* Tile 2: Discounts that apply themselves */}
          <div className="bg-white p-4 rounded border border-slate-200 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-xs">Automated rule evaluation</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluates minimum purchase threshold, active dates, and customer tiers.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-medium text-emerald-800">DISC-PROMO-15</span>
                <span className="text-[10px] text-slate-500 block">15% applied automatically</span>
              </div>
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Tile 3: Who sees what (Permissions) */}
          <div className="bg-white p-4 rounded border border-slate-200 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-xs">Granular role-based access</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Strict separation between Admin, Staff, and Customer views.
              </p>
            </div>
            <div className="space-y-1 text-[11px]">
              {['Dashboard & Revenue', 'Subscriptions & Quotes', 'Invoices & Payments', 'Tax Configuration'].map(
                (mod) => (
                  <div key={mod} className="flex items-center justify-between py-0.5">
                    <span className="text-slate-700">{mod}</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Tile 4: Tax rules */}
          <div className="bg-white p-4 rounded border border-slate-200 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-xs">Dual GST computation engine</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Intra-state (CGST+SGST) and inter-state (IGST) split based on POS.
              </p>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-800">IGST 18%</span>
                <span className="text-slate-500">Inter-state supply</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-800">9% CGST + 9% SGST</span>
                <span className="text-slate-500">Intra-state Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Tile 5: Payments matched to invoices */}
          <div className="bg-white p-4 rounded border border-slate-200 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-xs">Payment reconciliation ledger</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Reconcile bank wires, UPI handles, and credit cards with zero duplicates.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-medium text-slate-900">₹18,42,500</span>
                <span className="text-[10px] text-slate-500 block">Total Collections</span>
              </div>
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono text-[10px]">
                92.5% Rate
              </span>
            </div>
          </div>

          {/* Tile 6: Bank-grade security */}
          <div className="bg-white p-4 rounded border border-slate-200 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-xs">Audit logging & compliance</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Full immutable audit trail with timestamped status changes.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#0B2E2B]" />
                <span className="font-medium text-slate-800">Enterprise Ready</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Password entropy requirements, session persistence, and customer tenant isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Summary Teaser */}
      <section className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Transparent pricing based on active subscriptions
          </h2>
          <p className="text-slate-500 text-xs mt-1 max-w-lg mx-auto">
            Starter at ₹2,499/mo up to Enterprise custom volume with dedicated reconciliation SLAs.
          </p>
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => onNavigate('pricing')}
              className="px-4 py-2 bg-[#F4BA28] text-slate-950 font-medium rounded text-xs hover:bg-[#E5A817] transition-colors flex items-center gap-1.5"
            >
              <span>View Full Pricing Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner matching PDF Page 1 */}
      <section className="bg-[#0B2E2B] text-white py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Ready to automate your subscription billing?</h3>
            <p className="text-xs text-[#B0D0CE] mt-0.5">
              Experience the full interactive demo with preloaded enterprise customers, plans, and invoices.
            </p>
          </div>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-2 bg-[#F4BA28] text-slate-950 rounded text-xs font-medium hover:bg-[#E5A817] transition-colors shrink-0"
          >
            Start free trial
          </button>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#071F1D] text-slate-400 py-8 px-6 lg:px-12 border-t border-[#0F3735] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrightloopLogo variant="light" size="sm" />
            <span className="text-[11px] text-slate-400">© 2024–2026 Brightloop Technologies Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-[#A0C0BE]">
            <button onClick={() => onNavigate('pricing')} className="hover:text-white">
              Pricing
            </button>
            <button onClick={() => onNavigate('settings')} className="hover:text-white">
              Compliance
            </button>
            <button onClick={() => onNavigate('reports')} className="hover:text-white">
              Reports
            </button>
            <button onClick={() => onNavigate('login')} className="hover:text-white">
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
