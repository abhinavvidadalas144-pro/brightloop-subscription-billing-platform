import React, { useState } from 'react';
import { BillingProvider, useBilling } from './context/BillingContext';
import { Sidebar, AppPage } from './components/common/Sidebar';
import { TopHeader } from './components/common/TopHeader';

// Reference Pages from Canva/PDF
import { LandingPage } from './pages/LandingPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { FinanceReportsPage } from './pages/FinanceReportsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { DiscountsTaxesPage } from './pages/DiscountsTaxesPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PricingPage } from './pages/PricingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';

// Additional Functional Pages from Problem Statement
import { ProductsPage } from './pages/ProductsPage';
import { PlansPage } from './pages/PlansPage';
import { CustomersPage } from './pages/CustomersPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { StaffPage } from './pages/StaffPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { currentUser, switchUser, users } = useBilling();
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);

  const isPublicPage =
    currentPage === 'landing' ||
    currentPage === 'pricing' ||
    currentPage === 'register' ||
    currentPage === 'login';

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'pricing':
        return <PricingPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <AdminDashboardPage onNavigate={setCurrentPage} />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'discounts-taxes':
        return <DiscountsTaxesPage />;
      case 'reports':
        return <FinanceReportsPage />;
      case 'customer-portal':
        return <CustomerPortalPage />;
      case 'products':
        return <ProductsPage />;
      case 'plans':
        return <PlansPage />;
      case 'customers':
        return <CustomersPage />;
      case 'quotes':
        return <QuotationsPage onNavigate={setCurrentPage} />;
      case 'staff':
        return <StaffPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AdminDashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F8] text-slate-900 font-sans antialiased">
      {/* If Public Marketing / Auth page, render without internal sidebar */}
      {isPublicPage ? (
        <main>{renderCurrentPage()}</main>
      ) : (
        <div className="flex min-h-screen">
          {/* Dark Teal Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Workspace with sticky TopHeader */}
          <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
            <TopHeader
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              onNavigate={setCurrentPage}
            />

            <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full">
              {renderCurrentPage()}
            </main>
          </div>
        </div>
      )}

      {/* Discrete Reviewer / Quick Navigation Drawer at bottom right */}
      <div className="fixed bottom-3 right-3 z-50">
        <div className="relative">
          <button
            onClick={() => setShowQuickNav(!showQuickNav)}
            className="px-2.5 py-1.5 bg-[#0B2E2B] hover:bg-[#154442] text-white rounded shadow-md border border-[#F4BA28]/40 text-xs font-mono font-medium flex items-center gap-2 transition-colors"
            title="Jump to any Brightloop Reference Screen or Switch Role"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4BA28]" />
            <span>Screen Navigator</span>
          </button>

          {showQuickNav && (
            <div className="absolute bottom-10 right-0 w-80 bg-white rounded-md shadow-xl border border-slate-200 p-3.5 text-xs space-y-3 max-h-[82vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-[#0B2E2B] text-xs">11-Page PDF Reference Index</span>
                <button
                  onClick={() => setShowQuickNav(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              {/* 11 PDF Reference Pages */}
              <div className="space-y-0.5">
                {[
                  { id: 'landing' as AppPage, label: 'Page 1 — Public Landing Page' },
                  { id: 'customer-portal' as AppPage, label: 'Page 2 — Customer Billing Portal' },
                  { id: 'reports' as AppPage, label: 'Page 3 — Finance Reports' },
                  { id: 'payments' as AppPage, label: 'Page 4 — Payments Management' },
                  { id: 'discounts-taxes' as AppPage, label: 'Page 5 — Discounts & Taxes' },
                  { id: 'invoices' as AppPage, label: 'Page 6 — Invoice Management & Billing Runs' },
                  { id: 'pricing' as AppPage, label: 'Page 7 — Pricing Page' },
                  { id: 'register' as AppPage, label: 'Page 8 — Registration Page' },
                  { id: 'login' as AppPage, label: 'Page 9 — Login & Password Reset' },
                  { id: 'dashboard' as AppPage, label: 'Page 10 — Admin Dashboard' },
                  { id: 'subscriptions' as AppPage, label: 'Page 11 — Subscription Management' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setShowQuickNav(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center justify-between text-xs ${
                      currentPage === item.id
                        ? 'bg-teal-50 text-[#0B2E2B] font-medium border border-teal-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Additional Functional Pages */}
              <div className="pt-2 border-t border-slate-100 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
                  Additional Functional Pages
                </span>
                {[
                  { id: 'products' as AppPage, label: 'Products & Brand Variants (+560)' },
                  { id: 'plans' as AppPage, label: 'Subscription Plan Frequencies' },
                  { id: 'customers' as AppPage, label: 'Customer 360 Directory' },
                  { id: 'quotes' as AppPage, label: 'Quotations & Templates' },
                  { id: 'staff' as AppPage, label: 'Internal Staff & RBAC' },
                  { id: 'settings' as AppPage, label: 'Legal Entity & GST Settings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setShowQuickNav(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded transition-colors text-xs ${
                      currentPage === item.id
                        ? 'bg-teal-50 text-[#0B2E2B] font-medium border border-teal-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Persona / Role Switch */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5">
                  Active Persona / Role:
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      switchUser('user-anika');
                      setCurrentPage('dashboard');
                      setShowQuickNav(false);
                    }}
                    className={`flex-1 py-1 rounded text-xs font-medium font-mono ${
                      currentUser.role === 'Admin'
                        ? 'bg-[#0B2E2B] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => {
                      switchUser('user-neha');
                      setCurrentPage('dashboard');
                      setShowQuickNav(false);
                    }}
                    className={`flex-1 py-1 rounded text-xs font-medium font-mono ${
                      currentUser.role === 'Staff'
                        ? 'bg-[#0B2E2B] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Staff
                  </button>
                  <button
                    onClick={() => {
                      switchUser('user-northwind');
                      setCurrentPage('customer-portal');
                      setShowQuickNav(false);
                    }}
                    className={`flex-1 py-1 rounded text-xs font-medium font-mono ${
                      currentUser.role === 'Customer'
                        ? 'bg-[#0B2E2B] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Customer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BillingProvider>
      <AppContent />
    </BillingProvider>
  );
}
