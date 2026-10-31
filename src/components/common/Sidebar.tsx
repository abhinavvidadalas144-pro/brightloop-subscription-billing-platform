import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  FileText,
  CreditCard,
  Percent,
  BarChart3,
  Settings,
  Package,
  FileCheck,
  ShieldCheck,
  ChevronDown,
  LogOut,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import { BrightloopLogo } from './BrightloopLogo';
import { useBilling } from '../../context/BillingContext';

export type AppPage =
  | 'landing'
  | 'product'
  | 'solutions'
  | 'pricing'
  | 'resources'
  | 'book-demo'
  | 'register'
  | 'login'
  | 'dashboard'
  | 'customers'
  | 'subscriptions'
  | 'invoices'
  | 'payments'
  | 'discounts-taxes'
  | 'quotes'
  | 'products'
  | 'plans'
  | 'reports'
  | 'staff'
  | 'settings'
  | 'customer-portal';

export type CustomerPortalTab = 'overview' | 'plan' | 'invoices' | 'payments' | 'settings';

interface SidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  currentPortalTab?: CustomerPortalTab;
  onCustomerPortalTabChange?: (tab: CustomerPortalTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  customerTab?: CustomerPortalTab;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentPortalTab = 'overview',
  onCustomerPortalTabChange,
  isOpen = false,
  onClose,
}) => {
  const { currentUser, users, switchUser } = useBilling();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isCustomer = currentUser.role === 'Customer';
  const isAdmin = currentUser.role === 'Admin';

  const handleNavClick = (pageId: AppPage, customerTab?: CustomerPortalTab) => {
    onNavigate(pageId);
    if (customerTab && onCustomerPortalTabChange) {
      onCustomerPortalTabChange(customerTab);
    }
    if (onClose) onClose();
  };

  // Grouped Navigation Sections according to exact specification
  const navSections: NavSection[] = isCustomer
    ? [
        {
          title: 'Customer Portal',
          items: [
            { id: 'customer-portal' as AppPage, customerTab: 'overview' as CustomerPortalTab, label: 'Overview', icon: LayoutDashboard },
            { id: 'customer-portal' as AppPage, customerTab: 'plan' as CustomerPortalTab, label: 'My Plan', icon: Layers },
            { id: 'customer-portal' as AppPage, customerTab: 'invoices' as CustomerPortalTab, label: 'Invoices', icon: FileText },
            { id: 'customer-portal' as AppPage, customerTab: 'payments' as CustomerPortalTab, label: 'Payments', icon: CreditCard },
            { id: 'customer-portal' as AppPage, customerTab: 'settings' as CustomerPortalTab, label: 'Account Settings', icon: Settings },
          ],
        },
      ]
    : [
        {
          title: 'Brightloop Billing',
          items: [
            { id: 'dashboard' as AppPage, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'customers' as AppPage, label: 'Customers', icon: Users },
            { id: 'subscriptions' as AppPage, label: 'Subscriptions', icon: Layers },
            { id: 'invoices' as AppPage, label: 'Invoices', icon: FileText },
            { id: 'payments' as AppPage, label: 'Payments', icon: CreditCard },
            { id: 'discounts-taxes' as AppPage, label: 'Discounts & Taxes', icon: Percent },
            { id: 'quotes' as AppPage, label: 'Quotes', icon: FileCheck },
            { id: 'products' as AppPage, label: 'Products', icon: Package },
            { id: 'plans' as AppPage, label: 'Plans', icon: CalendarDays },
            { id: 'reports' as AppPage, label: 'Reports', icon: BarChart3 },
            ...(isAdmin ? [{ id: 'staff' as AppPage, label: 'Staff', icon: ShieldCheck }] : []),
            { id: 'settings' as AppPage, label: 'Settings', icon: Settings },
          ],
        },
      ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-2xs backdrop-fade"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-60 bg-[#0B2E2B] text-white z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#15423E] select-none`}
      >
        {/* Top Brand Area */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#143D39]">
          <button
            onClick={() => handleNavClick(isCustomer ? 'customer-portal' : 'dashboard')}
            className="text-left focus:outline-hidden"
          >
            <BrightloopLogo size="sm" variant="light" />
          </button>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#7EAAA6] bg-[#103A36] px-1.5 py-0.5 rounded">
            v2.6
          </span>
        </div>

        {/* Customer Organization Banner */}
        {isCustomer && (
          <div className="px-5 py-2.5 bg-[#082422] border-b border-[#143D39]">
            <div className="text-[10px] text-[#7EAAA6] uppercase tracking-wider font-semibold">
              Organization
            </div>
            <div className="text-xs font-semibold text-white truncate mt-0.5">
              {currentUser.company || 'Northwind Traders'}
            </div>
          </div>
        )}

        {/* Navigation list with grouped sections */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6D9995]">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isCustomer
                  ? currentPage === 'customer-portal' && currentPortalTab === item.customerTab
                  : currentPage === item.id;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.id, item.customerTab)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-[#164642] text-white font-semibold shadow-2xs'
                        : 'text-[#A0C0BE] hover:text-white hover:bg-[#113A36]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 stroke-[1.8] ${
                        isActive ? 'text-[#F4BA28]' : 'text-[#7DABA6]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom utility & user profile */}
        <div className="p-3 border-t border-[#143D39] space-y-2 bg-[#092724]">
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-[#113A36] transition-colors border border-[#174642]/60 text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-[#164642] text-[#F4BA28] flex items-center justify-center text-[11px] font-bold shrink-0 border border-[#1F5C56]">
                  {currentUser.avatarText}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#86ADA9] truncate">
                    {currentUser.role}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7EAAA6] shrink-0 ml-1" />
            </button>

            {/* Profile & Persona Switcher */}
            {profileDropdownOpen && (
              <div className="dropdown-enter absolute bottom-full left-0 right-0 mb-2 bg-[#082422] border border-[#1B524E] rounded-lg shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7EAAA6] border-b border-[#143D39]">
                  Switch Role / Persona
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setProfileDropdownOpen(false);
                      if (u.role === 'Customer') {
                        onNavigate('customer-portal');
                      } else {
                        onNavigate('dashboard');
                      }
                    }}
                    className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-[#113A36] transition-colors ${
                      u.id === currentUser.id ? 'bg-[#164642] text-white font-semibold' : 'text-[#A0C0BE]'
                    }`}
                  >
                    <span className="truncate">{u.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{u.role}</span>
                  </button>
                ))}
                <div className="border-t border-[#143D39] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('landing');
                    }}
                    className="w-full px-3 py-1.5 text-left text-[11px] text-[#A0C0BE] hover:text-white hover:bg-[#113A36] flex items-center justify-between"
                  >
                    <span>Logout</span>
                    <ExternalLink className="w-3 h-3 text-[#7EAAA6]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
