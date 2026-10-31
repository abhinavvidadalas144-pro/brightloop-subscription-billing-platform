/**
 * Brightloop Subscription Billing Platform - Core Domain Types
 * All monetary amounts are stored as integer paise (1 Rupee = 100 Paise).
 */

export type UserRole = 'Admin' | 'Staff' | 'Customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  customerId?: string; // If role === 'Customer', isolates data to this customerId
  avatarText: string;
  avatarColor?: string;
}

export type SubscriptionStatus = 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Closed';

export type InvoiceStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Overdue' | 'Cancelled';

export type PaymentMethod = 'Bank transfer' | 'UPI' | 'Card' | 'Cash' | 'Cheque';

export type PaymentStatus = 'Paid' | 'Outstanding' | 'Overdue';

export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ProductVariant {
  id: string;
  name: string;
  priceAdjustment: number; // in integer paise (e.g. 56000 for ₹560)
}

export interface Product {
  id: string;
  name: string;
  type: 'Service' | 'Software' | 'Add-on';
  salesPrice: number; // in integer paise
  costPrice: number;  // in integer paise
  notes: string;
  variants: ProductVariant[];
  isArchived?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in integer paise
  billingFrequency: BillingFrequency;
  minQuantity: number;
  availableFrom: string;
  availableTo?: string;
  autoCloseOnEnd: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  description: string;
  features: string[];
  isActive?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstin: string; // 15-character statutory format
  paymentMethod: {
    type: 'Card' | 'Bank' | 'UPI';
    brand?: string;
    last4?: string;
    expiry?: string;
  };
  createdAt: string;
}

export interface SubscriptionLineItem {
  id: string;
  productId: string;
  item: string;
  amount: number; // in integer paise
  quantity?: number;
  unitPrice?: number; // in integer paise
  variantName?: string;
  variantExtra?: number; // in integer paise
}

export interface Subscription {
  id: string; // e.g. SUB-0042
  customerNumber?: number;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  billingFrequency: BillingFrequency;
  startDate: string;
  renewalDate: string;
  paymentTerms: string;
  status: SubscriptionStatus;
  lines: SubscriptionLineItem[];
  subtotal: number; // in integer paise
  discountAmount: number; // in integer paise
  appliedDiscountName?: string;
  taxAmount: number; // in integer paise
  totalAmount: number; // in integer paise
  note: string;
  lastBilledDate?: string;
  nextBillingDate: string;
  isPaused?: boolean;
  pausedAt?: string;
  minQuantity?: number;
}

export interface InvoiceLineItem {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number; // in integer paise
  amount: number; // in integer paise
}

export interface Invoice {
  id: string; // e.g. INV-2026-0187
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  subscriptionId: string;
  billingPeriod: string; // e.g. "October 2026"
  issueDate: string;
  dueDate: string;
  lines: InvoiceLineItem[];
  subtotal: number; // in integer paise
  discountAmount: number; // in integer paise
  discountRuleName?: string;
  taxAmount: number; // in integer paise
  taxRuleName?: string;
  totalAmount: number; // in integer paise
  amountPaid: number; // in integer paise
  balance: number; // in integer paise
  status: InvoiceStatus;
  owner: string; // 'Admin' | 'Staff'
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  sentDate?: string;
  notes?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number; // in integer paise
  receivedDate: string;
  method: PaymentMethod;
  referenceNumber: string;
  note?: string;
  status: PaymentStatus;
}

export interface DiscountTaxRule {
  id: string;
  name: string;
  appliesTo: 'Products' | 'Subscriptions' | 'Total Invoice';
  targetProductId?: string;
  type: 'Discount' | 'Tax';
  valueMode: 'Percentage' | 'Fixed';
  value: number; // e.g. 15 for 15% or 50000 for ₹500 fixed (in paise) or 18 for 18% GST
  effectiveFrom: string;
  effectiveTo?: string;
  usageLimit: number | null; // null = unlimited
  usedCount: number;
  status: 'Active' | 'Inactive';
  minPurchase?: number; // in integer paise
  minQuantity?: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  templateName?: string;
  validDays: number;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Converted' | 'Expired';
  lines: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number; // in integer paise
    amount: number; // in integer paise
  }[];
  subtotal: number; // in integer paise
  discountAmount: number; // in integer paise
  taxAmount: number; // in integer paise
  totalAmount: number; // in integer paise
  notes?: string;
  createdAt: string;
}

export interface OrganizationSettings {
  companyName: string;
  gstin: string;
  supportEmail: string;
  billingAddress: string;
  baseCurrency: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  autoDunning: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'Subscription' | 'Invoice' | 'Payment' | 'Customer' | 'Product' | 'Plan' | 'Rule' | 'Quotation' | 'Auth' | 'Settings';
  entityId: string;
  details: string;
}

export interface OutboxItem {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  type: 'INVOICE' | 'PASSWORD_RESET' | 'DUNNING_REMINDER';
  payload: Record<string, any>;
  status: 'Sent';
}

export interface PasswordResetToken {
  tokenHash: string;
  tokenRaw: string;
  email: string;
  expiresAt: string; // ISO string 30 minutes from creation
  used: boolean;
}
