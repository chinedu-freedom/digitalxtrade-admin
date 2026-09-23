'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, Monitor, Copy, Loader2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminWithdrawalsFilteredPage({
  title = 'Pending Withdrawals',
  filterStatus = 'PENDING',
}) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTrx, setSearchTrx] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/withdrawals');
      if (res.data.success) {
        setWithdrawals(res.data.withdrawals || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleCopyWallet = (address) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success('Wallet address copied to clipboard!');
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filterStatus !== 'ALL' && w.status !== filterStatus) return false;

    if (searchTrx.trim()) {
      const q = searchTrx.toLowerCase().trim();
      const refId = (w.id || '').toLowerCase();
      if (!refId.includes(q)) return false;
    }

    if (searchUser.trim()) {
      const q = searchUser.toLowerCase().trim();
      const nameStr = String(w.user?.full_name || w.user?.username || '').toLowerCase();
      const userStr = String(w.user?.username || '').toLowerCase();
      const emailStr = String(w.user?.email || '').toLowerCase();
      if (!nameStr.includes(q) && !userStr.includes(q) && !emailStr.includes(q)) return false;
    }

    if (selectedDateFilter !== 'All') {
      const itemDate = new Date(w.created_at);
      const now = new Date();
      if (selectedDateFilter === 'Today') {
        if (itemDate.toDateString() !== now.toDateString()) return false;
      } else if (selectedDateFilter === 'Yesterday') {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        if (itemDate.toDateString() !== yest.toDateString()) return false;
      } else if (selectedDateFilter === 'Last 7 Days') {
        const days7 = new Date(now);
        days7.setDate(days7.getDate() - 7);
        if (itemDate < days7) return false;
      } else if (selectedDateFilter === 'Last 15 Days') {
        const days15 = new Date(now);
        days15.setDate(days15.getDate() - 15);
        if (itemDate < days15) return false;
      } else if (selectedDateFilter === 'Last 30 Days') {
        const days30 = new Date(now);
        days30.setDate(days30.getDate() - 30);
        if (itemDate < days30) return false;
      } else if (selectedDateFilter === 'This Month') {
        if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
      } else if (selectedDateFilter === 'Last Month') {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (itemDate.getMonth() !== lastMonthDate.getMonth() || itemDate.getFullYear() !== lastMonthDate.getFullYear()) return false;
      } else if (selectedDateFilter === 'Last 6 Months') {
        const months6 = new Date(now);
        months6.setMonth(months6.getMonth() - 6);
        if (itemDate < months6) return false;
      } else if (selectedDateFilter === 'This Year') {
        if (itemDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            {title}
          </h1>

          {/* Top Search Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Username / Email"
                className="w-44 h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800 font-sans"
              />
              <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3 flex items-center justify-center shrink-0 cursor-pointer">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Standard Date Dropdown Filter */}
            <div className="w-full sm:w-auto">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">
                Date
              </label>
              <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-sans font-normal w-full sm:w-44">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="text-slate-800 hover:bg-slate-100">All</SelectItem>
                  <SelectItem value="Today" className="text-slate-800 hover:bg-slate-100">Today</SelectItem>
                  <SelectItem value="Yesterday" className="text-slate-800 hover:bg-slate-100">Yesterday</SelectItem>
                  <SelectItem value="Last 7 Days" className="text-slate-800 hover:bg-slate-100">Last 7 Days</SelectItem>
                  <SelectItem value="Last 15 Days" className="text-slate-800 hover:bg-slate-100">Last 15 Days</SelectItem>
                  <SelectItem value="Last 30 Days" className="text-slate-800 hover:bg-slate-100">Last 30 Days</SelectItem>
                  <SelectItem value="This Month" className="text-slate-800 hover:bg-slate-100">This Month</SelectItem>
                  <SelectItem value="Last Month" className="text-slate-800 hover:bg-slate-100">Last Month</SelectItem>
                  <SelectItem value="Last 6 Months" className="text-slate-800 hover:bg-slate-100">Last 6 Months</SelectItem>
                  <SelectItem value="This Year" className="text-slate-800 hover:bg-slate-100">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Withdrawals Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Gateway | Transaction</th>
                  <th className="py-3.5 px-6">Initiated</th>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Wallet Address</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Conversion</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading withdrawals data</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                      No withdrawals found in this category
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((w) => {
                    const gatewayName = `${w.currency || 'USDT'}`;
                    const refId = w.id.substring(0, 10).toUpperCase();
                    const wDate = w.created_at ? new Date(w.created_at).toLocaleString('en-US', { hour12: true }) : 'Recently';
                    const userName = w.user?.full_name || w.user?.username || 'User';
                    const userHandle = w.user?.username ? `@${w.user.username}` : '';
                    const numAmt = parseFloat(w.amount || 0);
                    const numCharge = parseFloat(w.charge || 0);
                    const numNet = parseFloat(w.net_amount || (numAmt > numCharge ? numAmt - numCharge : numAmt));
                    const statusText = w.status ? w.status.charAt(0) + w.status.slice(1).toLowerCase() : 'Pending';

                    return (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Gateway | Transaction Column */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#5b5bf5]">{gatewayName}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{refId}</div>
                        </td>

                        {/* Initiated Column */}
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800">{wDate}</div>
                        </td>

                        {/* User Column */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{userName}</div>
                          <Link
                            href={`/admin/users/detail/${w.user_id}`}
                            className="text-[#5b5bf5] font-semibold hover:underline text-[11px]"
                          >
                            {userHandle}
                          </Link>
                        </td>

                        {/* Wallet Address Column */}
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[160px]" title={w.wallet_address}>
                              {w.wallet_address || 'N/A'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyWallet(w.wallet_address)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              title="Copy Wallet Address"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Amount Column */}
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900 text-sm">${numAmt.toFixed(2)}</div>
                          {numCharge > 0 && (
                            <div className="text-[11px] text-red-500 font-semibold">Fee: -${numCharge.toFixed(2)}</div>
                          )}
                          <div className="text-[11px] text-slate-500 font-medium">Payout: ${numNet.toFixed(2)}</div>
                        </td>

                        {/* Conversion Column */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800 font-mono">${numNet.toFixed(2)} USD</div>
                          <div className="text-slate-400 font-mono text-[10px]">1.00 USD = 1.00 USD</div>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-3.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                              w.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-500 border-amber-200'
                                : w.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {statusText}
                          </span>
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/admin/withdraw/details/${w.id}`}
                            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Monitor className="w-3.5 h-3.5" /> Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Utility Footer */}
          <Pagination
            currentPage={1}
            totalPages={Math.max(1, Math.ceil(filteredWithdrawals.length / 15))}
            totalResults={filteredWithdrawals.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
