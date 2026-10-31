import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Shield,
  KeyRound,
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { UserRole } from '../types';

export const StaffPage: React.FC = () => {
  const { users, addStaff, currentUser, validatePassword } = useBilling();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [password, setPassword] = useState('Staff@Brightloop2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = currentUser.role === 'Admin';
  const staffUsers = users.filter((u) => u.role === 'Admin' || u.role === 'Staff');
  const pwCheck = validatePassword(password);

  const filteredStaff = staffUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email || !password) {
      setErrorMsg('Please provide all staff details.');
      return;
    }

    const res = addStaff({
      name,
      email,
      role: role as 'Staff' | 'Admin',
      password,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to add staff member.');
      return;
    }

    setShowModal(false);
    setToast(`Team member ${name} provisioned as ${role}.`);
    setTimeout(() => setToast(null), 3500);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-md border border-slate-200 p-8 text-center max-w-md mx-auto space-y-3">
        <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900">Admin Privileges Required</h3>
        <p className="text-xs text-slate-500">
          Only administrators can manage internal staff accounts and access controls.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Staff & Access Control</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              {staffUsers.length} members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based authorization (RBAC) governing billing engine access, tax rates, and customer accounts.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setEmail('');
            setRole('Staff');
            setShowModal(true);
          }}
          className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-medium text-xs rounded-md hover:bg-[#E5A817] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-md p-2 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-hidden focus:bg-white focus:border-[#0B2E2B]"
          />
        </div>

        <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
          Active session: <span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.role})
        </div>
      </div>

      {/* High density staff table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3">Member</th>
              <th className="py-2.5 px-3">Email Address</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Operational Scope</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2 px-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono font-medium flex items-center justify-center">
                    {user.avatarText}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 block">{user.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{user.company || 'Brightloop'}</span>
                  </div>
                </td>
                <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{user.email}</td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                      user.role === 'Admin'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-600 text-[11px]">
                  {user.role === 'Admin'
                    ? 'Full read/write: automated billing, tax rules, staff accounts, company profile'
                    : 'Operational read/write: quotes, subscriptions, invoices, payment entries'}
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-400">
                  Today
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-md max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-[#0B2E2B]">Add Internal Team Member</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-slate-600 block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Nair"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                required
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@brightloop.com"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                required
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">Role Assignment</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
              >
                <option value="Staff">Staff (Operations, Subscriptions & Invoicing)</option>
                <option value="Admin">Admin (Full System & Access Controls)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">Initial Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono pr-8 focus:bg-white focus:outline-hidden focus:border-[#0B2E2B]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password strength checklist */}
              <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 space-y-1 text-[10px]">
                <div className="text-slate-500 font-medium">Password Requirements:</div>
                <div className="grid grid-cols-2 gap-1 text-slate-600">
                  <span className={pwCheck.hasLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ Min 8 characters
                  </span>
                  <span className={pwCheck.hasUpper ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ Uppercase letter
                  </span>
                  <span className={pwCheck.hasLower ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ Lowercase letter
                  </span>
                  <span className={pwCheck.hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ Special symbol (!@#$)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!pwCheck.valid}
                className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-medium rounded text-xs hover:bg-[#E5A817] disabled:opacity-50"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
