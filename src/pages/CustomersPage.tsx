import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Edit2,
  CheckCircle2,
  Receipt,
  Layers,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { Customer } from '../types';
import { formatINR } from '../components/common/Currency';
import { StatusBadge } from '../components/common/StatusBadge';

export const CustomersPage: React.FC = () => {
  const { customers, subscriptions, invoices, createCustomer, updateCustomer } = useBilling();

  const [search, setSearch] = useState('');
  const [selectedCustId, setSelectedCustId] = useState<string>(customers[0]?.id || 'cust-northwind');
  const [showModal, setShowModal] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [gstin, setGstin] = useState('');

  const selectedCustomer = customers.find((c) => c.id === selectedCustId) || customers[0];

  const relatedSubs = subscriptions.filter((s) => s.customerId === selectedCustomer?.id);
  const relatedInvoices = invoices.filter((i) => i.customerId === selectedCustomer?.id);

  const totalBilled = relatedInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = relatedInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const totalBalance = relatedInvoices.reduce((acc, i) => acc + (i.balance || 0), 0);

  const handleOpenCreate = () => {
    setEditingCust(null);
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('+91 98');
    setAddress('Commercial Hub');
    setCity('Mumbai');
    setState('Maharashtra');
    setGstin('27AAAAA0000A1Z5');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCust(c);
    setName(c.name);
    setContactPerson(c.contactPerson);
    setEmail(c.email);
    setPhone(c.phone);
    setAddress(c.address);
    setCity(c.city);
    setState(c.state);
    setGstin(c.gstin);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanGstin = gstin.trim().toUpperCase();
    if (cleanGstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
      setToast('Invalid GSTIN format. Expected 15-character format (e.g. 27AAAAA0000A1Z5).');
      setTimeout(() => setToast(null), 4000);
      return;
    }

    if (editingCust) {
      updateCustomer({
        ...editingCust,
        name,
        contactPerson,
        email,
        phone,
        address,
        city,
        state,
        gstin,
      });
      setToast(`Customer "${name}" updated.`);
    } else {
      const created = createCustomer({
        name,
        contactPerson,
        email,
        phone,
        address,
        city,
        state,
        gstin,
        paymentMethod: { type: 'Card', brand: 'VISA', last4: '4242', expiry: '12/28' },
      });
      setSelectedCustId(created.id);
      setToast(`Customer "${name}" added.`);
    }

    setShowModal(false);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Client accounts, corporate tax IDs, and billing relationship histories.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] shadow-2xs flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add customer</span>
        </button>
      </div>

      {/* Main Grid: Directory List (4 cols) vs Customer 360 View (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Directory List */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">
              Accounts ({filteredCustomers.length})
            </span>
          </div>

          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts..."
                className="w-full pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
            {filteredCustomers.map((c) => {
              const isSelected = c.id === selectedCustomer?.id;
              const subCount = subscriptions.filter((s) => s.customerId === c.id).length;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustId(c.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-50/90 font-medium border-l-2 border-[#0C3430]' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-slate-900 text-xs">{c.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{subCount} subs</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">{c.contactPerson}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{c.city}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer 360 Ledger View */}
        {selectedCustomer && (
          <div className="lg:col-span-8 space-y-4">
            {/* Profile Overview Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    {selectedCustomer.id}
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                    {selectedCustomer.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{selectedCustomer.contactPerson}</span>
                    <span>·</span>
                    <span className="font-mono">{selectedCustomer.email}</span>
                    <span>·</span>
                    <span className="font-mono">{selectedCustomer.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(selectedCustomer)}
                  className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3 text-slate-400" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Financial Metrics Strip for this Customer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">GSTIN</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedCustomer.gstin}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invoiced</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatINR(totalBilled)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Collected</span>
                  <span className="font-semibold text-emerald-800 tabular-nums">{formatINR(totalPaid)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance Due</span>
                  <span className={`font-semibold tabular-nums ${totalBalance > 0 ? 'text-rose-700' : 'text-slate-600'}`}>
                    {formatINR(totalBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Active Subscriptions ({relatedSubs.length})
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                      <th className="py-2 px-3">Subscription</th>
                      <th className="py-2 px-3">Plan</th>
                      <th className="py-2 px-3">Renewal</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatedSubs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-3 px-3 text-center text-slate-400">
                          No subscriptions recorded.
                        </td>
                      </tr>
                    ) : (
                      relatedSubs.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-slate-800">{s.id}</td>
                          <td className="py-2 px-3 text-slate-700">{s.planName}</td>
                          <td className="py-2 px-3 text-slate-500">{s.renewalDate}</td>
                          <td className="py-2 px-3 text-right font-medium text-slate-900 tabular-nums">
                            {formatINR(s.totalAmount)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <StatusBadge status={s.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Invoices & Statements ({relatedInvoices.length})
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                      <th className="py-2 px-3">Invoice</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatedInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-3 px-3 text-center text-slate-400">
                          No invoices recorded.
                        </td>
                      </tr>
                    ) : (
                      relatedInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-slate-800">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2 px-3 text-slate-500">{inv.dueDate}</td>
                          <td className="py-2 px-3 text-right font-medium text-slate-900 tabular-nums">
                            {formatINR(inv.totalAmount)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <StatusBadge status={inv.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingCust ? 'Edit Customer Account' : 'Add Customer Account'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Northwind Traders"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Neil Thomas"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">GSTIN</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27AABCN..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono uppercase"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold rounded hover:bg-[#E5A817]"
              >
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
