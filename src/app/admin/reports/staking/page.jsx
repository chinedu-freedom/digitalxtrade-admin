'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, Loader2, Layers, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import api from '../../../../lib/api';

export default function AdminStakingHistoryPage() {
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');

  const fetchStakes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/staking-history');
      if (res.data && res.data.success) {
        setStakes(res.data.stakes || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin staking history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakes();
  }, []);

  const filteredStakes = stakes.filter((s) => {
    if (username.trim()) {
      const q = username.toLowerCase();
      const uName = String(s.user?.full_name || '').toLowerCase();
      const uHandle = String(s.user?.username || '').toLowerCase();
      const uEmail = String(s.user?.email || '').toLowerCase();
      const pName = String(s.plan?.name || s.plan?.title || '').toLowerCase();
      if (!uName.includes(q) && !uHandle.includes(q) && !uEmail.includes(q) && !pName.includes(q)) {
        return false;
      }
    }

    if (selectedOperation !== 'All') {
      const isReturn = s.type === 'RETURN' || s.status === 'COMPLETED' || s.status === 'MATURE';
      if (selectedOperation === 'Plan Deposit' && isReturn) return false;
      if (selectedOperation === 'Deposit Return' && !isReturn) return false;
    }

    if (selectedDateFilter !== 'All') {
      const itemDate = new Date(s.created_at);
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
      }
    }

    return true;
  });

  // Calculate Staking Totals for Metric Summary Cards
  const totalStakedSum = stakes.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const activeStakedSum = stakes
    .filter((s) => s.status === 'ACTIVE' || s.status === 'RUNNING')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const returnedStakedSum = stakes
    .filter((s) => s.status === 'COMPLETED' || s.status === 'MATURE' || s.type === 'RETURN')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const formatDateTwoLines = (dateString) => {
    if (!dateString) return { dateStr: 'Sep-23-2026', timeStr: '08:34:02 PM' };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { dateStr: 'Sep-23-2026', timeStr: '08:34:02 PM' };

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
          Staking & Investment Plan History
        </h1>

        {/* Metric Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Staked Amount */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staked Amount</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1">${totalStakedSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Active Investment Plans */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Investment Plans</div>
              <div className="text-lg font-bold text-amber-500 font-righteous mt-1">${activeStakedSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Returned Principal */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Returned Principal</div>
              <div className="text-lg font-bold text-emerald-600 font-righteous mt-1">${returnedStakedSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* Search Username / Plan */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Search Username / Plan
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username / Plan"
                  className="w-full h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800"
                />
                <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3.5 flex items-center justify-center shrink-0 cursor-pointer">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Operation Type Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Operation Type
              </label>
              <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-normal">
                  <SelectValue placeholder="All Operations" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="hover:bg-slate-100">All Operations</SelectItem>
                  <SelectItem value="Plan Deposit" className="hover:bg-slate-100">Plan Deposits (Debits)</SelectItem>
                  <SelectItem value="Deposit Return" className="hover:bg-slate-100">Deposit Returns (Credits)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Dropdown Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Date
              </label>
              <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-normal">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="hover:bg-slate-100">All Dates</SelectItem>
                  <SelectItem value="Today" className="hover:bg-slate-100">Today</SelectItem>
                  <SelectItem value="Yesterday" className="hover:bg-slate-100">Yesterday</SelectItem>
                  <SelectItem value="Last 7 Days" className="hover:bg-slate-100">Last 7 Days</SelectItem>
                  <SelectItem value="Last 15 Days" className="hover:bg-slate-100">Last 15 Days</SelectItem>
                  <SelectItem value="Last 30 Days" className="hover:bg-slate-100">Last 30 Days</SelectItem>
                  <SelectItem value="This Month" className="hover:bg-slate-100">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Investment Plan Activity Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-6/12">UserName</th>
                  <th className="py-3.5 px-6 w-3/12 text-right">Amount</th>
                  <th className="py-3.5 px-6 w-3/12 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading investment plan activity</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredStakes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                      No staking or investment plan records found
                    </td>
                  </tr>
                ) : (
                  filteredStakes.map((log) => {
                    const uName = log.user?.username || log.user?.full_name || 'Agnes1';
                    const userIdVal = log.user_id || log.user?.id;
                    const planTitle = (log.plan?.name || log.plan?.title || 'FOUNDATION PLAN').toUpperCase();

                    const isReturn = log.type === 'RETURN' || log.status === 'COMPLETED' || log.status === 'MATURE';
                    const amountVal = parseFloat(log.amount || 134.00);

                    const gatewayStr = (log.currency || 'USDT').toUpperCase();
                    let assetIcon = '₮';
                    let assetBg = 'bg-teal-600 text-white';
                    if (gatewayStr.includes('BEP20') || gatewayStr.includes('ETH')) {
                      assetIcon = 'Ξ';
                      assetBg = 'bg-indigo-600 text-white';
                    } else if (gatewayStr.includes('BTC')) {
                      assetIcon = '₿';
                      assetBg = 'bg-amber-500 text-slate-950';
                    }

                    const { dateStr, timeStr } = formatDateTwoLines(log.created_at);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* UserName Column */}
                        <td className="py-4 px-6 align-top space-y-1">
                          <div className="font-extrabold text-sm text-slate-900">
                            <Link href={`/admin/users/detail/${userIdVal}`} className="hover:text-indigo-600 transition-colors">
                              {uName}
                            </Link>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            <span className="font-semibold text-slate-700">
                              {isReturn ? 'Deposit returned to user account:' : 'Deposit:'}
                            </span>{' '}
                            <span>{isReturn ? 'Deposit return' : `Deposit to ${planTitle}`}</span>
                          </div>
                        </td>

                        {/* Amount Column with Crypto Asset Icon Badge */}
                        <td className="py-4 px-6 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-bold font-righteous text-sm ${isReturn ? 'text-emerald-600' : 'text-red-500'}`}>
                              ${amountVal.toFixed(2)}
                            </span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ${assetBg}`}>
                              {assetIcon}
                            </span>
                          </div>
                        </td>

                        {/* Date & Time Column (2-Line Format) */}
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

          {/* Pagination Utility Footer */}
          <Pagination
            currentPage={1}
            totalPages={Math.max(1, Math.ceil(filteredStakes.length / 15))}
            totalResults={filteredStakes.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
