'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, Loader2, ArrowUpDown, CheckCircle, Ban, AlertTriangle, Trash2, CheckSquare, Users, UserCheck, Wallet, Layers } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminUsersFilteredPage({ title = 'Active Users', filterType = 'active' }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('username_asc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Filter users based on category and search query
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

  // Calculate Summary Totals for Users
  const totalUserCount = users.length;
  const activeUserCount = users.filter((u) => u.is_active).length;
  const totalUserBalances = users.reduce((acc, u) => acc + parseFloat(u.balance || 0), 0);
  const totalStakedAssets = users.reduce((acc, u) => acc + parseFloat(u.staked_balance || u.assets || 0), 0);

  // Sort users based on selected sorting option
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const getVal = (obj, field) => {
      switch (field) {
        case 'username':
          return String(obj.username || '').toLowerCase();
        case 'registration':
          return new Date(obj.created_at || 0).getTime();
        case 'balance':
          return parseFloat(obj.balance || 0);
        case 'funded':
          return parseFloat(obj.total_deposit || obj.funded || 0);
        case 'withdrew':
          return parseFloat(obj.total_withdrawal || obj.withdrew || 0);
        case 'commissions':
          return parseFloat(obj.referral_commissions || obj.commissions || 0);
        case 'assets':
          return parseFloat(obj.staked_balance || obj.assets || 0);
        case 'earnings':
          return parseFloat(obj.total_earning || obj.earnings || 0);
        default:
          return 0;
      }
    };

    const [field, dir] = sortBy.split('_');
    const valA = getVal(a, field);
    const valB = getVal(b, field);

    if (typeof valA === 'string') {
      return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return dir === 'asc' ? valA - valB : valB - valA;
  });

  const handleToggleSelectAllBtn = () => {
    if (selectedUsers.length === sortedUsers.length && sortedUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(sortedUsers.map((u) => u.id));
    }
  };

  const handleSelectAllCheckbox = (e) => {
    if (e.target.checked) {
      setSelectedUsers(sortedUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Mass Actions Handlers
  const handleMassSetActive = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user first');
      return;
    }
    try {
      setActionLoading(true);
      await Promise.all(
        selectedUsers.map((id) => api.put(`/admin/users/${id}`, { is_active: true }).catch(() => null))
      );
      setUsers((prev) =>
        prev.map((u) => (selectedUsers.includes(u.id) ? { ...u, is_active: true } : u))
      );
      toast.success(`Set ${selectedUsers.length} user(s) to ACTIVE successfully!`);
      setSelectedUsers([]);
    } catch (err) {
      toast.error('Failed to set users active');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMassSetDisabled = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user first');
      return;
    }
    try {
      setActionLoading(true);
      await Promise.all(
        selectedUsers.map((id) => api.put(`/admin/users/${id}`, { is_active: false }).catch(() => null))
      );
      setUsers((prev) =>
        prev.map((u) => (selectedUsers.includes(u.id) ? { ...u, is_active: false } : u))
      );
      toast.warning(`Set ${selectedUsers.length} user(s) to DISABLED.`);
      setSelectedUsers([]);
    } catch (err) {
      toast.error('Failed to disable selected users');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMassSetSuspended = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user first');
      return;
    }
    try {
      setActionLoading(true);
      await Promise.all(
        selectedUsers.map((id) => api.put(`/admin/users/${id}`, { is_active: false, is_suspended: true }).catch(() => null))
      );
      setUsers((prev) =>
        prev.map((u) => (selectedUsers.includes(u.id) ? { ...u, is_active: false, is_suspended: true } : u))
      );
      toast.warning(`Set ${selectedUsers.length} user(s) to SUSPENDED.`);
      setSelectedUsers([]);
    } catch (err) {
      toast.error('Failed to suspend selected users');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMassDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user first');
      return;
    }
    try {
      setActionLoading(true);
      await Promise.all(
        selectedUsers.map((id) => api.delete(`/admin/users/${id}`).catch(() => null))
      );
      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
      toast.error(`Deleted ${selectedUsers.length} user(s) permanently.`);
      setSelectedUsers([]);
    } catch (err) {
      toast.error('Failed to delete selected users');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Metric Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1">{totalUserCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5b5bf5] border border-indigo-100 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Users</div>
              <div className="text-lg font-bold text-emerald-600 font-righteous mt-1">{activeUserCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Total User Balances */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Balances</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1 flex items-center gap-1.5">
                <span>${totalUserBalances.toFixed(2)}</span>
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[9px]">₮</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Total Staked Assets */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staked Assets</div>
              <div className="text-lg font-bold text-amber-500 font-righteous mt-1 flex items-center gap-1.5">
                <span>${totalStakedAssets.toFixed(2)}</span>
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[9px]">₮</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-wide">
            {title}
          </h1>

          {/* Controls: Search Bar & Sorting Dropdown */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 outline-none text-xs font-bold text-slate-700 cursor-pointer py-1"
              >
                <option value="username_asc">Username ↑</option>
                <option value="username_desc">Username ↓</option>
                <option value="registration_asc">Registration ↑</option>
                <option value="registration_desc">Registration ↓</option>
                <option value="balance_asc">Balance ↑</option>
                <option value="balance_desc">Balance ↓</option>
                <option value="funded_asc">Funded ↑</option>
                <option value="funded_desc">Funded ↓</option>
                <option value="withdrew_asc">Withdrew ↑</option>
                <option value="withdrew_desc">Withdrew ↓</option>
                <option value="commissions_asc">Commissions ↑</option>
                <option value="commissions_desc">Commissions ↓</option>
                <option value="assets_asc">Assets ↑</option>
                <option value="assets_desc">Assets ↓</option>
                <option value="earnings_asc">Earnings ↑</option>
                <option value="earnings_desc">Earnings ↓</option>
              </select>
            </div>

            {/* Search Bar Input Group */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex-1 md:flex-none">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Username / Email"
                className="w-full md:w-56 h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800 placeholder-slate-400 font-sans"
              />
              <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3.5 flex items-center justify-center shrink-0 transition-all cursor-pointer">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Mass Actions Button Toolbar (Matching User Request Image) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* SELECT ALL Button */}
            <button
              type="button"
              onClick={handleToggleSelectAllBtn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              {selectedUsers.length > 0 && selectedUsers.length === sortedUsers.length ? 'DESELECT ALL' : 'SELECT ALL'}
            </button>

            {/* SET ACTIVE Button */}
            <button
              type="button"
              onClick={handleMassSetActive}
              disabled={actionLoading || selectedUsers.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> SET ACTIVE
            </button>

            {/* SET DISABLED Button */}
            <button
              type="button"
              onClick={handleMassSetDisabled}
              disabled={actionLoading || selectedUsers.length === 0}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Ban className="w-4 h-4" /> SET DISABLED
            </button>

            {/* SET SUSPENDED Button */}
            <button
              type="button"
              onClick={handleMassSetSuspended}
              disabled={actionLoading || selectedUsers.length === 0}
              className="bg-amber-300 hover:bg-amber-400 text-amber-950 font-bold text-xs uppercase px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border border-amber-300"
            >
              <AlertTriangle className="w-4 h-4" /> SET SUSPENDED
            </button>

            {/* DELETE Button */}
            <button
              type="button"
              onClick={handleMassDelete}
              disabled={actionLoading || selectedUsers.length === 0}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> DELETE
            </button>
          </div>

          {selectedUsers.length > 0 && (
            <div className="text-xs font-bold text-indigo-600 font-sans">
              {selectedUsers.length} user(s) selected
            </div>
          )}
        </div>

        {/* Users Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-5/12">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={sortedUsers.length > 0 && selectedUsers.length === sortedUsers.length}
                        onChange={handleSelectAllCheckbox}
                        className="w-4 h-4 rounded border-slate-300 text-[#5b5bf5] focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>User</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-6 w-4/12">Amounts</th>
                  <th className="py-3.5 px-6 w-3/12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading users data</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                      No users found in this category
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((u) => {
                    const fullName = u.full_name || u.name || 'Nolitha';
                    const usernameStr = u.username || 'Ndawana';
                    const sinceStr = u.created_at
                      ? new Date(u.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })
                      : 'Sep-24-2026';
                    const uplineUsername = u.upline?.username || u.referred_by || 'Succ141';
                    const uplineId = u.upline?.id || u.upline_id;

                    const balanceVal = parseFloat(u.balance || 0);
                    const fundedVal = parseFloat(u.total_deposit || u.funded || 0);
                    const withdrawVal = parseFloat(u.total_withdrawal || u.withdrew || 0);
                    const commissionVal = parseFloat(u.referral_commissions || u.commissions || 0);
                    const assetsVal = parseFloat(u.staked_balance || u.assets || 0);
                    const earningsVal = parseFloat(u.total_earning || u.earnings || 0);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User Column */}
                        <td className="py-4 px-6 align-top space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(u.id)}
                              onChange={() => handleToggleSelect(u.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#5b5bf5] focus:ring-indigo-500 cursor-pointer"
                            />
                            <Link
                              href={`/admin/users/detail/${u.id}`}
                              className="font-extrabold text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                            >
                              {usernameStr}
                            </Link>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-xs ${
                                u.is_suspended
                                  ? 'bg-amber-400 text-amber-950'
                                  : u.is_active !== false
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {u.is_suspended ? 'Suspended' : u.is_active !== false ? 'Active' : 'Disabled'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 pl-6">
                            <span className="font-semibold text-slate-400">Name:</span>{' '}
                            <span className="italic font-medium text-slate-800">{fullName}</span>
                          </div>

                          <div className="text-xs text-slate-600 pl-6">
                            <span className="font-semibold text-slate-400">Since:</span>{' '}
                            <span className="font-medium text-slate-800">{sinceStr}</span>
                          </div>

                          <div className="text-xs text-slate-600 pl-6">
                            <span className="font-semibold text-slate-400">Upline:</span>{' '}
                            {uplineUsername && uplineUsername !== 'none' ? (
                              <Link
                                href={uplineId ? `/admin/users/detail/${uplineId}` : `#`}
                                className="font-bold text-indigo-600 hover:underline"
                              >
                                {uplineUsername}
                              </Link>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </div>
                        </td>

                        {/* Amounts Column */}
                        <td className="py-4 px-6 align-top font-mono text-xs">
                          <div className="space-y-1.5 max-w-[220px]">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-500 font-sans">Balance:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-800">${balanceVal.toFixed(2)}</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[8px] shrink-0 font-sans">₮</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-500 font-sans">Funded:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-800">${fundedVal.toFixed(2)}</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[8px] shrink-0 font-sans">₮</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-500 font-sans">Withdraw:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-800">${withdrawVal.toFixed(2)}</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[8px] shrink-0 font-sans">₮</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-500 font-sans">Commission:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-800">${commissionVal.toFixed(2)}</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[8px] shrink-0 font-sans">₮</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-500 font-sans">Assets:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-800">${assetsVal.toFixed(2)}</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[8px] shrink-0 font-sans">₮</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-500 font-sans">Earnings:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-800">${earningsVal.toFixed(2)}</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[8px] shrink-0 font-sans">₮</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-6 text-center align-middle">
                          <div className="flex items-center justify-center">
                            <Link
                              href={`/admin/users/detail/${u.id}`}
                              className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-3.5 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Search className="w-3.5 h-3.5" /> Details
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
            totalPages={Math.ceil((sortedUsers.length || 1) / 15)}
            totalResults={sortedUsers.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
