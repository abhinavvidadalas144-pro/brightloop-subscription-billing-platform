import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  FileCheck2,
  Download,
  ExternalLink,
  Search,
  CheckCircle2,
  Copy,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { PublicNavbar } from '../components/common/PublicNavbar';
import { AppPage } from '../components/common/Sidebar';

interface ResourcesPageProps {
  onNavigate: (page: AppPage) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<'api' | 'gst' | 'migration' | 'faq'>('api');
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const sampleApiCall = `// Initialize Brightloop Billing SDK
import { BrightloopClient } from '@brightloop/sdk';

const brightloop = new BrightloopClient({
  apiKey: process.env.BRIGHTLOOP_SECRET_KEY,
  environment: 'production'
});

// Generate an automated subscription invoice with GST calculation
const invoice = await brightloop.invoices.create({
  customerId: 'cust_acme_corp',
  planId: 'plan_growth_annual',
  taxCalculation: 'auto', // Automatically applies CGST/SGST or IGST
  paymentTerms: 15 // Net 15 days
});

console.log('Invoice issued:', invoice.invoiceNumber, invoice.totalPaise);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleApiCall);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadGuide = (name: string) => {
    setDownloadSuccess(`Downloaded "${name}"`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9F8] text-slate-900 selection:bg-[#F4BA28]/30">
      <PublicNavbar currentPage="resources" onNavigate={onNavigate} />

      {/* Header */}
      <section className="px-6 lg:px-12 pt-14 pb-10 max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-[#0B2E2B] text-xs font-medium">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Developer & Finance Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
            Resources, Guides & Technical Reference
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Everything you need to integrate Brightloop with your tech stack, maintain compliant GST invoicing, and migrate legacy billing records seamlessly.
          </p>
        </div>
      </section>

      {/* Resource Category Selector Tabs */}
      <section className="px-6 lg:px-12 py-4 max-w-7xl mx-auto">
        {downloadSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'api', label: 'API Reference & SDKs', icon: Code2 },
            { id: 'gst', label: 'India GST Billing Guide', icon: FileCheck2 },
            { id: 'migration', label: 'Data Migration Toolkit', icon: Download },
            { id: 'faq', label: 'Frequently Asked Questions', icon: BookOpen },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0B2E2B] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Body */}
      <section className="px-6 lg:px-12 py-8 max-w-7xl mx-auto">
        {activeCategory === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Developer-First REST & Webhooks</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect Brightloop with your application to automatically trigger customer provisioning, subscription updates, usage events, and webhook notifications on invoice payments.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-white border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between font-mono text-xs font-semibold text-slate-800">
                    <span className="text-emerald-700 font-bold">POST</span>
                    <span>/api/v1/subscriptions</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Create an active contract with custom line items and automatic recurring cycle.</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between font-mono text-xs font-semibold text-slate-800">
                    <span className="text-blue-700 font-bold">GET</span>
                    <span>/api/v1/invoices/:id/pdf</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Fetch the signed, GST-compliant PDF invoice ready for direct customer distribution.</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between font-mono text-xs font-semibold text-slate-800">
                    <span className="text-amber-700 font-bold">POST</span>
                    <span>/api/v1/payments/record</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Reconcile transaction reference numbers across UPI, Card, or NEFT payment rails.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-900 rounded-lg p-4 text-white text-xs font-mono shadow-md overflow-hidden relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>typescript-sdk-sample.ts</span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Copied!' : 'Copy snippet'}</span>
                  </button>
                </div>
                <pre className="pt-3 text-[11px] overflow-x-auto text-emerald-400 leading-relaxed">
                  <code>{sampleApiCall}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'gst' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">India GST & E-Invoicing Compliance Manual</h2>
                <p className="text-xs text-slate-500 mt-0.5">Updated for FY 2026-27 regulations</p>
              </div>
              <button
                onClick={() => handleDownloadGuide('India-GST-Compliance-Manual-2026.pdf')}
                className="px-3.5 py-1.5 bg-[#0B2E2B] text-white rounded text-xs font-medium hover:bg-[#154442] flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-4 bg-slate-50 rounded border border-slate-200/80 space-y-2">
                <h3 className="font-semibold text-slate-900 text-sm">HSN & SAC Code Assignment</h3>
                <p className="text-slate-600 leading-relaxed">
                  Software-as-a-Service (SaaS) and electronic software licenses are categorized under SAC 997331 (Licensing services for the right to use computer software). Brightloop automatically populates this on all generated invoice line items.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded border border-slate-200/80 space-y-2">
                <h3 className="font-semibold text-slate-900 text-sm">Place of Supply & Tax Jurisdiction</h3>
                <p className="text-slate-600 leading-relaxed">
                  If the supplier and customer are both located within the same state (e.g. Karnataka - State Code 29), Brightloop splits the 18% tax into CGST 9% and SGST 9%. For inter-state supplies, IGST 18% is applied automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'migration' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Seamless Data Migration Toolkit</h2>
                <p className="text-xs text-slate-500 mt-0.5">Import customers, historical invoices, and active subscriptions</p>
              </div>
              <button
                onClick={() => handleDownloadGuide('Brightloop-CSV-Import-Template.csv')}
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 rounded text-xs font-semibold hover:bg-[#E5A817] flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV Template</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>Migrating from Chargebee, Stripe Billing, Zoho Subscriptions, or custom Excel spreadsheets?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 border border-slate-200 rounded">
                  <div className="font-semibold text-slate-900 mb-1">1. Export CSV</div>
                  <div>Export your customer roster and contract renewals into standard CSV columns.</div>
                </div>
                <div className="p-3 border border-slate-200 rounded">
                  <div className="font-semibold text-slate-900 mb-1">2. Auto-Validation</div>
                  <div>Brightloop's migration validator checks GSTIN checksums and email uniqueness.</div>
                </div>
                <div className="p-3 border border-slate-200 rounded">
                  <div className="font-semibold text-slate-900 mb-1">3. Zero-Downtime Cutover</div>
                  <div>Keep existing billing cycles intact without double-charging your clients.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'faq' && (
          <div className="space-y-3 max-w-4xl">
            {[
              {
                q: 'How does Brightloop calculate taxes on mixed subscription contracts?',
                a: 'Each product line item is mapped to its specific tax category. If discounts are applied, the discount is allocated proportionally before calculating the 18% GST (CGST+SGST or IGST depending on Place of Supply).',
              },
              {
                q: 'What precision is used for financial balances and currency conversions?',
                a: 'All transactions, invoice subtotals, tax fractions, and balances are evaluated in 64-bit integer paise (1/100 INR). This guarantees zero rounding leakage and exact ledger reconciliation.',
              },
              {
                q: 'Can customers log in to pay their own overdue invoices?',
                a: 'Yes. The dedicated Customer Billing Portal allows your clients to review their current plan, see past payment records, and settle outstanding balances via UPI, Card, or NEFT instantly.',
              },
              {
                q: 'Can our sales team create quotes before turning them into subscriptions?',
                a: 'Yes. Brightloop includes a built-in Quotation engine with templates, PDF downloads, and a single-click "Convert to Subscription" workflow that transitions approved quotes straight into active contracts.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <h3 className="font-semibold text-xs text-slate-900">{faq.q}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Demo CTA */}
      <section className="px-6 lg:px-12 py-10 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Need architectural consultation for your custom billing workflow?</h3>
            <p className="text-xs text-slate-500 mt-0.5">Our enterprise billing engineers will walk you through schema design and integration.</p>
          </div>
          <button
            onClick={() => onNavigate('book-demo')}
            className="px-4 py-2 bg-[#0B2E2B] text-white rounded text-xs font-semibold hover:bg-[#154442] transition-colors shrink-0 flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book a Technical Walkthrough</span>
          </button>
        </div>
      </section>
    </div>
  );
};
