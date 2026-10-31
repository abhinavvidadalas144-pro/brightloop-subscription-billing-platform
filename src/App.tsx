import React, { useState, useEffect } from 'react';
import { BillingProvider, useBilling } from './context/BillingContext';
import { Sidebar, AppPage, CustomerPortalTab } from './components/common/Sidebar';
import { TopHeader } from './components/common/TopHeader';

// Public Marketing & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { ProductPage } from './pages/ProductPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { PricingPage } from './pages/PricingPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { BookDemoPage } from './pages/BookDemoPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Customer Portal
import { CustomerPortalPage } from './pages/CustomerPortalPage';

// Admin & Staff Operations Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { DiscountsTaxesPage } from './pages/DiscountsTaxesPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { ProductsPage } from './pages/ProductsPage';
import { PlansPage } from './pages/PlansPage';
import { FinanceReportsPage } from './pages/FinanceReportsPage';
import { StaffPage } from './pages/StaffPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { currentUser } = useBilling();
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [customerPortalTab, setCustomerPortalTab] = useState<CustomerPortalTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync default view when user persona is switched
  useEffect(() => {
    if (currentUser.role === 'Customer' && currentPage !== 'customer-portal') {
      setCurrentPage('customer-portal');
    }
  }, [currentUser.id, currentUser.role]);

  const isPublicPage =
    currentPage === 'landing' ||
    currentPage === 'product' ||
    currentPage === 'solutions' ||
    currentPage === 'pricing' ||
    currentPage === 'resources' ||
    currentPage === 'book-demo' ||
    currentPage === 'register' ||
    currentPage === 'login';

  const renderCurrentPage = () => {
    switch (currentPage) {
      // Public Website Pages
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'product':
        return <ProductPage onNavigate={setCurrentPage} />;
      case 'solutions':
        return <SolutionsPage onNavigate={setCurrentPage} />;
      case 'pricing':
        return <PricingPage onNavigate={setCurrentPage} />;
      case 'resources':
        return <ResourcesPage onNavigate={setCurrentPage} />;
      case 'book-demo':
        return <BookDemoPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;

      // Customer Portal
      case 'customer-portal':
        return (
          <CustomerPortalPage
            activeTab={customerPortalTab}
            onTabChange={setCustomerPortalTab}
          />
        );

      // Admin & Staff Pages
      case 'dashboard':
        return <AdminDashboardPage onNavigate={setCurrentPage} />;
      case 'customers':
        return <CustomersPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'discounts-taxes':
        return <DiscountsTaxesPage />;
      case 'quotes':
        return <QuotationsPage onNavigate={setCurrentPage} />;
      case 'products':
        return <ProductsPage />;
      case 'plans':
        return <PlansPage />;
      case 'reports':
        return <FinanceReportsPage />;
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
        <main key={currentPage} className="page-enter">
          {renderCurrentPage()}
        </main>
      ) : (
        <div className="flex min-h-screen">
          {/* Dark Teal Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            currentPortalTab={customerPortalTab}
            onCustomerPortalTabChange={setCustomerPortalTab}
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Workspace with sticky TopHeader */}
          <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
            <TopHeader
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              onNavigate={setCurrentPage}
            />

            <main
              key={currentPage}
              className="page-enter flex-1 p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full"
            >
              {renderCurrentPage()}
            </main>
          </div>
        </div>
      )}
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
