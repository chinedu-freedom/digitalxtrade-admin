'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { History, Search, Loader2, UserCheck, Calendar } from 'lucide-react';
import api from '../../../../lib/api';

export default function AdminGiftBonusUsesListPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/gift-code-claims');
      if (res.data && res.data.success) {
        setClaims(res.data.claims || []);
      }
    } catch (err) {
      console.error('Failed to load gift claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const filteredClaims = claims.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.user_name.toLowerCase().includes(search.toLowerCase()) ||
      c.user_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-[#5b5bf5]" /> Gift Code Usage History
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Real-time audit log of all claimed gift codes and user bonus redemptions
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, user or email..."
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="text-xs text-slate-500 font-semibold font-sans">
            Total Redemptions: <span className="text-slate-800 font-bold">{claims.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2 text-xs">
              <span>Loading usage logs</span>
              <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              No gift code redemptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Gift Code</th>
                    <th className="py-3.5 px-4">Bonus Received</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredClaims.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 text-slate-700">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#5b5bf5] flex items-center justify-center font-bold shrink-0">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{item.user_name}</div>
                            <div className="text-[11px] text-slate-400">{item.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {item.code}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                        +${parseFloat(item.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.claimed_at).toLocaleString('en-US', { hour12: true })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
