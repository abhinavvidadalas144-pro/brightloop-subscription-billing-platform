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
  PasswordResetToken,
} from '../types';

import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_RULES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_QUOTATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_OUTBOX,
} from '../data/mockData';

const STORAGE_KEYS = {
  SETTINGS: 'brightloop_settings',
  USERS: 'brightloop_users',
  CURRENT_USER_ID: 'brightloop_current_user_id',
  CUSTOMERS: 'brightloop_customers',
  PRODUCTS: 'brightloop_products',
  PLANS: 'brightloop_plans',
  RULES: 'brightloop_rules',
  SUBSCRIPTIONS: 'brightloop_subscriptions',
  INVOICES: 'brightloop_invoices',
  PAYMENTS: 'brightloop_payments',
  QUOTATIONS: 'brightloop_quotations',
  AUDIT_LOGS: 'brightloop_audit_logs',
  OUTBOX: 'brightloop_outbox',
  PASSWORD_TOKENS: 'brightloop_pwd_tokens',
  NOTIFICATIONS_READ: 'brightloop_read_notifications',
};

// Safe storage utilities
function getStored<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // ignore
  }
}

// Simple deterministic hash for password tokens (SHA-256 equivalent simulation)
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16) + '_' + str.length;
}

// Audit logger helper
function recordAuditLog(
  user: User,
  action: string,
  entityType: AuditLogEntry['entityType'],
  entityId: string,
  details: string
) {
  const logs = getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: dateStr,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType,
    entityId,
    details,
  };
  setStored(STORAGE_KEYS.AUDIT_LOGS, [entry, ...logs]);
}

