import React, { useState } from 'react';
import {
  Building2,
  Cpu,
  Layers,
  Scale,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Shield,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { PublicNavbar } from '../components/common/PublicNavbar';
import { AppPage } from '../components/common/Sidebar';

interface SolutionsPageProps {
  onNavigate: (page: AppPage) => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onNavigate }) => {
  const [selectedSolution, setSelectedSolution] = useState<'saas' | 'usage' | 'enterprise' | 'gst'>('saas');

  const solutions = [
    {
      id: 'saas',
      title: 'B2B SaaS Companies',
      icon: Layers,
      badge: 'High Growth',
      headline: 'Predictable Monthly & Annual Contract Billing with Zero Manual Invoicing',
      summary:
        'Eliminate spreadsheet tracking. Automate new signups, mid-term additions of user seats, plan migrations, and renewal invoicing effortlessly.',
      benefits: [
        'Automated monthly, quarterly, and annual billing schedules',
        'Seat-based tier calculation with real-time minimum requirements',
        'Automated dunning notifications for expired or failed card payments',
        'Real-time MRR, ARR, and Net Retention analytics',
      ],
      metrics: { highlight: '99.8%', label: 'On-time invoice dispatch' },
    },
    {
      id: 'usage',
      title: 'Usage & Hybrid Billing',
      icon: Cpu,
      badge: 'API & Infra',
      headline: 'Meter consumption, API calls, and volume tiers with exact financial math',
      summary:
        'Combine base subscription tiers with variable usage line items. Handle seasonal spikes, overage rates, and volume discounts transparently.',
      benefits: [
        'Add usage add-ons and extra capacity seats to base contracts',
        'Automatic line-item calculations without floating-point math errors',
        'Clear itemized breakdown on invoices showing rate per unit and volume',
        'Real-time customer portal visibility into active usage and cost',
      ],
      metrics: { highlight: '< 1 sec', label: 'Billing run reconciliation' },
    },
    {
      id: 'enterprise',
      title: 'Enterprise & Multi-Entity',
      icon: Building2,
      badge: 'Scale',
      headline: 'Multi-brand catalog, quotation workflows, and strict role-based controls',
      summary:
        'Empower enterprise sales teams to create formal quotations, obtain approvals, and convert signed proposals directly into active subscriptions with full audit logging.',
      benefits: [
        'Quote-to-Subscription workflow with custom discount approvals',
        'Multi-entity support with distinct legal entity names and GSTINs',
        'Granular RBAC distinguishing Admin, Staff, and Customer users',
        'Permanent audit trail of every invoice status modification',
      ],
      metrics: { highlight: '100%', label: 'Audit compliance' },
    },
    {
      id: 'gst',
      title: 'India GST & E-Invoicing',
      icon: Scale,
      badge: 'Compliance',
      headline: 'Native Indian tax compliance with dual-state CGST/SGST and IGST mapping',
      summary:
        'Designed specifically for Indian regulations. Automatically apply correct HSN/SAC codes, calculate tax splits based on Place of Supply, and produce GSTR-1 ready outputs.',
      benefits: [
        'Automated detection of Intra-state (9%+9%) vs Inter-state (18%) GST',
        'Pre-validated HSN/SAC codes (997331 for Software & SaaS)',
        'Legal entity details: GSTIN, PAN, CIN, and registered address on every invoice',
        'Sequential invoice numbering satisfying Indian tax rules',
      ],
      metrics: { highlight: 'GSTR-1', label: 'Export ready format' },
    },
  ];

  const current = solutions.find((s) => s.id === selectedSolution) || solutions[0];

  return (
    <div className="min-h-screen bg-[#F8F9F8] text-slate-900 selection:bg-[#F4BA28]/30">
      <PublicNavbar currentPage="solutions" onNavigate={onNavigate} />

      {/* Hero Header */}
      <section className="px-6 lg:px-12 pt-14 pb-10 max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-[#0B2E2B] text-xs font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Tailored Billing Solutions</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
            Built for modern businesses that cannot afford billing chaos.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Whether you are scaling a fast-growing SaaS startup, managing high-volume API usage billing, or operating an enterprise requiring strict GST compliance, Brightloop is built to adapt to your revenue model.
          </p>
        </div>
      </section>

      {/* Solutions Grid Selector */}
      <section className="px-6 lg:px-12 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            const isSelected = selectedSolution === sol.id;
            return (
              <button
                key={sol.id}
                onClick={() => setSelectedSolution(sol.id as any)}
                className={`p-5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-white border-[#0B2E2B] shadow-md ring-1 ring-[#0B2E2B]'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-md flex items-center justify-center ${
                      isSelected ? 'bg-[#0B2E2B] text-[#F4BA28]' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {sol.badge}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{sol.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sol.summary}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Solution Detailed Spotlight */}
      <section className="px-6 lg:px-12 py-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#0B2E2B] font-bold">
                {current.title} Solution Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                {current.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {current.summary}
              </p>

              <div className="space-y-2.5 pt-2">
                {current.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('book-demo')}
                  className="px-4 py-2 bg-[#F4BA28] text-slate-950 rounded text-xs font-semibold hover:bg-[#E5A817] transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book a tailored demo</span>
                </button>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold transition-colors"
                >
                  View Pricing Plans
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#0B2E2B] text-white rounded-lg p-6 space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#F4BA28] font-bold block">
                Impact Metric
              </span>
              <div>
                <div className="text-4xl font-bold font-mono text-white tracking-tight">
                  {current.metrics.highlight}
                </div>
                <div className="text-xs text-[#A0C0BE] mt-1">{current.metrics.label}</div>
              </div>

              <div className="pt-4 border-t border-[#174642] space-y-2 text-xs text-[#B0D0CE]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No credit card required for sandbox test</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Same-day data migration support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Trust Strip */}
      <section className="px-6 lg:px-12 py-12 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Enterprise Grade Security
          </span>
          <h3 className="text-xl font-semibold text-slate-900">
            Trusted by finance leaders across technology sectors
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <div className="text-base font-bold text-slate-800 font-mono">SOC 2 Type II</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Compliant Infrastructure</div>
          </div>
          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <div className="text-base font-bold text-slate-800 font-mono">256-Bit AES</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Data Encryption At Rest</div>
          </div>
          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <div className="text-base font-bold text-slate-800 font-mono">Integer Math</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Zero Float Precision Loss</div>
          </div>
          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <div className="text-base font-bold text-slate-800 font-mono">GSTR-1 Ready</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Indian GST Tax Standard</div>
          </div>
        </div>
      </section>
    </div>
  );
};
