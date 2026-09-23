'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Gift, Plus, Search, Trash2, Calendar, Users, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

import ConfirmModal from '../../../../components/ConfirmModal';

export default function AdminGiftBonusPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCodeId, setDeleteCodeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    code: '',
    amount: '',
    max_uses: '100',
    expire_at: '2026-12-31',
  });

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/gift-codes');
      if (res.data && res.data.success) {
        setCodes(res.data.codes || []);
      }
    } catch (err) {
      console.error('Failed to load gift codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleGenerateCode = () => {
    const random = 'EVER' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm({ ...form, code: random });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || !form.amount) {
      toast.error('Code and Amount are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/gift-codes', form);
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Gift code created successfully!');
        setShowModal(false);
        setForm({ code: '', amount: '', max_uses: '100', expire_at: '2026-12-31' });
        fetchCodes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create gift code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCodeId) return;
    try {
      const res = await api.delete(`/admin/gift-codes/${deleteCodeId}`);
      if (res.data && res.data.success) {
        toast.success(res.data.message);
        fetchCodes();
      }
    } catch (err) {
      toast.error('Failed to delete gift code');
    } finally {
      setDeleteCodeId(null);
    }
  };

  const filteredCodes = codes.filter(
    (c) => c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
              <Gift className="w-6 h-6 text-[#5b5bf5]" /> Gift Bonus Codes
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Create promo gift codes and voucher bonuses for platform users
            </p>
          </div>

          <button
            onClick={() => {
              handleGenerateCode();
              setShowModal(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Gift Code
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code..."
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="text-xs text-slate-500 font-semibold font-sans">
            Total Codes: <span className="text-slate-800 font-bold">{codes.length}</span>
          </div>
        </div>

        {/* Gift Codes Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2 text-xs">
              <span>Loading gift codes</span>
              <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              No gift codes found. Click "Create Gift Code" to add one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <th className="py-3.5 px-4">Code Name</th>
                    <th className="py-3.5 px-4">Gift Code</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Usage / Max</th>
                    <th className="py-3.5 px-4">Expires</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredCodes.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 text-slate-700">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {item.code_name || 'Bonus Code'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 tracking-wider">
                        {item.code}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                        ${parseFloat(item.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800">{item.used_count}</span> / {item.max_uses}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.expire_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {item.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteCodeId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 cursor-default"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#5b5bf5]" /> Create Gift Code
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">Gift Code</label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[11px] font-bold text-[#5b5bf5] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. EVERSTAKE50"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Bonus Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 50.00"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Max Uses Limit
                  </label>
                  <input
                    type="number"
                    required
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="100"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.expire_at}
                    onChange={(e) => setForm({ ...form, expire_at: e.target.value })}
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteCodeId}
          onClose={() => setDeleteCodeId(null)}
          onConfirm={handleDelete}
          title="Delete Gift Code"
          description="Are you sure you want to delete this gift bonus code? Users will no longer be able to claim it."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          isDanger={true}
        />
      </div>
    </AdminSidebarLayout>
  );
}
