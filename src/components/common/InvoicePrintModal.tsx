import React from 'react';
import { X, Printer, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { Invoice } from '../../types';
import { Currency, formatINR } from './Currency';
import { StatusBadge } from './StatusBadge';
import { BrightloopLogo } from './BrightloopLogo';
import { useBilling } from '../../context/BillingContext';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const { settings, customers } = useBilling();
  if (!invoice) return null;

  const customer = customers.find((c) => c.id === invoice.customerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs backdrop-fade flex items-center justify-center p-4">
      <div className="modal-enter bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Top action toolbar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-wide">Tax Invoice Preview</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4BA28] text-slate-900 rounded-lg text-xs font-bold hover:bg-[#E5A817] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-12 text-slate-800 print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start pb-8 border-b border-slate-200">
            <div>
              <BrightloopLogo variant="dark" size="lg" />
              <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                <p className="font-semibold text-slate-700">{settings.companyName}</p>
                <p>{settings.billingAddress}</p>
                <p className="font-mono text-slate-600">GSTIN: {settings.gstin}</p>
                <p>Email: {settings.supportEmail}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-[#0F3735] tracking-tight uppercase block">
                TAX INVOICE
              </span>
              <div className="mt-2 text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Invoice No:</span>{' '}
                  <span className="font-mono font-bold text-slate-800">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">Issue Date:</span>{' '}
                  <span className="font-medium text-slate-700">{invoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Due Date:</span>{' '}
                  <span className="font-bold text-red-700">{invoice.dueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Billing Period:</span>{' '}
                  <span className="font-medium text-slate-700">{invoice.billingPeriod}</span>
                </div>
                <div className="pt-1">
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Billed To
              </span>
              <p className="text-sm font-bold text-[#0F3735]">{invoice.customerName}</p>
              {customer && (
                <>
                  <p className="text-slate-600 mt-0.5">{customer.address}, {customer.city}</p>
                  <p className="text-slate-600">State: {customer.state}</p>
                  <p className="font-mono text-slate-700 mt-1">GSTIN: {customer.gstin}</p>
                </>
              )}
            </div>
            <div className="text-right sm:text-left sm:pl-12">
              <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Subscription Reference
              </span>
              <p className="font-mono font-bold text-slate-800">{invoice.subscriptionId}</p>
              <p className="text-slate-600 mt-0.5">Recurring Billing Agreement</p>
              <p className="text-slate-600">Payment terms: Net 15 days</p>
            </div>
          </div>

          {/* Line items table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.lines.map((line) => (
                  <tr key={line.id}>
                    <td className="py-3 font-medium text-slate-800">{line.item}</td>
                    <td className="py-3 text-center tabular-nums text-slate-600">{line.quantity}</td>
                    <td className="py-3 text-right tabular-nums text-slate-600">
                      {formatINR(line.unitPrice)}
                    </td>
                    <td className="py-3 text-right tabular-nums font-semibold text-slate-900">
                      {formatINR(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Calculations */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="text-xs text-slate-500 max-w-sm">
              <p className="font-bold text-slate-700 mb-1">Payment Instructions</p>
              <p>Bank: {settings.bankName}</p>
              <p className="font-mono">A/C: {settings.accountNumber} | IFSC: {settings.ifsc}</p>
              <p>UPI ID: {settings.upiId}</p>
              {invoice.status === 'Paid' && (
                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Settled on {invoice.paymentDate} via {invoice.paymentMethod} (Ref:{' '}
                    {invoice.paymentReference})
                  </span>
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="tabular-nums font-semibold">{formatINR(invoice.subtotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({invoice.discountRuleName || 'Applied'}):</span>
                  <span className="tabular-nums">-{formatINR(invoice.discountAmount)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{invoice.taxRuleName || 'GST (18%)'}:</span>
                  <span className="tabular-nums font-semibold">{formatINR(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#0F3735] pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <Currency amount={invoice.totalAmount} className="text-base" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Amount Paid:</span>
                <span className="tabular-nums text-emerald-700 font-semibold">{formatINR(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-100">
                <span>Balance Due:</span>
                <span className={`tabular-nums ${invoice.balance > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                  {formatINR(invoice.balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer declaration */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-end text-[11px] text-slate-400">
            <div>
              <p>This is a computer-generated tax invoice and requires no physical signature.</p>
              <p className="mt-0.5">Brightloop Subscription Billing Engine · Loop verified</p>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-600 block">Authorized Signatory</span>
              <span className="text-[10px] text-slate-400">{settings.companyName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
