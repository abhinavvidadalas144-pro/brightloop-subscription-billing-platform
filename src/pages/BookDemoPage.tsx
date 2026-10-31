import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  Mail,
  User,
  Phone,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';
import { PublicNavbar } from '../components/common/PublicNavbar';
import { AppPage } from '../components/common/Sidebar';

interface BookDemoPageProps {
  onNavigate: (page: AppPage) => void;
}

export const BookDemoPage: React.FC<BookDemoPageProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [teamSize, setTeamSize] = useState('11-50');
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [selectedTime, setSelectedTime] = useState('14:30');
  const [primaryInterest, setPrimaryInterest] = useState('GST Compliance & Automated Invoicing');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !company) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9F8] text-slate-900 selection:bg-[#F4BA28]/30">
      <PublicNavbar currentPage="book-demo" onNavigate={onNavigate} />

      <section className="px-6 lg:px-12 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Context & Overview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-[#0B2E2B] text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live 1-on-1 Product Walkthrough</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
              Experience Brightloop customized for your billing workflow.
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Book a 30-minute interactive live demonstration with our senior billing architects. We will demonstrate how Brightloop automates subscription cycles, calculates GST, and eliminates revenue leakages.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold block">Automated Billing Runs</strong>
                  <span>See how 1,000+ customer invoices are generated and matched sequentially in seconds.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold block">Dual-State GST & HSN Verification</strong>
                  <span>Witness real-time Intra-state vs Inter-state tax calculations with zero float precision error.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold block">Self-Service Customer Portal</strong>
                  <span>Preview what your enterprise clients experience when paying and downloading statements.</span>
                </div>
              </div>
            </div>

            {/* Instant Demo Sandbox Shortcut */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B2E2B]">
                <PlayCircle className="w-4 h-4 text-[#0B2E2B]" />
                <span>Need immediate access right now?</span>
              </div>
              <p className="text-[11px] text-slate-600">
                You can launch the live interactive sandbox environment immediately without waiting for a scheduled call.
              </p>
              <button
                onClick={() => onNavigate('dashboard')}
                className="mt-1 px-3 py-1.5 bg-[#0B2E2B] text-white rounded text-xs font-medium hover:bg-[#154442] transition-colors flex items-center gap-1.5"
              >
                <span>Launch Live Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Booking Form or Confirmation */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-2xs">
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Demo Walkthrough Confirmed!</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{fullName}</strong>. A calendar invitation has been sent to <strong>{email}</strong> for <strong>{selectedDate}</strong> at <strong>{selectedTime} IST</strong>.
                  </p>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs text-left max-w-md mx-auto space-y-1.5">
                    <div className="text-[11px] uppercase font-mono text-slate-400 font-bold">Booking Details:</div>
                    <div className="text-slate-800"><strong>Company:</strong> {company} ({teamSize} team members)</div>
                    <div className="text-slate-800"><strong>Primary Focus:</strong> {primaryInterest}</div>
                    <div className="text-slate-800"><strong>Meeting Link:</strong> Google Meet (attached to invitation)</div>
                  </div>

                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="px-4 py-2 bg-[#0B2E2B] text-white rounded text-xs font-semibold hover:bg-[#154442] transition-colors"
                    >
                      Enter Live Sandbox
                    </button>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
                    >
                      Book Another Time
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-lg font-semibold text-slate-900">Schedule Your Session</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Pick a time that fits your schedule.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Vikram Malhotra"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vikram@company.com"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Company Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Technologies Pvt Ltd"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Team Size</label>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                      >
                        <option value="1-10">1 - 10 people</option>
                        <option value="11-50">11 - 50 people</option>
                        <option value="51-200">51 - 200 people</option>
                        <option value="200+">200+ people</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Time Slot (IST)</label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                      >
                        <option value="11:00">11:00 AM IST</option>
                        <option value="14:30">02:30 PM IST</option>
                        <option value="16:00">04:00 PM IST</option>
                        <option value="17:30">05:30 PM IST</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Primary Interest Area</label>
                    <select
                      value={primaryInterest}
                      onChange={(e) => setPrimaryInterest(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden"
                    >
                      <option value="GST Compliance & Automated Invoicing">GST Compliance & Automated Invoicing</option>
                      <option value="Quotation to Subscription Workflows">Quotation to Subscription Workflows</option>
                      <option value="Multi-Rail Payments & Dunning Automation">Multi-Rail Payments & Dunning Automation</option>
                      <option value="Usage-Based & Metered Contract Billing">Usage-Based & Metered Contract Billing</option>
                      <option value="Complete Platform Walkthrough">Complete Platform Walkthrough</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#F4BA28] text-slate-950 rounded text-xs font-semibold hover:bg-[#E5A817] transition-colors shadow-2xs flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Confirm Demo Schedule</span>
                    </button>
                    <div className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>No credit card or setup fees required. Confidential NDA guaranteed.</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
