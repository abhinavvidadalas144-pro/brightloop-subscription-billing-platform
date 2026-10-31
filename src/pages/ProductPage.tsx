import React, { useState } from 'react';
import {
  Layers,
  FileText,
  CreditCard,
  Percent,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sliders,
  Database,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { PublicNavbar } from '../components/common/PublicNavbar';
import { AppPage } from '../components/common/Sidebar';
import { formatINR } from '../components/common/Currency';

interface ProductPageProps {
  onNavigate: (page: AppPage) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ onNavigate }) => {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'billing' | 'invoicing' | 'payments' | 'gst'>('billing');

  const capabilities = [
    {
      id: 'billing',
      title: 'Automated Subscription Engine',
      icon: Layers,
      headline: 'Multi-cadence subscription billing that scales with your contracts',
      description:
        'Brightloop automates recurring billing cycles across Monthly, Quarterly, and Annual contracts. Support seat-based pricing, proration on mid-cycle upgrades, pauses, and renewals without manual intervention.',
      bullets: [
        'Automatic cycle advancement and rollover',
        'Prorated charges for seat changes and plan upgrades',
        'Pause, cancel, and renewal automation with grace periods',
        'Integer-paise financial precision with zero rounding leakage',
      ],
      previewStats: [
        { label: 'Active Subscriptions', val: '1,420+' },
        { label: 'Cycle Accuracy', val: '100%' },
        { label: 'Automated Billing Runs', val: 'Daily 00:00' },
      ],
    },
    {
      id: 'invoicing',
      title: 'GST-Compliant E-Invoicing',
      icon: FileText,
      headline: 'Sequential, audit-ready invoices formatted for Indian tax authority standards',
      description:
        'Generate deterministic invoice numbering (INV-2026-XXXX) with automated line-item calculation, HSN/SAC code mapping, and full tax breakdown according to intra-state and inter-state rules.',
      bullets: [
        'Intra-state CGST (9%) + SGST (9%) breakdown',
        'Inter-state IGST (18%) automated detection by customer state',
        'Pre-configured HSN/SAC codes for software and SaaS services',
        'One-click PDF download & printable invoices',
      ],
      previewStats: [
        { label: 'GST Compliance', val: 'GSTR-1 Ready' },
        { label: 'HSN/SAC Mapping', val: 'Automated' },
        { label: 'Invoice Generation', val: '< 50ms' },
      ],
    },
    {
      id: 'payments',
      title: 'Integrated Payment Collection',
      icon: CreditCard,
      headline: 'Multi-rail payment recording, automated dunning, and smart reconciliation',
      description:
        'Track every payment transaction with unique reference IDs. Handle UPI, Cards, Net Banking, and NEFT/RTGS with automated balance updating and partial payment allocations.',
      bullets: [
        'Real-time invoice status transitions from Confirmed to Paid',
        'Partial payment support with automatic remaining balance tracking',
        'Integrated transaction reference numbers and audit trail',
        'Smart dunning alerts for overdue accounts',
      ],
      previewStats: [
        { label: 'Payment Reconciliation', val: 'Real-time' },
        { label: 'Supported Rails', val: 'UPI / Card / NEFT' },
        { label: 'Dunning Recovery', val: 'Up to 98%' },
      ],
    },
    {
      id: 'gst',
      title: 'Discounts & Tax Configuration',
      icon: Percent,
      headline: 'Precise financial controls for sales campaigns and corporate agreements',
      description:
        'Create percentage and flat-amount discounts with start and expiration dates. Configure multi-tier tax rates and toggle active states instantly across all proposals and invoices.',
      bullets: [
        'Time-bounded seasonal and contractual discounts',
        'Customer-specific quote discount overrides',
        'Tax exemption handling for SEZ and export entities',
        'Direct synchronization with finance reporting',
      ],
      previewStats: [
        { label: 'Tax Rules', val: 'Multi-rate' },
        { label: 'Discount Types', val: 'Percentage & Flat' },
        { label: 'Audit Trail', val: 'Permanent' },
      ],
    },
  ];

  const currentCap = capabilities.find((c) => c.id === activeFeatureTab) || capabilities[0];

  return (
    <div className="min-h-screen bg-[#F8F9F8] text-slate-900 selection:bg-[#F4BA28]/30">
      <PublicNavbar currentPage="product" onNavigate={onNavigate} />

      {/* Hero Header */}
      <section className="px-6 lg:px-12 pt-14 pb-10 max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-[#0B2E2B] text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Brightloop Product Overview</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
            Engineered for predictable recurring revenue and zero billing errors.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            From initial sales quotation to automated recurring billing, GST-compliant invoicing, and payment reconciliation — Brightloop gives your finance and revenue teams a single source of truth.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('book-demo')}
              className="px-4 py-2 bg-[#F4BA28] text-slate-950 rounded text-xs font-semibold hover:bg-[#E5A817] transition-colors shadow-2xs flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book a Demo</span>
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Feature Deep Dive */}
      <section className="px-6 lg:px-12 py-10 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-6 lg:p-8">
          {/* Feature selector tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-slate-100 pb-4">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              const isActive = activeFeatureTab === cap.id;
              return (
                <button
                  key={cap.id}
                  onClick={() => setActiveFeatureTab(cap.id as any)}
                  className={`p-3 rounded text-left transition-all flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-teal-50 border border-teal-200 text-[#0B2E2B]'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0B2E2B]' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold truncate">{cap.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active capability details */}
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {currentCap.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {currentCap.description}
              </p>

              <div className="space-y-2 pt-2">
                {currentCap.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-3.5 py-1.5 bg-[#0B2E2B] text-white rounded text-xs font-medium hover:bg-[#154442] transition-colors flex items-center gap-2"
                >
                  <span>Explore in live sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 rounded-lg p-5 border border-slate-200/90 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                Performance Benchmark
              </span>
              <div className="grid grid-cols-1 gap-3">
                {currentCap.previewStats.map((stat, i) => (
                  <div key={i} className="bg-white p-3 rounded border border-slate-200/80 shadow-2xs">
                    <div className="text-[11px] text-slate-500">{stat.label}</div>
                    <div className="text-xl font-bold font-mono text-[#0B2E2B] mt-0.5">{stat.val}</div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-3">
                Verified with 100% test suite passing integer-paise calculations.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="px-6 lg:px-12 py-10 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Technical Architecture
          </span>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Designed for financial precision and institutional trust
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <Database className="w-5 h-5 text-[#0B2E2B]" />
            <h3 className="text-sm font-semibold text-slate-900">Zero Floating-Point Error</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every financial computation is strictly stored and evaluated in integer paise (1/100 INR), eliminating IEEE-754 floating-point inaccuracies.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Role-Based Access Control</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Granular roles for Admin, Staff, and Customer users. Protected settings, audit logs, and customer isolation ensure compliance.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <Zap className="w-5 h-5 text-[#F4BA28]" />
            <h3 className="text-sm font-semibold text-slate-900">Automated Billing Runs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Single-click automated generation of billing invoices for all active subscriptions with deterministic invoice number sequencing.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 lg:px-12 py-12 max-w-7xl mx-auto">
        <div className="bg-[#0B2E2B] text-white rounded-lg p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-semibold">Ready to automate your billing operations?</h3>
            <p className="text-xs sm:text-sm text-[#A0C0BE]">
              Join growing Indian SaaS businesses running compliant, audit-ready billing with Brightloop.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('book-demo')}
              className="px-4 py-2 bg-[#F4BA28] text-slate-950 rounded text-xs font-semibold hover:bg-[#E5A817] transition-colors shadow-2xs"
            >
              Book a Demo
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-4 py-2 bg-[#154442] text-white rounded text-xs font-semibold hover:bg-[#1A5452] transition-colors border border-[#216663]"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
