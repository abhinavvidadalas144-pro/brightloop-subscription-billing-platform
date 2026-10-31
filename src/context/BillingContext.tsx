import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Customer,
  Product,
  SubscriptionPlan,
  Subscription,
  SubscriptionStatus,
  Invoice,
  InvoiceStatus,
  PaymentRecord,
  DiscountTaxRule,
  Quotation,
  User,
  UserRole,
  PaymentMethod,
  OrganizationSettings,
  AuditLogEntry,
  OutboxItem,
} from '../types';
import { api } from '../services/api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'success' | 'info';
  timestamp: string;
  read: boolean;
  linkPage?: string;
  linkId?: string;
}

interface BillingContextType {
  // Auth & Roles
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchUser: (userId: string) => void;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (name: string, email: string, company: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  addStaff: (staffData: { name: string; email: string; role: 'Staff' | 'Admin'; password: string }) => { success: boolean; user?: User; error?: string };
  requestPasswordReset: (email: string) => { success: boolean; message: string; token?: string };
  resetPassword: (token: string, newPassword: string) => { success: boolean; error?: string };
  changePassword: (newPassword: string) => { success: boolean; error?: string };
  validatePassword: (password: string) => {
    valid: boolean;
    hasLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasSpecial: boolean;
  };

  // Organization & Settings
  settings: OrganizationSettings;
  updateSettings: (newSettings: OrganizationSettings) => { success: boolean; error?: string };

  // Core Entity State (Tenant Isolated where appropriate)
  customers: Customer[];
  products: Product[];
  plans: SubscriptionPlan[];
  rules: DiscountTaxRule[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  quotations: Quotation[];
  auditLogs: AuditLogEntry[];
  outbox: OutboxItem[];

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Subscriptions Actions
  createSubscription: (sub: Omit<Subscription, 'id'>) => { success: boolean; subscription?: Subscription; error?: string };
  updateSubscription: (sub: Subscription) => void;
  updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => { success: boolean; error?: string };
  pauseSubscription: (id: string) => { success: boolean; error?: string };
  resumeSubscription: (id: string) => { success: boolean; error?: string };
  renewSubscription: (id: string) => { success: boolean; error?: string };
  closeSubscriptionEarly: (id: string) => { success: boolean; error?: string };

  // Invoices & Billing Engine
  previewBillingRun: () => { eligibleSubscriptions: Subscription[]; totalExpectedPaise: number; billingPeriod: string };
  runBillingRun: (billingPeriod: string) => { success: boolean; createdCount: number; skippedCount: number; totalBilledPaise: number; message: string };
  confirmInvoice: (id: string) => { success: boolean; error?: string };
  cancelInvoice: (id: string) => { success: boolean; error?: string };
  sendInvoice: (id: string) => { success: boolean; error?: string };
  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;

  // Payments & Reconciliation
  recordPayment: (payment: {
    invoiceId: string;
    amount: number; // in integer paise
    method: PaymentMethod;
    referenceNumber: string;
    receivedDate: string;
    note?: string;
  }) => { success: boolean; error?: string; payment?: PaymentRecord };

  // Rules (Discounts & Taxes)
  createRule: (rule: Omit<DiscountTaxRule, 'id' | 'usedCount'>) => DiscountTaxRule;
  updateRule: (rule: DiscountTaxRule) => void;
  deleteRule: (id: string) => void;

  // Quotations
  createQuotation: (quote: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => Quotation;
  convertQuoteToSubscription: (quoteId: string) => Subscription | null;

  // Products, Plans, Customers
  createProduct: (prod: Omit<Product, 'id'>) => Product;
  updateProduct: (prod: Product) => void;
  deleteProduct: (id: string) => void;
  createPlan: (plan: Omit<SubscriptionPlan, 'id'>) => SubscriptionPlan;
  updatePlan: (plan: SubscriptionPlan) => void;
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => { success: boolean; error?: string };
  addUser: (userData: Omit<User, 'id' | 'avatarText'>) => User;

  // Global Cross-App Search
  searchAll: (query: string) => {
    customers: Customer[];
    subscriptions: Subscription[];
    invoices: Invoice[];
  };

  // Metrics (in integer paise)
  metrics: {
    activeSubscriptionsCount: number;
    mrr: number;
    billedTotal: number;
    collectedTotal: number;
    outstandingTotal: number;
    overdueTotal: number;
    collectionEfficiency: number;
    avgCollectionDays: number;
  };

  resetToDefaultData: () => void;
  refreshData: () => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(() => api.getCurrentUser());
  const [settings, setSettingsState] = useState<OrganizationSettings>(() => api.getSettings());
  const [users, setUsersState] = useState<User[]>(() => api.getUsers(currentUser));
  const [customers, setCustomersState] = useState<Customer[]>(() => api.getCustomers(currentUser));
  const [products, setProductsState] = useState<Product[]>(() => api.getProducts());
  const [plans, setPlansState] = useState<SubscriptionPlan[]>(() => api.getPlans());
  const [rules, setRulesState] = useState<DiscountTaxRule[]>(() => api.getRules());
  const [subscriptions, setSubscriptionsState] = useState<Subscription[]>(() => api.getSubscriptions(currentUser));
  const [invoices, setInvoicesState] = useState<Invoice[]>(() => api.getInvoices(currentUser));
  const [payments, setPaymentsState] = useState<PaymentRecord[]>(() => api.getPayments(currentUser));
  const [quotations, setQuotationsState] = useState<Quotation[]>(() => api.getQuotations(currentUser));
  const [auditLogs, setAuditLogsState] = useState<AuditLogEntry[]>(() => api.getAuditLogs());
  const [outbox, setOutboxState] = useState<OutboxItem[]>(() => api.getOutbox());
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('brightloop_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Re-sync all state from the API service layer
  const refreshData = useCallback(() => {
    const user = api.getCurrentUser();
    setCurrentUserState(user);
    setSettingsState(api.getSettings());
    setUsersState(api.getUsers(user));
    setCustomersState(api.getCustomers(user));
    setProductsState(api.getProducts());
    setPlansState(api.getPlans());
    setRulesState(api.getRules());
    setSubscriptionsState(api.getSubscriptions(user));
    setInvoicesState(api.getInvoices(user));
    setPaymentsState(api.getPayments(user));
    setQuotationsState(api.getQuotations(user));
    setAuditLogsState(api.getAuditLogs());
    setOutboxState(api.getOutbox());
  }, []);

  // Sync on mount and when currentUser changes
  useEffect(() => {
    refreshData();
  }, [currentUser.id, refreshData]);

  // Auth methods
  const switchUser = (userId: string) => {
    const user = api.setCurrentUser(userId);
    setCurrentUserState(user);
    refreshData();
  };

  const login = (email: string, password?: string) => {
    const res = api.login(email, password);
    if (res.success && res.user) {
      setCurrentUserState(res.user);
      refreshData();
    }
    return res;
  };

  const register = (name: string, email: string, company: string, password?: string) => {
    const res = api.register(name, email, company, password);
    if (res.success && res.user) {
      setCurrentUserState(res.user);
      refreshData();
    }
    return res;
  };

  const logout = () => {
    api.logout();
    setCurrentUserState({
      id: 'guest',
      name: 'Guest',
      email: '',
      role: 'Customer',
      avatarText: 'GU',
      isActive: false,
    });
    refreshData();
  };

  const addStaff = (staffData: { name: string; email: string; role: 'Staff' | 'Admin'; password: string }) => {
    const res = api.addStaff(currentUser, staffData);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const requestPasswordReset = (email: string) => {
    const res = api.requestPasswordReset(email);
    refreshData();
    return res;
  };

  const resetPassword = (token: string, newPassword: string) => {
    const res = api.resetPasswordWithToken(token, newPassword);
    refreshData();
    return res;
  };

  const changePassword = (newPassword: string) => {
    const pwCheck = api.validatePassword(newPassword);
    if (!pwCheck.valid) {
      return { success: false, error: 'Password does not meet required security standards.' };
    }
    return { success: true };
  };

  // Settings
  const updateSettings = (newSettings: OrganizationSettings) => {
    const res = api.updateSettings(currentUser, newSettings);
    if (res.success) {
      setSettingsState(newSettings);
      refreshData();
    }
    return res;
  };

  // Subscriptions
  const createSubscription = (subData: Omit<Subscription, 'id'>) => {
    const res = api.createSubscription(currentUser, subData);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const updateSubscription = (sub: Subscription) => {
    api.updateSubscription(currentUser, sub);
    refreshData();
  };

  const updateSubscriptionStatus = (id: string, status: SubscriptionStatus) => {
    const res = api.transitionSubscriptionStatus(currentUser, id, status);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const pauseSubscription = (id: string) => {
    const res = api.pauseSubscription(currentUser, id);
    if (res.success) refreshData();
    return res;
  };

  const resumeSubscription = (id: string) => {
    const res = api.resumeSubscription(currentUser, id);
    if (res.success) refreshData();
    return res;
  };

  const renewSubscription = (id: string) => {
    const res = api.renewSubscription(currentUser, id);
    if (res.success) refreshData();
    return res;
  };

  const closeSubscriptionEarly = (id: string) => {
    const res = api.closeSubscriptionEarly(currentUser, id);
    if (res.success) refreshData();
    return res;
  };

  // Invoices & Billing
  const previewBillingRun = () => {
    return api.previewBillingRun(currentUser);
  };

  const runBillingRun = (billingPeriod: string) => {
    const res = api.executeBillingRun(currentUser, billingPeriod);
    if (res.success) {
      refreshData();
    }
    return {
      success: res.success,
      createdCount: res.createdCount,
      skippedCount: res.skippedCount,
      totalBilledPaise: res.totalBilledPaise,
      message: res.createdCount > 0
        ? `Successfully generated ${res.createdCount} draft invoices (${res.skippedCount} skipped as already billed for ${billingPeriod}).`
        : `Billing run complete: All active subscriptions already billed for ${billingPeriod}. Exactly 0 duplicates created.`,
    };
  };

  const confirmInvoice = (id: string) => {
    const res = api.confirmInvoice(currentUser, id);
    if (res.success) refreshData();
    return res;
  };

  const cancelInvoice = (id: string) => {
    const res = api.cancelInvoice(currentUser, id);
    if (res.success) refreshData();
    return res;
  };

  const sendInvoice = (id: string) => {
    const res = api.sendInvoice(currentUser, id);
    if (res.success) refreshData();
    return res;
  };

  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const invoicesList = api.getInvoices(currentUser);
    const invNumber = `INV-2026-${String(invoicesList.length + 201).padStart(4, '0')}`;
    const newInv: Invoice = {
      ...invData,
      id: invNumber,
      invoiceNumber: invNumber,
    };
    const allInvs = [newInv, ...invoicesList];
    localStorage.setItem('brightloop_invoices', JSON.stringify(allInvs));
    refreshData();
    return newInv;
  };

  // Payments
  const recordPayment = (paymentData: {
    invoiceId: string;
    amount: number; // in integer paise
    method: PaymentMethod;
    referenceNumber: string;
    receivedDate: string;
    note?: string;
  }) => {
    const res = api.recordPayment(currentUser, {
      invoiceId: paymentData.invoiceId,
      amountPaise: paymentData.amount,
      method: paymentData.method,
      referenceNumber: paymentData.referenceNumber,
      receivedDate: paymentData.receivedDate,
      note: paymentData.note,
    });
    if (res.success) {
      refreshData();
    }
    return res;
  };

  // Rules
  const createRule = (ruleData: Omit<DiscountTaxRule, 'id' | 'usedCount'>) => {
    const created = api.createRule(currentUser, ruleData);
    refreshData();
    return created;
  };

  const updateRule = (rule: DiscountTaxRule) => {
    api.updateRule(currentUser, rule);
    refreshData();
  };

  const deleteRule = (id: string) => {
    api.deleteRule(currentUser, id);
    refreshData();
  };

  // Quotations
  const createQuotation = (quoteData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => {
    const created = api.createQuotation(currentUser, quoteData);
    refreshData();
    return created;
  };

  const convertQuoteToSubscription = (quoteId: string) => {
    const res = api.convertQuoteToSubscription(currentUser, quoteId);
    if (res.success && res.subscription) {
      refreshData();
      return res.subscription;
    }
    return null;
  };

  // Products & Plans & Customers
  const createProduct = (prodData: Omit<Product, 'id'>) => {
    const created = api.createProduct(currentUser, prodData);
    refreshData();
    return created;
  };

  const updateProduct = (prod: Product) => {
    api.updateProduct(currentUser, prod);
    refreshData();
  };

  const deleteProduct = (id: string) => {
    api.deleteProduct(currentUser, id);
    refreshData();
  };

  const createPlan = (planData: Omit<SubscriptionPlan, 'id'>) => {
    const created = api.createPlan(currentUser, planData);
    refreshData();
    return created;
  };

  const updatePlan = (plan: SubscriptionPlan) => {
    api.updatePlan(currentUser, plan);
    refreshData();
  };

  const createCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>) => {
    const created = api.createCustomer(currentUser, custData);
    refreshData();
    return created;
  };

  const updateCustomer = (cust: Customer) => {
    const res = api.updateCustomer(currentUser, cust);
    if (res.success) refreshData();
    return res;
  };

  const addUser = (userData: Omit<User, 'id' | 'avatarText'>) => {
    const res = api.addStaff(currentUser, {
      name: userData.name,
      email: userData.email,
      role: (userData.role as 'Staff' | 'Admin') || 'Staff',
      password: 'Staff@Brightloop2026!',
    });
    refreshData();
    return res.user || {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarText: userData.name.substring(0, 2).toUpperCase(),
    };
  };

  // Search
  const searchAll = (query: string) => {
    return api.searchAll(currentUser, query);
  };

  // Reset
  const resetToDefaultData = () => {
    api.resetAllData();
    refreshData();
  };

  // Computed Live Metrics in integer paise
  const metrics = useMemo(() => {
    return api.getFinancialMetrics(currentUser);
  }, [currentUser, subscriptions, invoices]);

  // Notifications
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    // 1. Overdue invoices
    const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
    overdueInvoices.slice(0, 3).forEach((inv) => {
      list.push({
        id: `notif-overdue-${inv.id}`,
        title: 'Invoice Overdue',
        message: `${inv.invoiceNumber} for ${inv.customerName} is past due date.`,
        type: 'danger',
        timestamp: inv.dueDate,
        read: readNotificationIds.includes(`notif-overdue-${inv.id}`),
        linkPage: 'invoices',
        linkId: inv.id,
      });
    });

    // 2. Recent payments
    payments.slice(0, 3).forEach((p) => {
      list.push({
        id: `notif-pay-${p.id}`,
        title: 'Payment Cleared',
        message: `₹${(p.amount / 100).toLocaleString('en-IN')} received for ${p.invoiceNumber}.`,
        type: 'success',
        timestamp: p.receivedDate,
        read: readNotificationIds.includes(`notif-pay-${p.id}`),
        linkPage: 'payments',
        linkId: p.id,
      });
    });

    // 3. Outbox notices
    outbox.slice(0, 2).forEach((o) => {
      list.push({
        id: `notif-outbox-${o.id}`,
        title: o.type === 'INVOICE' ? 'Invoice Dispatched' : 'Notification Sent',
        message: `${o.subject} to ${o.recipient}`,
        type: 'info',
        timestamp: o.timestamp.substring(0, 10),
        read: readNotificationIds.includes(`notif-outbox-${o.id}`),
      });
    });

    return list;
  }, [invoices, payments, outbox, readNotificationIds]);

  const markNotificationAsRead = (id: string) => {
    const updated = [...readNotificationIds, id];
    setReadNotificationIds(updated);
    localStorage.setItem('brightloop_read_notifications', JSON.stringify(updated));
  };

  const markAllNotificationsAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    localStorage.setItem('brightloop_read_notifications', JSON.stringify(allIds));
  };

  return (
    <BillingContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser: (u) => setCurrentUserState(u),
        switchUser,
        login,
        register,
        logout,
        addStaff,
        requestPasswordReset,
        resetPassword,
        changePassword,
        validatePassword: api.validatePassword,
        settings,
        updateSettings,
        customers,
        products,
        plans,
        rules,
        subscriptions,
        invoices,
        payments,
        quotations,
        auditLogs,
        outbox,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        createSubscription,
        updateSubscription,
        updateSubscriptionStatus,
        pauseSubscription,
        resumeSubscription,
        renewSubscription,
        closeSubscriptionEarly,
        previewBillingRun,
        runBillingRun,
        confirmInvoice,
        cancelInvoice,
        sendInvoice,
        createInvoice,
        recordPayment,
        createRule,
        updateRule,
        deleteRule,
        createQuotation,
        convertQuoteToSubscription,
        createProduct,
        updateProduct,
        deleteProduct,
        createPlan,
        updatePlan,
        createCustomer,
        updateCustomer,
        addUser,
        searchAll,
        metrics,
        resetToDefaultData,
        refreshData,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
