'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Loader2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import api from '../../../../lib/api';

export default function AdminStakingHistoryPage() {
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
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

  // Real-time Instant Filtering
  const filteredStakes = stakes.filter((s) => {
    if (username.trim()) {
      const q = username.toLowerCase();
      const uName = s.user?.full_name || '';
      const uHandle = s.user?.username || '';
      const uEmail = s.user?.email || '';
      const pName = s.plan?.name || '';
      if (
        !uName.toLowerCase().includes(q) &&
        !uHandle.toLowerCase().includes(q) &&
        !uEmail.toLowerCase().includes(q) &&
        !pName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }



    if (selectedStatus !== 'All') {
      const st = (s.status || '').toUpperCase();
      if (selectedStatus === 'Active' && !['ACTIVE', 'RUNNING'].includes(st)) return false;
      if (selectedStatus === 'Completed' && !['COMPLETED', 'MATURE'].includes(st)) return false;
      if (selectedStatus === 'Unavailable' && !['UNAVAILABLE', 'DISABLED', 'INACTIVE'].includes(st)) return false;
      if (selectedStatus === 'Pending' && !['PENDING'].includes(st)) return false;
      if (selectedStatus === 'Cancelled' && !['CANCELLED', 'REJECTED'].includes(st)) return false;
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
          Staking History
        </h1>

        {/* Filter Bar Controls (Instant Real-time Filtering) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* Search Username / Email / Plan */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">
                Username / Email / Plan
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-sans font-normal">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="text-slate-800 hover:bg-slate-100">All</SelectItem>
                  <SelectItem value="Active" className="text-slate-800 hover:bg-slate-100">Active</SelectItem>
                  <SelectItem value="Completed" className="text-slate-800 hover:bg-slate-100">Completed</SelectItem>
                  <SelectItem value="Unavailable" className="text-slate-800 hover:bg-slate-100">Unavailable</SelectItem>
                  <SelectItem value="Pending" className="text-slate-800 hover:bg-slate-100">Pending</SelectItem>
                  <SelectItem value="Cancelled" className="text-slate-800 hover:bg-slate-100">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Dropdown Filter */}
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

        {/* Staking Logs Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Vibrant Indigo Table Header */}
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Plan</th>
                  <th className="py-3.5 px-6">Interest</th>
                  <th className="py-3.5 px-6">Total Return</th>
                  <th className="py-3.5 px-6">Start Date</th>
                  <th className="py-3.5 px-6">Mature Date</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading staking data</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredStakes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      No staking records found
                    </td>
                  </tr>
                ) : (
                  filteredStakes.map((log) => {
                    const uName = log.user?.full_name || log.user?.username || 'User';
                    const uHandle = log.user?.username ? `@${log.user.username}` : '';
                    const planName = log.plan?.title || log.plan?.name || 'Staking Plan';
                    const amt = parseFloat(log.amount || 0);
                    const intRate = parseFloat(log.plan?.daily_return_percent || log.daily_profit || log.interest_rate || 0);
                    const totalRet = parseFloat(log.total_earned || (amt * (1 + intRate / 100)));
                    const startDateStr = log.created_at ? new Date(log.created_at).toLocaleString('en-US', { hour12: true }) : 'Recently';
                    const endDateStr = log.end_date ? new Date(log.end_date).toLocaleString('en-US', { hour12: true }) : 'Pending';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User Column */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{uName}</div>
                          <span className="text-[#5b5bf5] font-semibold text-[11px] block">
                            {uHandle}
                          </span>
                          {log.user?.email && <div className="text-[10px] text-slate-400 font-sans">{log.user.email}</div>}
                        </td>

                        {/* Plan Column */}
                        <td className="py-4 px-6 font-bold text-slate-800">{planName}</td>

                        {/* Interest Column */}
                        <td className="py-4 px-6">
                          <div className="font-mono text-slate-800">${amt.toFixed(2)} USDT</div>
                          <div className="font-bold text-emerald-600 text-[11px]">{intRate.toFixed(2)}%</div>
                        </td>

                        {/* Total Return Column */}
                        <td className="py-4 px-6 font-bold text-slate-900 font-righteous">
                          ${totalRet.toFixed(2)} USDT
                        </td>

                        {/* Start Date Column */}
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800">{startDateStr}</div>
                        </td>

                        {/* Mature Date Column */}
                        <td className="py-4 px-6 font-medium text-slate-800">
                          {endDateStr}
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-3.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                              log.status === 'COMPLETED' || log.status === 'Mature'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                                : log.status === 'ACTIVE' || log.status === 'Running'
                                ? 'bg-amber-50 text-amber-500 border-amber-300'
                                : 'bg-indigo-50 text-indigo-600 border-indigo-300'
                            }`}
                          >
                            {log.status}
                          </span>
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