// Outbox logger helper
function recordOutbox(
  recipient: string,
  subject: string,
  type: OutboxItem['type'],
  payload: Record<string, any>
) {
  const outbox = getStored<OutboxItem[]>(STORAGE_KEYS.OUTBOX, INITIAL_OUTBOX);
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
  const item: OutboxItem = {
    id: `outbox-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: dateStr,
    recipient,
    subject,
    type,
    payload,
    status: 'Sent',
  };
  setStored(STORAGE_KEYS.OUTBOX, [item, ...outbox]);
  console.log(`[Brightloop In-App Outbox] ${type} sent to ${recipient}: ${subject}`, payload);
}

// Overdue evaluator: Updates confirmed invoices past due date to Overdue if autoDunning enabled
function evaluateOverdueInvoices() {
  const settings = getStored<OrganizationSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  if (!settings.autoDunning) return;

  const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  const today = new Date().toISOString().split('T')[0];
  let changed = false;

  const updated = invoices.map((inv) => {
    if (inv.status === 'Confirmed' && inv.dueDate < today && inv.balance > 0) {
      changed = true;
      return { ...inv, status: 'Overdue' as InvoiceStatus };
    }
    return inv;
  });

  if (changed) {
    setStored(STORAGE_KEYS.INVOICES, updated);
  }
}

// Execute overdue evaluation on module load
evaluateOverdueInvoices();

export const api = {
  // -------------------------------------------------------------
  // Settings API
  // -------------------------------------------------------------
  getSettings(): OrganizationSettings {
    return getStored<OrganizationSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSettings(user: User, newSettings: OrganizationSettings): { success: boolean; error?: string } {
    if (user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized: Only an Administrator can update organization settings.' };
    }
    // GSTIN Validation: 15 alphanumeric characters
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(newSettings.gstin.trim())) {
      return { success: false, error: 'Invalid GSTIN format. Must be a valid 15-character Indian GSTIN (e.g. 27AABCB9876C1Z4).' };
    }

    setStored(STORAGE_KEYS.SETTINGS, newSettings);
    recordAuditLog(user, 'Settings Updated', 'Settings', 'global', `Updated organization tax profile & bank details (${newSettings.companyName})`);
    return { success: true };
  },

  resetAllData(): void {
    localStorage.clear();
    setStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStored(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
    setStored(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setStored(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    setStored(STORAGE_KEYS.RULES, INITIAL_RULES);
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    setStored(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    setStored(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    setStored(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setStored(STORAGE_KEYS.OUTBOX, INITIAL_OUTBOX);
  },

  // -------------------------------------------------------------
  // Auth & Roles API
  // -------------------------------------------------------------
  getCurrentUser(): User {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const currId = getStored<string>(STORAGE_KEYS.CURRENT_USER_ID, users[0].id);
    const found = users.find((u) => u.id === currId);
    return found || users[0];
  },

  setCurrentUser(userId: string): User {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const found = users.find((u) => u.id === userId);
    if (found) {
      setStored(STORAGE_KEYS.CURRENT_USER_ID, found.id);
      return found;
    }
    return users[0];
  },

  getUsers(currentUser: User): User[] {
    // Only Admin can see full user accounts list
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (currentUser.role === 'Admin') {
      return users;
    }
    return users.filter((u) => u.id === currentUser.id);
  },

  validatePassword(password: string): {
    valid: boolean;
    hasLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasSpecial: boolean;
  } {
    const hasLength = (password || '').length > 8; // More than 8 chars per rule
    const hasUpper = /[A-Z]/.test(password || '');
    const hasLower = /[a-z]/.test(password || '');
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+]/.test(password || '');
    return {
      valid: hasLength && hasUpper && hasLower && hasSpecial,
      hasLength,
      hasUpper,
      hasLower,
      hasSpecial,
    };
  },

  login(email: string, password?: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      return { success: false, error: 'No registered user found with this email address.' };
    }

    if (password) {
      const pwValid = this.validatePassword(password);
      if (!pwValid.valid) {
        return { success: false, error: 'Password does not meet required security standards.' };
      }
    }

    setStored(STORAGE_KEYS.CURRENT_USER_ID, existing.id);
    recordAuditLog(existing, 'User Signed In', 'Auth', existing.id, `User ${existing.name} (${existing.role}) signed in`);
    return { success: true, user: existing };
  },

  register(
    name: string,
    email: string,
    company: string,
    password?: string
  ): { success: boolean; user?: User; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    if (password) {
      const pwCheck = this.validatePassword(password);
      if (!pwCheck.valid) {
        return { success: false, error: 'Password must be more than 8 characters and include uppercase, lowercase, and a special character.' };
      }
    }

    const customers = getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const newCustId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      id: newCustId,
      name: company || `${name}'s Company`,
      contactPerson: name,
      email: cleanEmail,
      phone: '+91 98000 00000',
      address: 'Corporate Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstin: '27AABCB0000A1Z5',
      paymentMethod: { type: 'Card', brand: 'VISA', last4: '4242', expiry: '12/28' },
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Public registration always creates a Customer role per requirement
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: cleanEmail,
      role: 'Customer',
      company: company || `${name}'s Company`,
      customerId: newCustId,
      avatarText: initials || 'CU',
      avatarColor: 'bg-[#0B2E2B]',
    };

    setStored(STORAGE_KEYS.CUSTOMERS, [newCustomer, ...customers]);
    setStored(STORAGE_KEYS.USERS, [...users, newUser]);
    setStored(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

    recordAuditLog(newUser, 'Customer Registered', 'Auth', newUser.id, `New customer account created for ${company}`);
    return { success: true, user: newUser };
  },

  addStaff(
    adminUser: User,
    staffData: { name: string; email: string; role: 'Staff' | 'Admin'; password: string }
  ): { success: boolean; user?: User; error?: string } {
    if (adminUser.role !== 'Admin') {
      return { success: false, error: 'Unauthorized: Only an Administrator can add internal staff.' };
    }

    const cleanEmail = (staffData.email || '').trim().toLowerCase();
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'A staff member or user with this email already exists.' };
    }

    const pwCheck = this.validatePassword(staffData.password);
    if (!pwCheck.valid) {
      return { success: false, error: 'Password does not meet required security standards.' };
    }

    const initials = staffData.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newStaff: User = {
      id: `user-staff-${Date.now()}`,
      name: staffData.name,
      email: cleanEmail,
      role: staffData.role,
      company: 'Brightloop Technologies',
      avatarText: initials || 'ST',
      avatarColor: staffData.role === 'Admin' ? 'bg-[#0B2E2B]' : 'bg-slate-700',
    };

    setStored(STORAGE_KEYS.USERS, [...users, newStaff]);
    recordAuditLog(adminUser, 'Staff Member Provisioned', 'Auth', newStaff.id, `Added ${staffData.name} as ${staffData.role}`);
    return { success: true, user: newStaff };
  },

  requestPasswordReset(email: string): { success: boolean; message: string; token?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      // Do not reveal email existence
      return { success: true, message: 'If an account exists with this email, a password reset link was sent.' };
    }

    const rawToken = 'bl_reset_' + Math.random().toString(36).substring(2) + Date.now();
    const tokenHash = hashString(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes expiry

    const tokens = getStored<PasswordResetToken[]>(STORAGE_KEYS.PASSWORD_TOKENS, []);
    const newTokenRecord: PasswordResetToken = {
      tokenHash,
      tokenRaw: rawToken,
      email: cleanEmail,
      expiresAt,
      used: false,
    };
    setStored(STORAGE_KEYS.PASSWORD_TOKENS, [newTokenRecord, ...tokens]);

    // Record in-app Outbox and console per instructions
    const resetUrl = `https://brightloop.internal/reset-password?token=${rawToken}`;
    recordOutbox(cleanEmail, 'Password Reset Link for Brightloop', 'PASSWORD_RESET', {
      resetUrl,
      expiresInMinutes: 30,
      tokenHash,
    });

    return { success: true, message: 'Password reset link sent to your registered email.', token: rawToken };
  },

  resetPasswordWithToken(
    tokenRaw: string,
    newPassword: string
  ): { success: boolean; error?: string } {
    const pwCheck = this.validatePassword(newPassword);
    if (!pwCheck.valid) {
      return { success: false, error: 'Password does not meet required security standards.' };
    }

    const tokenHash = hashString(tokenRaw);
    const tokens = getStored<PasswordResetToken[]>(STORAGE_KEYS.PASSWORD_TOKENS, []);
    const match = tokens.find((t) => t.tokenHash === tokenHash && !t.used);

    if (!match) {
      return { success: false, error: 'Invalid or expired password reset link.' };
    }

    if (new Date() > new Date(match.expiresAt)) {
      return { success: false, error: 'This password reset link has expired (30 minute limit).' };
    }

    // Mark token as used (single-use)
    const updatedTokens = tokens.map((t) => (t.tokenHash === tokenHash ? { ...t, used: true } : t));
    setStored(STORAGE_KEYS.PASSWORD_TOKENS, updatedTokens);

    recordOutbox(match.email, 'Password Changed Successfully', 'PASSWORD_RESET', {
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  },

  // -------------------------------------------------------------
  // Customers API (Enforces Tenant Isolation for Customer Role)
  // -------------------------------------------------------------
  getCustomers(user: User): Customer[] {
    const customers = getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    if (user.role === 'Customer') {
      return customers.filter((c) => c.id === user.customerId);
    }
    return customers;
  },

  getCustomerById(user: User, id: string): Customer | null {
    const all = this.getCustomers(user);
    return all.find((c) => c.id === id) || null;
  },

  createCustomer(user: User, custData: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const customers = getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStored(STORAGE_KEYS.CUSTOMERS, [newCust, ...customers]);
    recordAuditLog(user, 'Customer Created', 'Customer', newCust.id, `Created customer record for ${newCust.name}`);
    return newCust;
  },

  updateCustomer(user: User, cust: Customer): { success: boolean; error?: string } {
    if (user.role === 'Customer' && cust.id !== user.customerId) {
      return { success: false, error: 'Unauthorized: Cannot modify other customer profiles.' };
    }
    const customers = getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const updated = customers.map((c) => (c.id === cust.id ? cust : c));
    setStored(STORAGE_KEYS.CUSTOMERS, updated);
    recordAuditLog(user, 'Customer Updated', 'Customer', cust.id, `Updated profile for ${cust.name}`);
    return { success: true };
  },

  // -------------------------------------------------------------
  // Products & Variants API (Admin Only)
  // -------------------------------------------------------------
  getProducts(): Product[] {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  createProduct(user: User, prodData: Omit<Product, 'id'>): Product {
    const prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const newP: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setStored(STORAGE_KEYS.PRODUCTS, [newP, ...prods]);
    recordAuditLog(user, 'Product Created', 'Product', newP.id, `Created product ${newP.name} (${newP.type})`);
    return newP;
  },

  updateProduct(user: User, prod: Product): void {
    const prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const updated = prods.map((p) => (p.id === prod.id ? prod : p));
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    recordAuditLog(user, 'Product Updated', 'Product', prod.id, `Updated product ${prod.name}`);
  },

  deleteProduct(user: User, id: string): void {
    const prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    // Soft archive or remove
    const updated = prods.filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    recordAuditLog(user, 'Product Deleted', 'Product', id, `Removed product ${id}`);
  },

  // -------------------------------------------------------------
  // Subscription Plans API (Admin Only for Mutations)
  // -------------------------------------------------------------
  getPlans(): SubscriptionPlan[] {
    return getStored<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  },

  createPlan(user: User, planData: Omit<SubscriptionPlan, 'id'>): SubscriptionPlan {
    const plans = getStored<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    const newPlan: SubscriptionPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setStored(STORAGE_KEYS.PLANS, [newPlan, ...plans]);
    recordAuditLog(user, 'Plan Created', 'Plan', newPlan.id, `Created plan ${newPlan.name} (${newPlan.billingFrequency})`);
    return newPlan;
  },

  updatePlan(user: User, plan: SubscriptionPlan): void {
    const plans = getStored<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    const updated = plans.map((p) => (p.id === plan.id ? plan : p));
    setStored(STORAGE_KEYS.PLANS, updated);
    recordAuditLog(user, 'Plan Updated', 'Plan', plan.id, `Updated plan ${plan.name}`);
  },

  // -------------------------------------------------------------
  // Discounts & Tax Rules API
  // -------------------------------------------------------------
  getRules(): DiscountTaxRule[] {
    return getStored<DiscountTaxRule[]>(STORAGE_KEYS.RULES, INITIAL_RULES);
  },

  createRule(user: User, ruleData: Omit<DiscountTaxRule, 'id' | 'usedCount'>): DiscountTaxRule {
    const rules = getStored<DiscountTaxRule[]>(STORAGE_KEYS.RULES, INITIAL_RULES);
    const newRule: DiscountTaxRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      usedCount: 0,
    };
    setStored(STORAGE_KEYS.RULES, [newRule, ...rules]);
    recordAuditLog(user, 'Rule Created', 'Rule', newRule.id, `Created ${newRule.type} rule: ${newRule.name}`);
    return newRule;
  },

  updateRule(user: User, rule: DiscountTaxRule): void {
    const rules = getStored<DiscountTaxRule[]>(STORAGE_KEYS.RULES, INITIAL_RULES);
    const updated = rules.map((r) => (r.id === rule.id ? rule : r));
    setStored(STORAGE_KEYS.RULES, updated);
    recordAuditLog(user, 'Rule Updated', 'Rule', rule.id, `Updated rule ${rule.name}`);
  },

  deleteRule(user: User, id: string): void {
    const rules = getStored<DiscountTaxRule[]>(STORAGE_KEYS.RULES, INITIAL_RULES);
    const updated = rules.filter((r) => r.id !== id);
    setStored(STORAGE_KEYS.RULES, updated);
    recordAuditLog(user, 'Rule Deleted', 'Rule', id, `Deleted rule ${id}`);
  },

  // -------------------------------------------------------------
  // Subscriptions API (with Strict Lifecycle Transitions & Flag Checks)
  // -------------------------------------------------------------
  getSubscriptions(user: User): Subscription[] {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    if (user.role === 'Customer') {
      return subs.filter((s) => s.customerId === user.customerId);
    }
    return subs;
  },

  createSubscription(
    user: User,
    subData: Omit<Subscription, 'id'>
  ): { success: boolean; subscription?: Subscription; error?: string } {
    const plans = this.getPlans();
    const targetPlan = plans.find((p) => p.id === subData.planId);

    // Enforce plan minimum quantity
    if (targetPlan && targetPlan.minQuantity > 1) {
      const seatLine = subData.lines.find((l) => l.productId.includes('seat') || (l.quantity || 1) >= targetPlan.minQuantity);
      const totalQty = subData.lines.reduce((sum, l) => sum + (l.quantity || 1), 0);
      if (totalQty < targetPlan.minQuantity && (!seatLine || (seatLine.quantity || 1) < targetPlan.minQuantity)) {
        return {
          success: false,
          error: `Plan '${targetPlan.name}' requires a minimum quantity of ${targetPlan.minQuantity} units.`,
        };
      }
    }

    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const nextNum = subs.length + 100;
    const newId = `SUB-${String(nextNum).padStart(4, '0')}`;

    const newSub: Subscription = {
      ...subData,
      id: newId,
      status: 'Draft', // initial state always Draft per lifecycle rules
    };

    setStored(STORAGE_KEYS.SUBSCRIPTIONS, [newSub, ...subs]);
    recordAuditLog(user, 'Subscription Created', 'Subscription', newSub.id, `Created subscription ${newSub.id} for ${newSub.customerName}`);
    return { success: true, subscription: newSub };
  },

  updateSubscription(user: User, sub: Subscription): void {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const updated = subs.map((s) => (s.id === sub.id ? sub : s));
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, updated);
    recordAuditLog(user, 'Subscription Updated', 'Subscription', sub.id, `Updated subscription details for ${sub.id}`);
  },

  transitionSubscriptionStatus(
    user: User,
    id: string,
    newStatus: SubscriptionStatus
  ): { success: boolean; error?: string } {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const sub = subs.find((s) => s.id === id);

    if (!sub) {
      return { success: false, error: 'Subscription not found.' };
    }

    // Role check: Customers cannot change status directly except through specific allowed plan actions
    if (user.role === 'Customer' && user.customerId !== sub.customerId) {
      return { success: false, error: 'Unauthorized: Cannot modify other customer subscriptions.' };
    }

    // Strict status lifecycle check: Draft → Quotation → Confirmed → Active → Closed
    const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
      Draft: ['Quotation'],
      Quotation: ['Confirmed', 'Draft'],
      Confirmed: ['Active', 'Closed'],
      Active: ['Closed'],
      Closed: ['Confirmed'], // renewal
    };

    const validTargets = ALLOWED_TRANSITIONS[sub.status] || [];
    if (!validTargets.includes(newStatus)) {
      return {
        success: false,
        error: `Invalid lifecycle transition from '${sub.status}' to '${newStatus}'. Permitted transitions: ${validTargets.join(', ')}.`,
      };
    }

    const updated = subs.map((s) => (s.id === id ? { ...s, status: newStatus } : s));
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, updated);
    recordAuditLog(user, 'Subscription Status Changed', 'Subscription', id, `Transitioned status from ${sub.status} to ${newStatus}`);
    return { success: true };
  },

  pauseSubscription(user: User, id: string): { success: boolean; error?: string } {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const sub = subs.find((s) => s.id === id);
    if (!sub) return { success: false, error: 'Subscription not found.' };

    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.allowPause) {
      return { success: false, error: `Plan '${sub.planName}' does not permit pausing subscriptions.` };
    }

    const updated = subs.map((s) =>
      s.id === id
        ? {
            ...s,
            isPaused: true,
            pausedAt: new Date().toISOString().split('T')[0],
          }
        : s
    );
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, updated);
    recordAuditLog(user, 'Subscription Paused', 'Subscription', id, `Paused recurring billing for ${id}`);
    return { success: true };
  },

  resumeSubscription(user: User, id: string): { success: boolean; error?: string } {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const sub = subs.find((s) => s.id === id);
    if (!sub) return { success: false, error: 'Subscription not found.' };

    const updated = subs.map((s) => (s.id === id ? { ...s, isPaused: false, pausedAt: undefined } : s));
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, updated);
    recordAuditLog(user, 'Subscription Resumed', 'Subscription', id, `Resumed recurring billing for ${id}`);
    return { success: true };
  },

  renewSubscription(user: User, id: string): { success: boolean; error?: string } {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const sub = subs.find((s) => s.id === id);
    if (!sub) return { success: false, error: 'Subscription not found.' };

    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.allowRenewal) {
      return { success: false, error: `Plan '${sub.planName}' does not permit contract renewals.` };
    }

    // Advance renewal date by 1 billing cycle period
    const currRenewal = new Date(sub.renewalDate || new Date());
    if (sub.billingFrequency === 'yearly') {
      currRenewal.setFullYear(currRenewal.getFullYear() + 1);
    } else if (sub.billingFrequency === 'weekly') {
      currRenewal.setDate(currRenewal.getDate() + 7);
    } else if (sub.billingFrequency === 'daily') {
      currRenewal.setDate(currRenewal.getDate() + 1);
    } else {
      currRenewal.setMonth(currRenewal.getMonth() + 1);
    }

    const updated = subs.map((s) =>
      s.id === id
        ? {
            ...s,
            status: 'Active' as SubscriptionStatus,
            renewalDate: currRenewal.toISOString().split('T')[0],
            nextBillingDate: currRenewal.toISOString().split('T')[0],
          }
        : s
    );
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, updated);
    recordAuditLog(user, 'Subscription Renewed', 'Subscription', id, `Renewed subscription ${id} through ${currRenewal.toISOString().split('T')[0]}`);
    return { success: true };
  },

  closeSubscriptionEarly(user: User, id: string): { success: boolean; error?: string } {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const sub = subs.find((s) => s.id === id);
    if (!sub) return { success: false, error: 'Subscription not found.' };

    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === sub.planId);
    if (plan && !plan.allowEarlyClose) {
      return { success: false, error: `Plan '${sub.planName}' does not allow early contract termination.` };
    }

    const updated = subs.map((s) => (s.id === id ? { ...s, status: 'Closed' as SubscriptionStatus } : s));
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, updated);
    recordAuditLog(user, 'Subscription Closed Early', 'Subscription', id, `Terminated subscription ${id} early`);
    return { success: true };
  },

  // -------------------------------------------------------------
  // Quotations API
  // -------------------------------------------------------------
  getQuotations(user: User): Quotation[] {
    const quotes = getStored<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    if (user.role === 'Customer') {
      return quotes.filter((q) => q.customerId === user.customerId);
    }
    return quotes;
  },

  createQuotation(user: User, quoteData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>): Quotation {
    const quotes = getStored<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    const qNum = `QUO-2026-${String(quotes.length + 50).padStart(4, '0')}`;
    const newQ: Quotation = {
      ...quoteData,
      id: qNum,
      quotationNumber: qNum,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStored(STORAGE_KEYS.QUOTATIONS, [newQ, ...quotes]);
    recordAuditLog(user, 'Quotation Generated', 'Quotation', newQ.id, `Created quotation ${newQ.quotationNumber} for ${newQ.customerName}`);
    return newQ;
  },

  convertQuoteToSubscription(
    user: User,
    quoteId: string
  ): { success: boolean; subscription?: Subscription; error?: string } {
    const quotes = getStored<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return { success: false, error: 'Quotation not found.' };

    // Validity check: An expired quotation cannot be confirmed
    const today = new Date().toISOString().split('T')[0];
    if (quote.validUntil < today || quote.status === 'Expired') {
      return {
        success: false,
        error: `Quotation ${quote.quotationNumber} expired on ${quote.validUntil} and cannot be converted.`,
      };
    }

    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === quote.planId) || plans[0];

    const lines = quote.lines.map((l, i) => ({
      id: `ln-conv-${Date.now()}-${i}`,
      productId: l.productId,
      item: l.productName,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      amount: l.amount,
    }));

    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const newSubId = `SUB-${String(subs.length + 100).padStart(4, '0')}`;
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const newSub: Subscription = {
      id: newSubId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      planId: plan.id,
      planName: plan.name,
      billingFrequency: plan.billingFrequency,
      startDate: today,
      renewalDate: renewalDate.toISOString().split('T')[0],
      paymentTerms: 'Net 15',
      status: 'Active',
      lines,
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      taxAmount: quote.taxAmount,
      totalAmount: quote.totalAmount,
      note: `Converted from quotation ${quote.quotationNumber}. ${quote.notes || ''}`,
      lastBilledDate: today,
      nextBillingDate: renewalDate.toISOString().split('T')[0],
    };

    setStored(STORAGE_KEYS.SUBSCRIPTIONS, [newSub, ...subs]);

    // Update quotation status
    const updatedQuotes = quotes.map((q) => (q.id === quoteId ? { ...q, status: 'Converted' as const } : q));
    setStored(STORAGE_KEYS.QUOTATIONS, updatedQuotes);

    recordAuditLog(user, 'Quotation Converted', 'Subscription', newSub.id, `Converted quotation ${quote.quotationNumber} into subscription ${newSub.id}`);
    return { success: true, subscription: newSub };
  },

  // -------------------------------------------------------------
  // Automated Billing Run Engine (Idempotent & Transactional)
  // -------------------------------------------------------------
  previewBillingRun(user: User): {
    eligibleSubscriptions: Subscription[];
    totalExpectedPaise: number;
    billingPeriod: string;
  } {
    const subs = this.getSubscriptions(user);
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const today = new Date().toISOString().split('T')[0];

    // Formulate current period: Month Year
    const now = new Date();
    const billingPeriod = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Filter Active, unpaused subscriptions whose next billing date is today or earlier
    // (Or for demo preview, all active unpaused subscriptions needing a cycle invoice)
    const eligibleSubscriptions = subs.filter((s) => {
      if (s.status !== 'Active' || s.isPaused) return false;
      // Duplicate prevention: check if invoice already created for this subscription and period
      const alreadyBilled = invoices.some(
        (inv) => inv.subscriptionId === s.id && inv.billingPeriod === billingPeriod
      );
      return !alreadyBilled;
    });

    const totalExpectedPaise = eligibleSubscriptions.reduce((acc, s) => acc + s.totalAmount, 0);

    return {
      eligibleSubscriptions,
      totalExpectedPaise,
      billingPeriod,
    };
  },

  executeBillingRun(
    user: User,
    billingPeriod: string
  ): {
    success: boolean;
    createdCount: number;
    skippedCount: number;
    totalBilledPaise: number;
    invoices: Invoice[];
  } {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const rules = this.getRules();
    const today = new Date().toISOString().split('T')[0];

    // 15 days payment terms
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 15);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const activeSubs = subs.filter((s) => s.status === 'Active' && !s.isPaused);
    let createdCount = 0;
    let skippedCount = 0;
    let totalBilledPaise = 0;
    const newInvoicesList: Invoice[] = [];

    // Atomic transaction execution across eligible subscriptions
    activeSubs.forEach((sub, idx) => {
      // Unique idempotent check on (subscriptionId, billingPeriod)
      const duplicate = invoices.some(
        (inv) => inv.subscriptionId === sub.id && inv.billingPeriod === billingPeriod
      );

      if (duplicate) {
        skippedCount++;
        return;
      }

      // Compute line items
      const lines = sub.lines.map((l, lIdx) => ({
        id: `il-gen-${Date.now()}-${lIdx}`,
        item: l.item,
        quantity: l.quantity || 1,
        unitPrice: l.unitPrice || l.amount,
        amount: l.amount,
      }));

      const subtotal = lines.reduce((acc, l) => acc + l.amount, 0);

      // Evaluate eligible discounts automatically
      let discountAmount = 0;
      let appliedDiscountRule: string | undefined = undefined;

      const activeDiscounts = rules.filter(
        (r) =>
          r.type === 'Discount' &&
          r.status === 'Active' &&
          (r.effectiveTo ? r.effectiveTo >= today : true) &&
          (r.usageLimit === null || r.usedCount < r.usageLimit) &&
          (r.minPurchase ? subtotal >= r.minPurchase : true)
      );

      if (activeDiscounts.length > 0) {
        const disc = activeDiscounts[0];
        if (disc.valueMode === 'Percentage') {
          discountAmount = Math.round((subtotal * disc.value) / 100);
        } else {
          discountAmount = Math.min(disc.value, subtotal);
        }
        appliedDiscountRule = disc.name;
        // Increment usage count atomically
        disc.usedCount += 1;
      }

      // Evaluate applicable taxes
      let taxAmount = 0;
      let appliedTaxRule: string | undefined = undefined;
      const activeTaxes = rules.filter((r) => r.type === 'Tax' && r.status === 'Active');

      if (activeTaxes.length > 0) {
        const tax = activeTaxes[0];
        const basis = Math.max(0, subtotal - discountAmount);
        if (tax.valueMode === 'Percentage') {
          taxAmount = Math.round((basis * tax.value) / 100);
        } else {
          taxAmount = tax.value;
        }
        appliedTaxRule = tax.name;
        tax.usedCount += 1;
      }

      const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);
      const invNumber = `INV-2026-${String(invoices.length + newInvoicesList.length + 201).padStart(4, '0')}`;

      const newInv: Invoice = {
        id: invNumber,
        invoiceNumber: invNumber,
        customerId: sub.customerId,
        customerName: sub.customerName,
        subscriptionId: sub.id,
        billingPeriod,
        issueDate: today,
        dueDate,
        lines,
        subtotal,
        discountAmount,
        discountRuleName: appliedDiscountRule,
        taxAmount,
        taxRuleName: appliedTaxRule,
        totalAmount,
        amountPaid: 0,
        balance: totalAmount,
        status: 'Draft',
        owner: user.role,
        sentDate: undefined,
        notes: `Generated by automated billing run for ${billingPeriod}.`,
        periodStart: today,
        periodEnd: dueDate,
      };

      newInvoicesList.push(newInv);
      totalBilledPaise += totalAmount;
      createdCount++;
    });

    if (newInvoicesList.length > 0) {
      setStored(STORAGE_KEYS.INVOICES, [...newInvoicesList, ...invoices]);
      setStored(STORAGE_KEYS.RULES, rules);

      // Advance subscription nextBillingDate for billed subscriptions
      const updatedSubs = subs.map((s) => {
        const wasBilled = newInvoicesList.some((inv) => inv.subscriptionId === s.id);
        if (wasBilled) {
          const nextDate = new Date();
          nextDate.setMonth(nextDate.getMonth() + 1);
          return {
            ...s,
            lastBilledDate: today,
            nextBillingDate: nextDate.toISOString().split('T')[0],
          };
        }
        return s;
      });
      setStored(STORAGE_KEYS.SUBSCRIPTIONS, updatedSubs);

      recordAuditLog(
        user,
        'Billing Run Executed',
        'Invoice',
        'batch',
        `Executed billing run for ${billingPeriod}: ${createdCount} created, ${skippedCount} skipped, total ${totalBilledPaise} paise`
      );
    }

    return {
      success: true,
      createdCount,
      skippedCount,
      totalBilledPaise,
      invoices: newInvoicesList,
    };
  },

  // -------------------------------------------------------------
  // Invoices API
  // -------------------------------------------------------------
  getInvoices(user: User): Invoice[] {
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    if (user.role === 'Customer') {
      return invoices.filter((inv) => inv.customerId === user.customerId);
    }
    return invoices;
  },

  confirmInvoice(user: User, id: string): { success: boolean; error?: string } {
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return { success: false, error: 'Invoice not found.' };

    if (inv.status !== 'Draft') {
      return { success: false, error: `Only Draft invoices can be confirmed. Current status: ${inv.status}` };
    }

    const updated = invoices.map((i) => (i.id === id ? { ...i, status: 'Confirmed' as InvoiceStatus } : i));
    setStored(STORAGE_KEYS.INVOICES, updated);
    recordAuditLog(user, 'Invoice Confirmed', 'Invoice', id, `Confirmed draft invoice ${inv.invoiceNumber}`);
    return { success: true };
  },

  cancelInvoice(user: User, id: string): { success: boolean; error?: string } {
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return { success: false, error: 'Invoice not found.' };

    if (inv.amountPaid > 0) {
      return {
        success: false,
        error: `Cannot cancel invoice ${inv.invoiceNumber} because payments of ₹${(inv.amountPaid / 100).toLocaleString('en-IN')} have already been recorded.`,
      };
    }

    const updated = invoices.map((i) => (i.id === id ? { ...i, status: 'Cancelled' as InvoiceStatus } : i));
    setStored(STORAGE_KEYS.INVOICES, updated);
    recordAuditLog(user, 'Invoice Cancelled', 'Invoice', id, `Cancelled invoice ${inv.invoiceNumber}`);
    return { success: true };
  },

  sendInvoice(user: User, id: string): { success: boolean; error?: string } {
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return { success: false, error: 'Invoice not found.' };

    const customers = getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const cust = customers.find((c) => c.id === inv.customerId);
    const recipient = cust?.email || `${inv.customerName.toLowerCase().replace(/\s+/g, '')}@example.com`;

    const now = new Date().toISOString().split('T')[0];
    const updated = invoices.map((i) => (i.id === id ? { ...i, sentDate: now } : i));
    setStored(STORAGE_KEYS.INVOICES, updated);

    recordOutbox(recipient, `Tax Invoice ${inv.invoiceNumber} from Brightloop`, 'INVOICE', {
      invoiceNumber: inv.invoiceNumber,
      totalAmountPaise: inv.totalAmount,
      dueDate: inv.dueDate,
      customerName: inv.customerName,
    });

    recordAuditLog(user, 'Invoice Sent', 'Invoice', id, `Emailed invoice ${inv.invoiceNumber} to ${recipient}`);
    return { success: true };
  },

  // -------------------------------------------------------------
  // Payments & Reconciliation API
  // -------------------------------------------------------------
  getPayments(user: User): PaymentRecord[] {
    const payments = getStored<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    if (user.role === 'Customer') {
      return payments.filter((p) => p.customerId === user.customerId);
    }
    return payments;
  },

  recordPayment(
    user: User,
    paymentData: {
      invoiceId: string;
      amountPaise?: number;
      amount?: number;
      method: PaymentMethod;
      referenceNumber: string;
      receivedDate: string;
      note?: string;
    }
  ): { success: boolean; error?: string; payment?: PaymentRecord } {
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const inv = invoices.find((i) => i.id === paymentData.invoiceId);
    const amt = paymentData.amountPaise ?? paymentData.amount ?? 0;

    if (!inv) {
      return { success: false, error: 'Invoice not found.' };
    }

    if (inv.status === 'Draft') {
      return { success: false, error: 'Payments cannot be recorded against a Draft invoice. Please Confirm the invoice first.' };
    }

    if (inv.status === 'Cancelled') {
      return { success: false, error: 'Payments cannot be recorded against a Cancelled invoice.' };
    }

    if (amt <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }

    if (amt > inv.balance) {
      return {
        success: false,
        error: `Payment amount exceeds invoice balance due of ₹${(inv.balance / 100).toLocaleString('en-IN')}. Overpayment is prohibited.`,
      };
    }

    // Update invoice paid & balance
    const newAmountPaid = inv.amountPaid + amt;
    const newBalance = inv.totalAmount - newAmountPaid;
    const isFullyPaid = newBalance <= 0;

    const updatedInvoices = invoices.map((i) => {
      if (i.id === inv.id) {
        return {
          ...i,
          amountPaid: newAmountPaid,
          balance: newBalance,
          status: isFullyPaid ? ('Paid' as InvoiceStatus) : i.status,
          paymentDate: paymentData.receivedDate,
          paymentMethod: paymentData.method,
          paymentReference: paymentData.referenceNumber,
        };
      }
      return i;
    });

    setStored(STORAGE_KEYS.INVOICES, updatedInvoices);

    const payments = getStored<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    const newPaymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: amt,
      receivedDate: paymentData.receivedDate,
      method: paymentData.method,
      referenceNumber: paymentData.referenceNumber,
      note: paymentData.note,
      status: isFullyPaid ? 'Paid' : 'Outstanding',
    };

    setStored(STORAGE_KEYS.PAYMENTS, [newPaymentRecord, ...payments]);

    recordAuditLog(
      user,
      'Payment Recorded',
      'Payment',
      newPaymentRecord.id,
      `Recorded ₹${(amt / 100).toLocaleString('en-IN')} via ${paymentData.method} for ${inv.invoiceNumber} (${isFullyPaid ? 'Paid in Full' : 'Partial Payment'})`
    );

    return { success: true, payment: newPaymentRecord };
  },

  // -------------------------------------------------------------
  // Audit Logs & Outbox API
  // -------------------------------------------------------------
  getAuditLogs(): AuditLogEntry[] {
    return getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  getOutbox(): OutboxItem[] {
    return getStored<OutboxItem[]>(STORAGE_KEYS.OUTBOX, INITIAL_OUTBOX);
  },

  // -------------------------------------------------------------
  // Global Cross-App Search
  // -------------------------------------------------------------
  searchAll(
    user: User,
    query: string
  ): {
    customers: Customer[];
    subscriptions: Subscription[];
    invoices: Invoice[];
  } {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return { customers: [], subscriptions: [], invoices: [] };
    }

    const customers = this.getCustomers(user).filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );

    const subscriptions = this.getSubscriptions(user).filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.planName.toLowerCase().includes(q)
    );

    const invoices = this.getInvoices(user).filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        i.billingPeriod.toLowerCase().includes(q)
    );

    return { customers, subscriptions, invoices };
  },

  // -------------------------------------------------------------
  // Aggregate Metrics & Reports
  // -------------------------------------------------------------
  getFinancialMetrics(user: User) {
    const subs = this.getSubscriptions(user);
    const invoices = this.getInvoices(user);

    const activeSubs = subs.filter((s) => s.status === 'Active');
    const activeSubscriptionsCount = activeSubs.length;

    // MRR normalized to monthly in paise
    const mrrPaise = activeSubs.reduce((acc, sub) => {
      if (sub.billingFrequency === 'yearly') {
        return acc + Math.round(sub.totalAmount / 12);
      } else if (sub.billingFrequency === 'weekly') {
        return acc + sub.totalAmount * 4;
      } else if (sub.billingFrequency === 'daily') {
        return acc + sub.totalAmount * 30;
      }
      return acc + sub.totalAmount;
    }, 0);

    const billedTotalPaise = invoices
      .filter((inv) => inv.status !== 'Cancelled')
      .reduce((acc, inv) => acc + inv.totalAmount, 0);

    const collectedTotalPaise = invoices
      .filter((inv) => inv.status !== 'Cancelled')
      .reduce((acc, inv) => acc + inv.amountPaid, 0);

    const outstandingTotalPaise = invoices
      .filter((inv) => inv.status === 'Confirmed' || inv.status === 'Draft')
      .reduce((acc, inv) => acc + inv.balance, 0);

    const overdueTotalPaise = invoices
      .filter((inv) => inv.status === 'Overdue')
      .reduce((acc, inv) => acc + inv.balance, 0);

    const collectionEfficiency =
      billedTotalPaise > 0
        ? Math.round((collectedTotalPaise / billedTotalPaise) * 1000) / 10
        : 92.5;

    return {
      activeSubscriptionsCount,
      mrr: mrrPaise,
      billedTotal: billedTotalPaise,
      collectedTotal: collectedTotalPaise,
      outstandingTotal: outstandingTotalPaise,
      overdueTotal: overdueTotalPaise,
      collectionEfficiency,
      avgCollectionDays: 16,
    };
  },
};
