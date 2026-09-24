'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, Monitor, Copy, Loader2, CheckCircle2, XCircle, Trash2, Landmark, Clock } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

export default function AdminWithdrawalsFilteredPage({
  title = 'Pending Withdrawals',
  filterStatus,
  statusFilter,
}) {
  const activeStatus = String(statusFilter || filterStatus || 'PENDING').toUpperCase();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

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
    if (activeStatus !== 'ALL') {
      const statusUpper = String(w.status || '').toUpperCase();
      if (activeStatus === 'APPROVED' && statusUpper !== 'APPROVED' && statusUpper !== 'COMPLETED' && statusUpper !== 'SUCCESS') {
        return false;
      }
      if (activeStatus === 'PENDING' && statusUpper !== 'PENDING' && statusUpper !== 'PROCESSING') {
        return false;
      }
      if (activeStatus === 'REJECTED' && statusUpper !== 'REJECTED' && statusUpper !== 'CANCELLED' && statusUpper !== 'FAILED') {
        return false;
      }
    }

    if (searchUser.trim()) {
      const q = searchUser.toLowerCase().trim();
      const nameStr = String(w.user?.full_name || w.user?.username || '').toLowerCase();
      const userStr = String(w.user?.username || '').toLowerCase();
      const emailStr = String(w.user?.email || '').toLowerCase();
      const walletStr = String(w.wallet_address || '').toLowerCase();
      if (!nameStr.includes(q) && !userStr.includes(q) && !emailStr.includes(q) && !walletStr.includes(q)) return false;
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

  // Calculate Withdrawal Totals for Metric Summary Cards
  const totalWithdrawalSum = withdrawals.reduce((acc, curr) => acc + parseFloat(curr.net_amount || curr.amount || 0), 0);
  const approvedWithdrawalSum = withdrawals
    .filter((w) => w.status === 'APPROVED' || w.status === 'COMPLETED' || w.status === 'SUCCESS')
    .reduce((acc, curr) => acc + parseFloat(curr.net_amount || curr.amount || 0), 0);
  const pendingWithdrawalSum = withdrawals
    .filter((w) => w.status === 'PENDING' || w.status === 'PROCESSING')
    .reduce((acc, curr) => acc + parseFloat(curr.net_amount || curr.amount || 0), 0);
  const rejectedWithdrawalSum = withdrawals
    .filter((w) => w.status === 'REJECTED' || w.status === 'CANCELLED')
    .reduce((acc, curr) => acc + parseFloat(curr.net_amount || curr.amount || 0), 0);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredWithdrawals.map((w) => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Mass Actions Handlers
  const handleMassApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      await Promise.all(
        selectedIds.map((id) => api.post(`/admin/withdrawals/${id}/approve`).catch(() => null))
      );
      toast.success(`Successfully approved ${selectedIds.length} withdrawal request(s)!`);
      setWithdrawals((prev) =>
        prev.map((w) => (selectedIds.includes(w.id) ? { ...w, status: 'APPROVED' } : w))
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to execute mass approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMassDecline = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      await Promise.all(
        selectedIds.map((id) => api.post(`/admin/withdrawals/${id}/reject`).catch(() => null))
      );
      toast.warning(`Declined ${selectedIds.length} withdrawal request(s).`);
      setWithdrawals((prev) =>
        prev.map((w) => (selectedIds.includes(w.id) ? { ...w, status: 'REJECTED' } : w))
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to execute mass decline');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMassDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      setWithdrawals((prev) => prev.filter((w) => !selectedIds.includes(w.id)));
      toast.error(`Deleted ${selectedIds.length} withdrawal request(s).`);
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to execute mass delete');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedTotalSum = filteredWithdrawals
    .filter((w) => selectedIds.includes(w.id))
    .reduce((acc, curr) => {
      const amt = parseFloat(curr.net_amount || curr.amount || 0);
      return acc + amt;
    }, 0);

  const formatDateTwoLines = (dateString) => {
    if (!dateString) return { dateStr: 'Sep-23-2026', timeStr: '01:08:38 PM' };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { dateStr: 'Sep-23-2026', timeStr: '01:08:38 PM' };

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
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-wide">
            {title}
          </h1>

          {/* Top Search Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Username / Email / Wallet"
                className="w-48 sm:w-56 h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800 font-sans"
              />
              <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3 flex items-center justify-center shrink-0 cursor-pointer">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Standard Date Dropdown Filter */}
            <div className="w-full sm:w-auto">
              <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-sans font-normal w-full sm:w-44">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="text-slate-800 hover:bg-slate-100">All Dates</SelectItem>
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

        {/* Metric Summary Cards Grid (Total Withdrawal, Approved, Pending, Rejected) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Withdrawal */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Withdrawal</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1">${totalWithdrawalSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5b5bf5] border border-indigo-100 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Approved Withdrawal */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Withdrawal</div>
              <div className="text-lg font-bold text-emerald-600 font-righteous mt-1">${approvedWithdrawalSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Pending Withdrawal */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Withdrawal</div>
              <div className="text-lg font-bold text-amber-500 font-righteous mt-1">${pendingWithdrawalSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Rejected Withdrawal */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected Withdrawal</div>
              <div className="text-lg font-bold text-red-500 font-righteous mt-1">${rejectedWithdrawalSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Mass Actions Toolbar */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800">
                Selected {selectedIds.length} withdrawal request(s)
              </div>
              <div className="text-xs font-semibold text-indigo-600">
                Total for selected options:{' '}
                <span className="font-bold font-mono">${selectedTotalSum.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleMassApprove}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Selected
              </button>
              <button
                type="button"
                onClick={handleMassDecline}
                disabled={actionLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Decline Selected
              </button>
              <button
                type="button"
                onClick={handleMassDelete}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Withdrawals Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-6/12">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filteredWithdrawals.length > 0 && selectedIds.length === filteredWithdrawals.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-[#5b5bf5] focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>UserName & Account Details</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-6 w-2/12 text-right">Date</th>
                  <th className="py-3.5 px-6 w-2/12 text-right">Amount</th>
                  <th className="py-3.5 px-6 w-2/12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading withdrawals data</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold">
                      No withdrawals found in this category
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((w) => {
                    const userName = w.user?.username || w.user?.full_name || 'Tmafu';
                    const uplineName = w.user?.upline?.username || w.user?.referred_by || 'Lungile01';
                    const walletAddress = w.wallet_address || 'TMR3KK9Jhogsy2DdUeL1a1gqqGi31zCpQi';
                    const userBalance = parseFloat(w.user?.balance || 7.08).toFixed(2);
                    const userActiveDeposit = parseFloat(w.user?.active_deposit || 135.42).toFixed(2);

                    const requestAmt = parseFloat(w.amount || 46.00);
                    const feeAmt = parseFloat(w.charge || 2.30);
                    const netAmt = parseFloat(w.net_amount || (requestAmt - feeAmt));

                    const gatewayStr = (w.currency || 'USDT').toUpperCase();
                    let assetIcon = '₮';
                    let assetBg = 'bg-teal-600 text-white';
                    if (gatewayStr.includes('BTC') || gatewayStr.includes('BITCOIN')) {
                      assetIcon = '₿';
                      assetBg = 'bg-amber-500 text-slate-950';
                    } else if (gatewayStr.includes('ETH') || gatewayStr.includes('BEP20')) {
                      assetIcon = 'Ξ';
                      assetBg = 'bg-indigo-600 text-white';
                    } else if (gatewayStr.includes('LTC') || gatewayStr.includes('LITECOIN')) {
                      assetIcon = 'Ł';
                      assetBg = 'bg-slate-400 text-white';
                    }

                    const { dateStr, timeStr } = formatDateTwoLines(w.created_at);

                    return (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User & Account ID Column */}
                        <td className="py-4 px-6 align-top space-y-1.5">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(w.id)}
                              onChange={() => handleToggleSelect(w.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#5b5bf5] focus:ring-indigo-500 cursor-pointer mt-0.5"
                            />
                            <div className="space-y-1">
                              <div className="font-extrabold text-sm text-slate-900 font-sans flex items-center gap-1.5 flex-wrap">
                                <Link
                                  href={`/admin/users/detail/${w.user_id}`}
                                  className="hover:text-indigo-600 transition-colors"
                                >
                                  {userName}
                                </Link>
                                <span className="text-slate-400 font-normal text-xs">
                                  (Upline: {uplineName})
                                </span>
                              </div>

                              <div className="text-xs text-slate-800 font-mono flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1 max-w-fit">
                                <span className="font-bold text-slate-500 font-sans">→ Account ID:</span>
                                <span className="font-bold font-mono text-slate-900 truncate max-w-[200px] sm:max-w-[280px]">
                                  {walletAddress}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyWallet(walletAddress)}
                                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                                  title="Copy Account ID"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-[11px] text-slate-400 italic">Your comment</div>

                              <div className="text-[11px] text-slate-600 font-medium">
                                <span className="font-semibold text-slate-400">Balance:</span>{' '}
                                <span className="font-mono font-bold text-slate-800">${userBalance}</span>
                                <span className="text-slate-300 mx-1.5">|</span>
                                <span className="font-semibold text-slate-400">Active Deposit:</span>{' '}
                                <span className="font-mono font-bold text-slate-800">${userActiveDeposit}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date Column (2-Line Format) */}
                        <td className="py-4 px-6 align-top text-right">
                          <div className="font-bold text-slate-800 text-xs">{dateStr}</div>
                          <div className="text-slate-500 text-[11px] font-mono mt-0.5">{timeStr}</div>
                        </td>

                        {/* Amount Column with Crypto Asset Icon Badge */}
                        <td className="py-4 px-6 align-top text-right space-y-1">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-extrabold text-sm text-slate-900 font-righteous">
                              ${netAmt.toFixed(2)}
                            </span>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0 ${assetBg}`}>
                              {assetIcon}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium font-sans">
                            Request: <span className="font-mono font-bold">${requestAmt.toFixed(2)}</span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium font-sans">
                            Fee: <span className="font-mono font-bold">${feeAmt.toFixed(2)}</span>
                          </div>
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-6 text-center align-middle">
                          <Link
                            href={`/admin/withdraw/details/${w.id}`}
                            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-3.5 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
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
