import React, { useState } from 'react';
import { Package, Plus, Edit2, Search, Trash2, CheckCircle2, Tag } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { Product } from '../types';
import { formatINR, paiseToRupees, rupeesToPaise } from '../components/common/Currency';

export const ProductsPage: React.FC = () => {
  const { products, createProduct, updateProduct, currentUser } = useBilling();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<'Software' | 'Service' | 'Add-on'>('Software');
  const [salesPriceRupees, setSalesPriceRupees] = useState(24900);
  const [costPriceRupees, setCostPriceRupees] = useState(5000);
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState<{ id: string; name: string; priceAdjustment: number }[]>([
    { id: 'v1', name: 'Standard Edition', priceAdjustment: 0 },
    { id: 'v2', name: 'Odoo Brand Variant', priceAdjustment: 56000 },
  ]);

  const isAdmin = currentUser.role === 'Admin';

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setType('Software');
    setSalesPriceRupees(10000);
    setCostPriceRupees(2000);
    setNotes('');
    setVariants([]);
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setType(p.type);
    setSalesPriceRupees(paiseToRupees(p.salesPrice));
    setCostPriceRupees(paiseToRupees(p.costPrice));
    setNotes(p.notes);
    setVariants(p.variants || []);
    setShowModal(true);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: `var-${Date.now()}`, name: 'New Brand Variant', priceAdjustment: 56000 },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const salesPrice = rupeesToPaise(salesPriceRupees);
    const costPrice = rupeesToPaise(costPriceRupees);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name,
        type,
        salesPrice,
        costPrice,
        notes,
        variants,
      });
      setToast(`Product "${name}" updated.`);
    } else {
      createProduct({
        name,
        type,
        salesPrice,
        costPrice,
        notes,
        variants,
      });
      setToast(`Product "${name}" added to catalog.`);
    }

    setShowModal(false);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Products & Variants</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Software licenses, seat tiers, and brand add-ons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="px-3 py-1.5 bg-[#F4BA28] text-slate-950 font-semibold text-xs rounded-md hover:bg-[#E5A817] shadow-2xs flex items-center gap-1.5 self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add product</span>
            </button>
          )}
        </div>
      </div>

      {/* Enterprise Products Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">
            Catalog Products ({filtered.length})
          </span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium text-[11px]">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Sales Price</th>
                <th className="py-2.5 px-3 text-right">Cost Price</th>
                <th className="py-2.5 px-3">Variants</th>
                <th className="py-2.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{prod.name}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                      {prod.notes}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {prod.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900 tabular-nums">
                    {formatINR(prod.salesPrice)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                    {formatINR(prod.costPrice)}
                  </td>
                  <td className="py-3 px-3">
                    {prod.variants && prod.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {prod.variants.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            <span>{v.name}</span>
                            <span className="font-mono text-emerald-800 font-semibold">
                              +{formatINR(v.priceAdjustment)}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="Software">Software</option>
                  <option value="Service">Service</option>
                  <option value="Add-on">Add-on</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Sales (₹)</label>
                <input
                  type="number"
                  value={salesPriceRupees}
                  onChange={(e) => setSalesPriceRupees(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Cost (₹)</label>
                <input
                  type="number"
                  value={costPriceRupees}
                  onChange={(e) => setCostPriceRupees(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
              />
            </div>

            {/* Variants */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Brand Variants</span>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="text-xs text-[#0C3430] font-semibold hover:underline"
                >
                  + Add Variant
                </button>
              </div>

              {variants.map((v, i) => (
                <div key={v.id || i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[i].name = e.target.value;
                      setVariants(updated);
                    }}
                    placeholder="Variant name (e.g. Odoo brand)"
                    className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="number"
                    value={v.priceAdjustment}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[i].priceAdjustment = Number(e.target.value);
                      setVariants(updated);
                    }}
                    placeholder="+560"
                    className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(v.id)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
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
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
