'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Loader2 } from 'lucide-react';
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

    const isMinus = ['WITHDRAWAL', 'ADMIN_DEBIT', 'STAKE'].includes(t.type);
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

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
          Transaction Logs
        </h1>

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

        {/* Transaction Logs Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Vibrant Indigo Table Header */}
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">TRX ID</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Transacted</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Post Balance</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading transactions data</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                      Data not found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => {
                    const userName = trx.user?.full_name || trx.user?.username || 'User';
                    const userHandle = trx.user?.username ? `@${trx.user.username}` : '';
                    const refCode = trx.reference_id || trx.id.substring(0, 10).toUpperCase();
                    const txDate = trx.created_at ? new Date(trx.created_at).toLocaleString('en-US', { hour12: true }) : 'Recently';
                    
                    const rawType = (trx.type || '').toUpperCase();
                    const isPositive = !['WITHDRAWAL', 'ADMIN_DEBIT', 'STAKE', 'DEBIT'].includes(rawType);
                    
                    let typeLabel = 'TRANSACTION';
                    if (['DEPOSIT', 'ADMIN_CREDIT', 'WELCOME_BONUS', 'DEPOSIT_BONUS'].includes(rawType) || rawType.includes('DEPOSIT') || rawType.includes('CREDIT')) {
                      typeLabel = 'DEPOSIT';
                    } else if (['WITHDRAWAL', 'ADMIN_DEBIT', 'WITHDRAW'].includes(rawType) || rawType.includes('WITHDRAW') || rawType.includes('DEBIT')) {
                      typeLabel = 'WITHDRAWAL';
                    } else if (rawType === 'STAKE_PROFIT' || rawType === 'STAKING_YIELD') {
                      typeLabel = 'STAKING PROFIT';
                    } else if (rawType === 'STAKE' || rawType === 'STAKE_BUY') {
                      typeLabel = 'STAKING PURCHASE';
                    } else if (rawType === 'DAILY_CHECKIN') {
                      typeLabel = 'DAILY CHECKIN';
                    } else if (rawType === 'SPIN_WIN' || rawType === 'LUCKY_SPIN') {
                      typeLabel = 'LUCKY SPIN';
                    } else if (rawType === 'TASK_REWARD') {
                      typeLabel = 'TASK REWARD';
                    } else if (rawType === 'GIFT_BONUS') {
                      typeLabel = 'GIFT BONUS';
                    } else if (rawType === 'REFERRAL_COMMISSION') {
                      typeLabel = 'REFERRAL BONUS';
                    } else {
                      typeLabel = rawType || 'TRANSACTION';
                    }

                    const rawStatus = (trx.status || 'COMPLETED').toUpperCase();
                    const isCompleted = ['COMPLETED', 'APPROVED', 'SUCCESSFUL', 'SUCCESS'].includes(rawStatus);
                    const isPending = ['PENDING', 'PROCESSING'].includes(rawStatus);

                    let statusText = 'Completed';
                    let statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';

                    if (rawType === 'ADMIN_CREDIT') {
                      statusText = 'Deposit credited';
                      statusColor = 'bg-blue-50 text-blue-600 border-blue-200';
                    } else if (rawType === 'ADMIN_DEBIT') {
                      statusText = 'Deposit debited';
                      statusColor = 'bg-red-50 text-red-600 border-red-200';
                    } else if (rawType === 'DEPOSIT') {
                      statusText = 'Deposit successful';
                      statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                    } else if (rawType === 'WITHDRAWAL' || rawType === 'WITHDRAW') {
                      if (isCompleted) {
                        statusText = 'Withdrawal successful';
                        statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                      } else if (isPending) {
                        statusText = 'Pending';
                        statusColor = 'bg-amber-50 text-amber-600 border-amber-200';
                      } else {
                        statusText = 'Rejected';
                        statusColor = 'bg-red-50 text-red-600 border-red-200';
                      }
                    } else {
                      if (isCompleted) {
                        statusText = 'Completed';
                        statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                      } else if (isPending) {
                        statusText = 'Pending';
                        statusColor = 'bg-amber-50 text-amber-600 border-amber-200';
                      } else {
                        statusText = 'Rejected';
                        statusColor = 'bg-red-50 text-red-600 border-red-200';
                      }
                    }

                    const formattedAmount = `${isPositive ? '+' : '-'} $${parseFloat(trx.amount || 0).toFixed(2)}`;
                    const formattedPostBal = `$${parseFloat(trx.balance_after || 0).toFixed(2)}`;

                    return (
                      <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User Column */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{userName}</div>
                          <span className="text-[#5b5bf5] font-semibold text-[11px] block">
                            {userHandle}
                          </span>
                          {trx.user?.email && <div className="text-[10px] text-slate-400 font-sans">{trx.user.email}</div>}
                        </td>

                        {/* TRX Column */}
                        <td className="py-4 px-6 font-mono font-bold text-slate-700">
                          {refCode}
                        </td>

                        {/* Type Column */}
                        <td className="py-4 px-6">
                          <span
                            className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase border whitespace-nowrap inline-flex items-center justify-center ${
                              !isPositive
                                ? 'bg-red-50 text-red-600 border-red-200'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}
                          >
                            {typeLabel}
                          </span>
                        </td>

                        {/* Transacted Column */}
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800">{txDate}</div>
                        </td>

                        {/* Amount Column */}
                        <td className="py-4 px-6 font-bold font-righteous">
                          <span className={isPositive ? 'text-emerald-600' : 'text-red-500'}>
                            {formattedAmount}
                          </span>
                        </td>

                        {/* Post Balance Column */}
                        <td className="py-4 px-6 font-semibold text-slate-800 font-mono">
                          {formattedPostBal}
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase inline-block ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>

                        {/* Details Column */}
                        <td className="py-4 px-6 text-right text-slate-500 font-medium">
                          {(trx.description || typeLabel).replace(/OxaPay\s*/gi, '').trim()}
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
