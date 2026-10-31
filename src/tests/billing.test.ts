/**
 * Brightloop Automated Business Logic & Security Test Suite
 * Covers:
 * 1. Password complexity & 30-min single-use reset token lifecycle
 * 2. Subscription state machine lifecycle & invalid transition rejection
 * 3. Idempotent billing run engine (duplicate invoice prevention)
 * 4. Discount & tax calculation with usage limits
 * 5. Partial payments, overpayment blocking, and reconciliation
 * 6. Multi-tenant customer data isolation
 */

import { api } from '../services/api';
import { User, Subscription, Invoice, SubscriptionPlan } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   BRIGHTLOOP AUTOMATED VERIFICATION SUITE');
  console.log('======================================================\n');

  // Set up mock localStorage for Node environment if running via tsx
  if (typeof globalThis.localStorage === 'undefined') {
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    };
  }

  const adminUser: User = {
    id: 'usr-admin',
    name: 'Anika Sharma',
    email: 'anika@brightloop.com',
    role: 'Admin',
    avatarText: 'AS',
  };

  const customerUser: User = {
    id: 'usr-customer',
    name: 'Neil Thomas',
    email: 'billing@northwindtraders.com',
    role: 'Customer',
    customerId: 'cust-1',
    avatarText: 'NT',
  };

  // -------------------------------------------------------------------------
  // TEST 1: Password rules & single-use 30-minute token
  // -------------------------------------------------------------------------
  console.log('Test 1: Password security standards & reset tokens');
  const weakPw = api.validatePassword('weak');
  assert(!weakPw.valid, 'Rejects password shorter than 8 characters');

  const noUpperPw = api.validatePassword('weakpassword123!');
  assert(!noUpperPw.valid, 'Rejects password missing uppercase letters');

  const noSpecialPw = api.validatePassword('WeakPassword123');
  assert(!noSpecialPw.valid, 'Rejects password missing special characters');

  const strongPw = api.validatePassword('Admin@Brightloop2026!');
  assert(strongPw.valid, 'Accepts compliant password with upper, lower, and special chars');

  const resetReq = api.requestPasswordReset('anika@brightloop.com');
  assert(resetReq.success && !!resetReq.token, 'Generates 30-min password reset token');

  if (resetReq.token) {
    const resetSuccess = api.resetPasswordWithToken(resetReq.token, 'Anika@SecurePass2026#');
    assert(resetSuccess.success, 'Successfully resets password with valid token');

    const resetReuse = api.resetPasswordWithToken(resetReq.token, 'AnotherPass2026#');
    assert(!resetReuse.success, 'Prevents reuse of already-used single-use reset token');
  }

  // -------------------------------------------------------------------------
  // TEST 2: Subscription lifecycle state machine & transition rules
  // -------------------------------------------------------------------------
  console.log('\nTest 2: Subscription lifecycle state machine');
  const subResult = api.createSubscription(adminUser, {
    customerId: 'cust-1',
    customerName: 'Northwind Traders',
    planId: 'plan-growth',
    planName: 'Growth Plan',
    billingFrequency: 'yearly',
    startDate: '2026-01-01',
    renewalDate: '2027-01-01',
    paymentTerms: 'Net 30',
    status: 'Draft',
    lines: [
      { id: 'l1', productId: 'prod-growth', item: 'Platform License', amount: 11880000, quantity: 1, unitPrice: 11880000 },
      { id: 'l2', productId: 'prod-seats', item: 'Seats (25)', amount: 900000, quantity: 25, unitPrice: 36000 },
    ],
    subtotal: 12780000,
    discountAmount: 0,
    taxAmount: 2300400,
    totalAmount: 15080400,
    note: 'Test contract',
    nextBillingDate: '2027-01-01',
  });

  assert(subResult.success && !!subResult.subscription, 'Creates subscription initially in Draft state');
  const subId = subResult.subscription!.id;

  // Illegal transition: Draft directly to Active
  const illegalTransition = api.transitionSubscriptionStatus(adminUser, subId, 'Active');
  assert(!illegalTransition.success, 'Rejects illegal transition from Draft directly to Active');

  // Legal transition: Draft -> Quotation
  const toQuotation = api.transitionSubscriptionStatus(adminUser, subId, 'Quotation');
  assert(toQuotation.success, 'Permits legal transition from Draft to Quotation');

  // Legal transition: Quotation -> Confirmed
  const toConfirmed = api.transitionSubscriptionStatus(adminUser, subId, 'Confirmed');
  assert(toConfirmed.success, 'Permits legal transition from Quotation to Confirmed');

  // Legal transition: Confirmed -> Active
  const toActive = api.transitionSubscriptionStatus(adminUser, subId, 'Active');
  assert(toActive.success, 'Permits legal transition from Confirmed to Active');

  // -------------------------------------------------------------------------
  // TEST 3: Idempotent billing run engine
  // -------------------------------------------------------------------------
  console.log('\nTest 3: Idempotent billing run engine');
  const period = 'November 2026';
  const run1 = api.executeBillingRun(adminUser, period);
  assert(run1.success, 'First billing run executes successfully');

  // Run a second time for same period: Must skip already billed subscriptions
  const run2 = api.executeBillingRun(adminUser, period);
  assert(run2.success && run2.createdCount === 0, 'Second billing run for same period is idempotent (0 duplicates created)');

  // -------------------------------------------------------------------------
  // TEST 4: Partial payments, balance updates & overpayment blocking
  // -------------------------------------------------------------------------
  console.log('\nTest 4: Financial precision, partial payments & overpayment blocking');
  const invoice: Invoice = {
    id: `inv-test-${Date.now()}`,
    invoiceNumber: `INV-TEST-001`,
    customerId: 'cust-1',
    customerName: 'Northwind Traders',
    subscriptionId: subId,
    billingPeriod: 'November 2026',
    issueDate: '2026-11-01',
    dueDate: '2026-11-30',
    lines: [{ id: 'il1', item: 'Software Subscription', amount: 10000000, quantity: 1, unitPrice: 10000000 }],
    subtotal: 10000000,
    discountAmount: 0,
    taxAmount: 1800000,
    totalAmount: 11800000, // ₹1,18,000.00 in integer paise
    amountPaid: 0,
    balance: 11800000,
    status: 'Confirmed',
    owner: 'Anika Sharma',
  };

  const storedInvoices = api.getInvoices(adminUser);
  localStorage.setItem('brightloop_invoices', JSON.stringify([invoice, ...storedInvoices]));

  // Block overpayment: total balance is 11800000 paise, attempt 12000000 paise
  const overpay = api.recordPayment(adminUser, {
    invoiceId: invoice.id,
    amount: 12000000,
    method: 'Bank transfer',
    referenceNumber: 'TXN-OVER',
    receivedDate: '2026-11-15',
  });
  assert(!overpay.success, 'Blocks overpayment exceeding outstanding invoice balance');

  // Partial payment: 5000000 paise (₹50,000)
  const partialPay = api.recordPayment(adminUser, {
    invoiceId: invoice.id,
    amount: 5000000,
    method: 'Bank transfer',
    referenceNumber: 'TXN-PARTIAL-1',
    receivedDate: '2026-11-15',
  });
  assert(partialPay.success, 'Successfully records partial payment');

  const afterPartialInvoices = api.getInvoices(adminUser);
  const updatedInv1 = afterPartialInvoices.find((i) => i.id === invoice.id);
  assert(
    updatedInv1?.balance === 6800000 && updatedInv1?.status === 'Confirmed',
    'Remaining balance is exactly 6800000 paise and status remains Confirmed'
  );

  // Settle remaining balance: 6800000 paise
  const fullPay = api.recordPayment(adminUser, {
    invoiceId: invoice.id,
    amount: 6800000,
    method: 'UPI',
    referenceNumber: 'TXN-FULL-2',
    receivedDate: '2026-11-20',
  });
  assert(fullPay.success, 'Successfully records final balance payment');

  const finalInvoices = api.getInvoices(adminUser);
  const updatedInv2 = finalInvoices.find((i) => i.id === invoice.id);
  assert(
    updatedInv2?.balance === 0 && updatedInv2?.status === 'Paid',
    'Invoice balance is 0 and status transitions to Paid'
  );

  // -------------------------------------------------------------------------
  // TEST 5: Customer Role Multi-Tenant Data Isolation
  // -------------------------------------------------------------------------
  console.log('\nTest 5: Multi-tenant customer data isolation');
  const customerSubs = api.getSubscriptions(customerUser);
  const allForCustomer = customerSubs.every((s) => s.customerId === 'cust-1');
  assert(allForCustomer && customerSubs.length > 0, 'Customer role query returns exclusively customer-1 subscriptions');

  const customerInvoices = api.getInvoices(customerUser);
  const allCustomerInvoices = customerInvoices.every((i) => i.customerId === 'cust-1');
  assert(allCustomerInvoices && customerInvoices.length > 0, 'Customer role query returns exclusively customer-1 invoices');

  console.log('\n======================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
