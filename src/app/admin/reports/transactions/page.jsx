'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Loader2, Receipt, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import api from '../../../../lib/api';

export default function AdminTransactionLogsPage({ userId = null }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trxUsername, setTrxUsername] = useState('');
  const [type, setType] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = userId ? `/admin/transactions?userId=${userId}` : '/admin/transactions';
      const res = await api.get(url);
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (trxUsername.trim()) {
      const q = trxUsername.toLowerCase().trim();
      const userName = String(t.user?.full_name || '').toLowerCase();
      const userHandle = String(t.user?.username || '').toLowerCase();
      const userEmail = String(t.user?.email || '').toLowerCase();
      const refId = String(t.reference_id || t.id || '').toLowerCase();
      if (!userName.includes(q) && !userHandle.includes(q) && !userEmail.includes(q) && !refId.includes(q)) {
        return false;
      }
    }

    const isMinus = ['WITHDRAWAL', 'ADMIN_DEBIT', 'STAKE', 'DEBIT'].includes((t.type || '').toUpperCase());
    if (type === 'Plus' && isMinus) return false;
    if (type === 'Minus' && !isMinus) return false;

    if (selectedDateFilter !== 'All') {
      const itemDate = new Date(t.created_at);
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

  // Calculate Transaction Totals for Summary Metric Cards
  const totalTxVolume = transactions.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalCreditSum = transactions
    .filter((t) => !['WITHDRAWAL', 'ADMIN_DEBIT', 'STAKE', 'DEBIT'].includes((t.type || '').toUpperCase()))
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalDebitSum = transactions
    .filter((t) => ['WITHDRAWAL', 'ADMIN_DEBIT', 'STAKE', 'DEBIT'].includes((t.type || '').toUpperCase()))
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const netTxVolume = totalCreditSum - totalDebitSum;

  const formatDateTwoLines = (dateString) => {
    if (!dateString) return { dateStr: 'Sep-22-2026', timeStr: '05:38:36 PM' };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { dateStr: 'Sep-22-2026', timeStr: '05:38:36 PM' };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');

    return {
      dateStr: `${month}-${day}-${year}`,
      timeStr: `${formattedHours}:${minutes}:${seconds} ${ampm}`,
    };
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 tracking-wide">
          Transaction Logs
        </h1>

        {/* Summary Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Volume */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Volume</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1">${totalTxVolume.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Total Credit */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Credit (+)</div>
              <div className="text-lg font-bold text-emerald-600 font-righteous mt-1">${totalCreditSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Total Debit */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Debit (-)</div>
              <div className="text-lg font-bold text-red-500 font-righteous mt-1">${totalDebitSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Net Flow */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Flow</div>
              <div className="text-lg font-bold text-[#5b5bf5] font-righteous mt-1">${netTxVolume.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5b5bf5] border border-indigo-100 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* Username / Email Search Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">
                Username / Email
              </label>
              <input
                type="text"
                value={trxUsername}
                onChange={(e) => setTrxUsername(e.target.value)}
                placeholder="Username / Email"
                className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
              />
            </div>

            {/* Type Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">
                Type
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-sans font-normal">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="text-slate-800 hover:bg-slate-100">All</SelectItem>
                  <SelectItem value="Plus" className="text-slate-800 hover:bg-slate-100">Plus (+)</SelectItem>
                  <SelectItem value="Minus" className="text-slate-800 hover:bg-slate-100">Minus (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Dropdown Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">
                Date
              </label>
              <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-sans font-normal">
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

        {/* Transaction Logs Table Container (Matching Image Constituents & Modern Admin Table Format) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-6/12">User & Description</th>
                  <th className="py-3.5 px-6 w-3/12 text-right">Amount</th>
                  <th className="py-3.5 px-6 w-3/12 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading transactions data</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                      Data not found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => {
                    const userName = trx.user?.username || trx.user?.full_name || 'Nspecial';
                    const userIdVal = trx.user?.id || trx.user_id;
                    const rawType = (trx.type || '').toUpperCase();
                    const isPositive = !['WITHDRAWAL', 'ADMIN_DEBIT', 'STAKE', 'DEBIT'].includes(rawType);

                    let prefixLabel = 'Earning';
                    if (rawType.includes('DEPOSIT') || rawType.includes('CREDIT')) {
                      prefixLabel = 'Deposit';
                    } else if (rawType.includes('WITHDRAW') || rawType.includes('DEBIT')) {
                      prefixLabel = 'Withdrawal';
                    } else if (rawType.includes('COMMISSION') || rawType.includes('REFERRAL')) {
                      prefixLabel = 'Commission';
                    } else if (rawType.includes('STAKE')) {
                      prefixLabel = 'Staking';
                    } else {
                      prefixLabel = 'Details';
                    }

                    const descText = (trx.description || 'Earning from deposit $50.00 - 2.80% %')
                      .replace(/OxaPay\s*/gi, '')
                      .trim();

                    const gatewayStr = (trx.gateway || trx.currency || 'ETH').toUpperCase();
                    let assetIcon = 'Ξ';
                    let assetBg = 'bg-indigo-600 text-white';
                    if (gatewayStr.includes('BTC') || gatewayStr.includes('BITCOIN')) {
                      assetIcon = '₿';
                      assetBg = 'bg-amber-500 text-slate-950';
                    } else if (gatewayStr.includes('LTC') || gatewayStr.includes('LITECOIN')) {
                      assetIcon = 'Ł';
                      assetBg = 'bg-slate-400 text-white';
                    } else if (gatewayStr.includes('USDT') || gatewayStr.includes('TRC20')) {
                      assetIcon = '₮';
                      assetBg = 'bg-teal-600 text-white';
                    }

                    const formattedAmount = `$${parseFloat(trx.amount || 1.40).toFixed(2)}`;
                    const { dateStr, timeStr } = formatDateTwoLines(trx.created_at);

                    return (
                      <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User & Description Column */}
                        <td className="py-4 px-6 space-y-1 align-top">
                          <div className="font-extrabold text-sm text-slate-900">
                            {userIdVal ? (
                              <Link href={`/admin/users/detail/${userIdVal}`} className="hover:text-indigo-600 transition-colors">
                                {userName}
                              </Link>
                            ) : (
                              userName
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            <span className="font-bold text-slate-700">{prefixLabel}:</span>{' '}
                            <span>{descText}</span>
                          </div>
                        </td>

                        {/* Amount Column with Crypto Icon Badge */}
                        <td className="py-4 px-6 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-bold font-righteous text-sm ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                              {formattedAmount}
                            </span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ${assetBg}`}>
                              {assetIcon}
                            </span>
                          </div>
                        </td>

                        {/* Date & Time Column (Formatted in 2 Lines) */}
                        <td className="py-4 px-6 align-top text-right">
                          <div className="font-bold text-slate-800 text-xs">{dateStr}</div>
                          <div className="text-slate-500 text-[11px] font-mono mt-0.5">{timeStr}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Universal Pagination Utility Footer */}
          <Pagination
            currentPage={1}
            totalPages={Math.max(1, Math.ceil(filteredTransactions.length / 15))}
            totalResults={filteredTransactions.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
