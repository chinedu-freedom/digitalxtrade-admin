'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, Monitor, UserCheck, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';

export default function AdminUsersFilteredPage({ title = 'Active Users', filterType = 'active' }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    // Apply Category Filter
    if (filterType === 'active' && !u.is_active) return false;
    if (filterType === 'banned' && u.is_active) return false;
    if (filterType === 'email-unverified' && u.email_verified) return false;
    if (filterType === 'with-balance' && parseFloat(u.balance || 0) <= 0) return false;

    // Apply Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameStr = String(u.name || u.full_name || '').toLowerCase();
      const userStr = String(u.username || '').toLowerCase();
      const emailStr = String(u.email || '').toLowerCase();
      const mobileStr = String(u.mobile || '').toLowerCase();
      return nameStr.includes(q) || userStr.includes(q) || emailStr.includes(q) || mobileStr.includes(q);
    }
    return true;
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            {title}
          </h1>

          {/* Search Bar Input Group */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Username / Email"
              className="w-48 sm:w-64 h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800 placeholder-slate-400 font-sans"
            />
            <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3.5 flex items-center justify-center shrink-0 transition-all cursor-pointer">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Users Table Container (Matching Exact Reference Screenshot) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Vibrant Indigo Table Header */}
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email-Mobile</th>
                  <th className="py-3.5 px-6 text-center">Country</th>
                  <th className="py-3.5 px-6">Joined At</th>
                  <th className="py-3.5 px-6">Balance</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading users data</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      No users found in this category
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const fullName = u.full_name || u.username || 'User';
                    const usernameStr = u.username ? `@${u.username}` : '@user';
                    const joinedStr = u.created_at ? new Date(u.created_at).toLocaleString('en-US', { hour12: true }) : 'Recently';
                    const formattedBalance = `$${parseFloat(u.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User Column */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{fullName}</div>
                          <Link
                            href={`/admin/users/detail/${u.id}`}
                            className="text-[#5b5bf5] font-semibold hover:underline text-[11px]"
                          >
                            {usernameStr}
                          </Link>
                        </td>

                        {/* Email-Mobile Column */}
                        <td className="py-4 px-6">
                          <div className="text-slate-500 font-sans">{u.email}</div>
                          <div className="text-slate-400 font-sans text-[11px]">{u.mobile || 'N/A'}</div>
                        </td>

                        {/* Country Column */}
                        <td className="py-4 px-6 text-center font-bold text-slate-700">
                          {u.country || '-'}
                        </td>

                        {/* Joined At Column */}
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800">{joinedStr}</div>
                        </td>

                        {/* Balance Column */}
                        <td className="py-4 px-6 font-bold text-slate-800 font-righteous">
                          {formattedBalance}
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/users/detail/${u.id}`}
                              className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Monitor className="w-3.5 h-3.5" /> Details
                            </Link>
                          </div>
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
            totalPages={4}
            totalResults={filteredUsers.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
