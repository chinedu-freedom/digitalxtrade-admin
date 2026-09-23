'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../../components/AdminSidebarLayout';
import Pagination from '../../../../../components/Pagination';
import { Loader2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../../components/ui/select';
import api from '../../../../../lib/api';

function UserLoginHistoryContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch user login history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredLogins = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = u.full_name || '';
      const uname = u.username || '';
      const uemail = u.email || '';
      const matches = name.toLowerCase().includes(q) || uname.toLowerCase().includes(q) || uemail.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (selectedDateFilter !== 'All') {
      const itemDate = new Date(u.last_login_at || u.created_at);
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
            User Login History
          </h1>

          {/* Top Search Controls (Full Width on Mobile) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Username / Email Input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Username / Email"
              className="w-full sm:w-64 h-10 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
            />

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

        {/* User Login History Table Container (Matching Exact Reference Screenshot 2) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Vibrant Indigo Table Header */}
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Login at</th>
                  <th className="py-3.5 px-6 text-center">IP</th>
                  <th className="py-3.5 px-6 text-center">Location</th>
                  <th className="py-3.5 px-6 text-right">Browser | OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading login history</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredLogins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      No login records found
                    </td>
                  </tr>
                ) : (
                  filteredLogins.map((u) => {
                    const fullName = u.full_name || u.username || 'User';
                    const usernameStr = u.username ? `@${u.username}` : '@user';
                    const loginDate = u.created_at ? new Date(u.created_at).toLocaleString('en-US', { hour12: true }) : 'Recently';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User Column */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{fullName}</div>
                          <span className="text-[#5b5bf5] font-semibold text-[11px] block">
                            {usernameStr}
                          </span>
                          {u.email && <div className="text-[10px] text-slate-400 font-sans">{u.email}</div>}
                        </td>

                        {/* Login at Column */}
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800">{loginDate}</div>
                        </td>

                        {/* IP Column */}
                        <td className="py-4 px-6 text-center font-bold text-[#5b5bf5] font-mono">
                          127.0.0.1
                        </td>

                        {/* Location Column */}
                        <td className="py-4 px-6 text-center text-slate-500 font-medium">
                          {u.country || 'Localhost'}
                        </td>

                        {/* Browser | OS Column */}
                        <td className="py-4 px-6 text-right font-medium text-slate-600">
                          Chrome | Windows 10
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
            totalPages={Math.max(1, Math.ceil(filteredLogins.length / 15))}
            totalResults={filteredLogins.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}

export default function UserLoginHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <UserLoginHistoryContent />
    </Suspense>
  );
}
