'use client';

import { useEffect, useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Gift, Plus, Copy, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

export default function AdminGiftBonusPage() {
  const [giftCodes, setGiftCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [maxClaims, setMaxClaims] = useState('50');

  const fetchGiftCodes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/gift-codes');
      if (res.data && res.data.success) {
        setGiftCodes(res.data.codes || []);
      }
    } catch (err) {
      console.error('Failed to fetch gift codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCodes();
  }, []);

  const handleGenerateCode = () => {
    const randomCode = 'STAKE' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setCode(randomCode);
  };

  const handleCreateGift = async (e) => {
    e.preventDefault();
    if (!code || !amount) {
      toast.error('Please fill in gift code and bonus amount.');
      return;
    }

    try {
      const res = await api.post('/admin/gift-codes', {
        code: code.toUpperCase(),
        amount: parseFloat(amount),
        max_uses: parseInt(maxClaims) || 1,
      });

      if (res.data && res.data.success) {
        toast.success(`Gift code ${code.toUpperCase()} created successfully!`);
        setModalOpen(false);
        setCode('');
        setAmount('');
        fetchGiftCodes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create gift code');
    }
  };

  const handleCopyCode = (giftCode) => {
    navigator.clipboard.writeText(giftCode);
    toast.success(`Gift code ${giftCode} copied!`);
  };

  const handleDeleteGift = async (id) => {
    try {
      const res = await api.delete(`/admin/gift-codes/${id}`);
      if (res.data && res.data.success) {
        toast.success('Gift code deleted.');
        fetchGiftCodes();
      }
    } catch (err) {
      toast.error('Failed to delete gift code');
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#5b5bf5]" /> Gift Code Bonus System
          </h1>
          <button
            type="button"
            onClick={() => {
              handleGenerateCode();
              setModalOpen(true);
            }}
            className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Generate Gift Code
          </button>
        </div>

        {/* Gift Codes Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Gift Code</th>
                  <th className="py-3.5 px-6">Bonus Amount</th>
                  <th className="py-3.5 px-6">Claims Progress</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#5b5bf5]" />
                      <span className="text-xs font-semibold block mt-2">Loading gift codes...</span>
                    </td>
                  </tr>
                ) : giftCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-semibold">
                      No Gift Codes Created Yet.
                    </td>
                  </tr>
                ) : (
                  giftCodes.map((g) => {
                    const amtStr = typeof g.amount === 'number' ? `$${g.amount.toFixed(2)} USDT` : (g.amount || '$0.00 USDT');
                    const usedCount = g.used_count ?? g.claimed ?? 0;
                    const maxUses = g.max_uses ?? g.maxClaims ?? 1;
                    const st = g.status || (usedCount >= maxUses ? 'Exhausted' : 'ACTIVE');
                    const createdDateStr = g.created_at ? new Date(g.created_at).toLocaleString('en-US', { hour12: true }) : (g.createdDate || 'N/A');

                    return (
                      <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{g.code}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(g.code)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded"
                              title="Copy Code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-emerald-600 font-righteous">{amtStr}</td>
                        <td className="py-4 px-6 font-medium text-slate-700">
                          {usedCount} / {maxUses} users
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-medium">{createdDateStr}</td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border inline-block ${
                              st === 'ACTIVE' || st === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {st}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteGift(g.id)}
                            className="border border-red-500 text-red-600 hover:bg-red-50 p-1.5 rounded transition-all cursor-pointer"
                            title="Delete Code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={1}
            totalPages={1}
            totalResults={giftCodes.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>

        {/* Generate Gift Code Modal (Full Height & Click Outside to Close) */}
        {modalOpen && (
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 min-h-screen w-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 font-sans">
                  Generate Gift Code Voucher
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGift} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700 font-sans">
                      Gift Code *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[11px] font-bold text-[#5b5bf5] hover:underline cursor-pointer"
                    >
                      Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. STAKE2026BONUS"
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1">
                    Bonus Amount (USDT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25.00"
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1">
                    Max Claims Limit (Users)
                  </label>
                  <input
                    type="number"
                    value={maxClaims}
                    onChange={(e) => setMaxClaims(e.target.value)}
                    placeholder="50"
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Generate & Save Gift Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
