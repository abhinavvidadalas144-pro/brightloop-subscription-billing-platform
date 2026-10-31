import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Command,
  User as UserIcon,
  KeyRound,
  LogOut,
  X,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import { AppPage } from './Sidebar';
import { formatINR } from './Currency';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onNavigate: (page: AppPage) => void;
  onSearch?: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  onNavigate,
  onSearch,
}) => {
  const {
    currentUser,
    customers,
    invoices,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchAll,
    changePassword,
    validatePassword,
    logout,
  } = useBilling();

  const [searchVal, setSearchVal] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [selectedCompany, setSelectedCompany] = useState(
    currentUser.company || 'Brightloop Software'
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const isCustomer = currentUser.role === 'Customer';
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Listen for ⌘K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setShowNotifications(false);
        setShowCompanyMenu(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = searchVal ? searchAll(searchVal) : { customers: [], subscriptions: [], invoices: [] };
  const hasSearchResults =
    searchResults.customers.length > 0 ||
    searchResults.subscriptions.length > 0 ||
    searchResults.invoices.length > 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    setShowSearchResults(true);
    if (onSearch) onSearch(val);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setPasswordError('Password must be more than 8 characters and include uppercase, lowercase, and a special character.');
      return;
    }

    const res = changePassword(newPassword);
    if (res.success) {
      setPasswordToast('Password updated successfully.');
      setTimeout(() => {
        setPasswordToast(null);
        setShowPasswordModal(false);
        setNewPassword('');
      }, 1500);
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  const pwCheck = validatePassword(newPassword);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 h-14 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
        {/* Left side: Hamburger (mobile) & Clean Company Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Company Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-900 hover:text-black py-1.5 px-2.5 rounded-md hover:bg-slate-50 transition-colors border border-slate-200"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                {isCustomer ? currentUser.company || 'Northwind Traders' : selectedCompany}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCompanyMenu && !isCustomer && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Switch Organization View
                </div>
                <button
                  onClick={() => {
                    setSelectedCompany('Brightloop Software (HQ)');
                    setShowCompanyMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Brightloop Software (HQ)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Global</span>
                </button>
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompany(c.name);
                      setShowCompanyMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      selectedCompany === c.name ? 'font-semibold text-[#0C3430] bg-slate-50' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle: Compact Global Search (Stripe style) with live popup results */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search subscriptions, invoices, customers..."
              className="w-full pl-8 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-slate-400 transition-all font-mono"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 font-mono border border-slate-200 rounded px-1 py-0.2 bg-white pointer-events-none">
              <span>⌘K</span>
            </div>
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && searchVal && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-xs max-h-80 overflow-y-auto">
              {!hasSearchResults ? (
                <div className="px-4 py-3 text-center text-slate-400 text-xs">
                  No matching records found for "{searchVal}".
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Customers */}
                  {searchResults.customers.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        Customers ({searchResults.customers.length})
                      </div>
                      {searchResults.customers.slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            onNavigate('customers');
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 block">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.contactPerson} • {c.city}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{c.gstin}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Subscriptions */}
                  {searchResults.subscriptions.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        Subscriptions ({searchResults.subscriptions.length})
                      </div>
                      {searchResults.subscriptions.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            onNavigate('subscriptions');
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 font-mono">{s.id}</span>
                            <span className="text-slate-600 ml-2">{s.customerName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 font-medium">
                            {formatINR(s.totalAmount)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Invoices */}
                  {searchResults.invoices.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        Invoices ({searchResults.invoices.length})
                      </div>
                      {searchResults.invoices.slice(0, 3).map((i) => (
                        <button
                          key={i.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            onNavigate('invoices');
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 font-mono">{i.invoiceNumber}</span>
                            <span className="text-slate-600 ml-2">{i.customerName}</span>
                          </div>
                          <span className="text-[10px] font-mono font-medium text-slate-700">
                            {formatINR(i.totalAmount)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side: Notifications & Profile User Menu */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Activity & Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full text-[10px] font-mono">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      No current notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.linkPage) onNavigate(n.linkPage as AppPage);
                          setShowNotifications(false);
                        }}
                        className={`p-2 rounded-md border flex items-start gap-2 cursor-pointer transition-colors ${
                          n.type === 'danger'
                            ? 'bg-rose-50/60 border-rose-200/50 hover:bg-rose-50'
                            : n.type === 'success'
                            ? 'bg-emerald-50/60 border-emerald-200/50 hover:bg-emerald-50'
                            : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100'
                        }`}
                      >
                        {n.type === 'danger' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        ) : n.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[11px] text-slate-900 truncate">
                              {n.title}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">{n.timestamp}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 mt-0.5 leading-tight">{n.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Pill with Menu */}
          <div className="relative pl-2 border-l border-slate-200">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 text-left hover:opacity-90 focus:outline-hidden"
            >
              <div className="w-6 h-6 rounded-md bg-[#0B2E2B] text-[#F4BA28] flex items-center justify-center text-[11px] font-bold">
                {currentUser.avatarText}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-slate-900 block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 font-mono">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* User Profile Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                  <span className="font-semibold text-slate-900 block truncate">{currentUser.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 block truncate">{currentUser.email}</span>
                  <span className="text-[10px] font-mono text-emerald-800 font-medium block mt-0.5">
                    Role: {currentUser.role} {currentUser.company ? `• ${currentUser.company}` : ''}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('settings');
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Organization Settings</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      onNavigate('landing');
                    }}
                    className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white rounded-md max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-[#0B2E2B]">Change Account Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {passwordToast && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{passwordToast}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="text-slate-600 block mb-1 font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono pr-8 focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password checklist */}
              <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 space-y-1 text-[10px]">
                <div className="text-slate-500 font-medium">Security Criteria:</div>
                <div className="grid grid-cols-2 gap-1 text-slate-600">
                  <span className={pwCheck.hasLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ More than 8 chars
                  </span>
                  <span className={pwCheck.hasUpper ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ Uppercase letter
                  </span>
                  <span className={pwCheck.hasLower ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ Lowercase letter
                  </span>
                  <span className={pwCheck.hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ Special symbol
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!pwCheck.valid}
                className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-medium rounded text-xs hover:bg-[#E5A817] disabled:opacity-50"
              >
                Save New Password
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
