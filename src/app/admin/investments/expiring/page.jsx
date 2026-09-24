'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Clock, User, Wallet, Loader2, ArrowUpRight, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function ExpiringInvestmentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUserFunds, setSelectedUserFunds] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/investments/expiring');
        if (res.data?.success && Array.isArray(res.data.items)) {
          setItems(res.data.items);
        }
      } catch (err) {
        console.error('Failed to load expiring investments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.username?.toLowerCase().includes(q) ||
      item.plan?.toLowerCase().includes(q) ||
      item.currency?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-wide flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-500" /> Expiring Investments
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live monitoring countdown of active deposits maturing soon across all users
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              ● {items.length} Investments Expiring
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, plan, or currency..."
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredItems.length}</span> of {items.length} deposits
          </div>
        </div>

        {/* Expiring Deposits Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#fcf8e3] border-b border-[#fbeed5] text-[#8a6d3b] font-bold uppercase tracking-wider whitespace-nowrap">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Plan</th>
                  <th className="py-3.5 px-6 text-right">Deposit</th>
                  <th className="py-3.5 px-6 text-center">Expires In</th>
                  <th className="py-3.5 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading expiring deposits</span>
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No expiring investments found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isUrgent = item.expiresSeconds < 86400; // less than 24 hours
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                        {/* User Column */}
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          <Link
                            href={`/admin/users/detail/${item.userId || '1'}`}
                            className="hover:text-amber-600 hover:underline flex items-center gap-1.5"
                          >
                            <span>{item.username}</span>
                          </Link>
                        </td>

                        {/* Plan Column */}
                        <td className="py-4 px-6 font-bold text-slate-700 whitespace-nowrap">
                          {item.plan}
                        </td>

                        {/* Deposit Amount & Currency Icon */}
                        <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <span>${Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="w-5 h-5 rounded-full bg-[#14b8a6] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {item.currencySymbol || '₮'}
                            </span>
                          </div>
                        </td>

                        {/* Countdown / Expires */}
                        <td className="py-4 px-6 text-center font-semibold text-slate-800 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              isUrgent
                                ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {item.expiresText}
                          </span>
                        </td>

                        {/* Actions: ACCOUNT & FUNDS Buttons */}
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* ACCOUNT Button */}
                            <Link
                              href={`/admin/users/detail/${item.userId || '1'}`}
                              className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold px-3 py-1.5 rounded text-[11px] uppercase tracking-wide transition-all shadow-sm flex items-center gap-1"
                              title="View User Account"
                            >
                              ACCOUNT
                            </Link>

                            {/* FUNDS Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedUserFunds(item)}
                              className="bg-[#06b6d4] hover:bg-[#0891b2] text-white font-extrabold px-3 py-1.5 rounded text-[11px] uppercase tracking-wide transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                              title="View Funds & Ledger"
                            >
                              FUNDS
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Funds Ledger Modal */}
        {selectedUserFunds && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-bold text-slate-800 text-base">User Funds Overview</h3>
                </div>
                <button
                  onClick={() => setSelectedUserFunds(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">User:</span>
                  <span className="font-bold text-slate-900">@{selectedUserFunds.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Selected Plan:</span>
                  <span className="font-bold text-slate-800">{selectedUserFunds.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Investment Deposit:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    ${Number(selectedUserFunds.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedUserFunds.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Time Remaining:</span>
                  <span className="font-bold text-amber-600">{selectedUserFunds.expiresText}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/admin/reports/staking"
                  onClick={() => setSelectedUserFunds(null)}
                  className="w-full text-center bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md"
                >
                  View Full Investment History →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
