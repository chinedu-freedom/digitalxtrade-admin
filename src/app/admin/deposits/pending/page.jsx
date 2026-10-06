'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import PageLoader from '../../../../components/PageLoader';
import Pagination from '../../../../components/Pagination';
import { Search, Loader2, Check, X, Wallet } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

export default function AdminDepositsFilteredPage({
  title = 'Pending Deposits',
  filterStatus,
  statusFilter,
}) {
  const activeStatus = String(statusFilter || filterStatus || 'PENDING').toUpperCase();

  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');

  // Quick Approval Modal State
  const [approveModalDeposit, setApproveModalDeposit] = useState(null);
  const [modalTargetWallet, setModalTargetWallet] = useState('deposit');
  const [approving, setApproving] = useState(false);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const endpoint = activeStatus !== 'ALL' ? `/admin/deposits?status=${activeStatus}` : '/admin/deposits';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setDeposits(res.data.deposits || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [activeStatus]);

  const handleQuickApprove = async () => {
    if (!approveModalDeposit) return;
    try {
      setApproving(true);
      const res = await api.post(`/admin/deposits/${approveModalDeposit.id}/approve`, {
        targetWallet: modalTargetWallet
      });
      const targetLabel = modalTargetWallet === 'profit' ? 'Profit Balance (Earnings)' : 'Deposit Balance (Capital)';
      toast.success(res.data?.message || `Deposit approved and credited to ${targetLabel}!`);
      // Update local state so status updates or pending item disappears
      setDeposits((prev) =>
        prev.map((d) => (d.id === approveModalDeposit.id ? { ...d, status: 'APPROVED' } : d))
      );
      setApproveModalDeposit(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve deposit');
    } finally {
      setApproving(false);
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    if (activeStatus !== 'ALL') {
      const statusUpper = String(d.status || '').toUpperCase();
      if (activeStatus === 'APPROVED' && statusUpper !== 'APPROVED' && statusUpper !== 'SUCCESS' && statusUpper !== 'COMPLETED') {
        return false;
      }
      if (activeStatus === 'PENDING' && statusUpper !== 'PENDING') {
        return false;
      }
      if (activeStatus === 'REJECTED' && statusUpper !== 'REJECTED' && statusUpper !== 'FAILED' && statusUpper !== 'CANCELLED') {
        return false;
      }
      if (activeStatus === 'SUCCESSFUL' && statusUpper !== 'APPROVED' && statusUpper !== 'SUCCESS' && statusUpper !== 'COMPLETED') {
        return false;
      }
      if (activeStatus === 'INITIATED' && statusUpper !== 'INITIATED') {
        return false;
      }
    }

    if (searchUser.trim()) {
      const q = searchUser.toLowerCase().trim();
      const nameStr = String(d.user?.full_name || d.user?.username || '').toLowerCase();
      const userStr = String(d.user?.username || '').toLowerCase();
      const emailStr = String(d.user?.email || '').toLowerCase();
      if (!nameStr.includes(q) && !userStr.includes(q) && !emailStr.includes(q)) return false;
    }

    if (selectedCurrency !== 'All') {
      const curr = (d.gateway_code || d.payment_method || d.currency || '').toLowerCase();
      if (!curr.includes(selectedCurrency.toLowerCase())) return false;
    }

    if (selectedDateFilter !== 'All') {
      const itemDate = new Date(d.created_at);
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

  const formatDateTwoLines = (dateString) => {
    if (!dateString) return { dateStr: 'Sep-23-2026', timeStr: '05:39:36 PM' };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { dateStr: 'Sep-23-2026', timeStr: '05:39:36 PM' };

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

  if (loading) {
    return <PageLoader />;
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Bar */}
        <h1 className="text-xl font-bold text-slate-800 tracking-wide">
          {title}
        </h1>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* Search Username / Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Username / Email
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Username / Email"
                  className="w-full h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800"
                />
                <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3 flex items-center justify-center shrink-0 cursor-pointer">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>



            {/* eCurrencies Dropdown Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                eCurrency
              </label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-normal">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="hover:bg-slate-100">All</SelectItem>
                  <SelectItem value="TRC20" className="hover:bg-slate-100">USDT (TRC20)</SelectItem>
                  <SelectItem value="BEP20" className="hover:bg-slate-100">USDT (BEP20)</SelectItem>
                  <SelectItem value="BTC" className="hover:bg-slate-100">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="LTC" className="hover:bg-slate-100">Litecoin (LTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Dropdown Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Date Range
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
                  <SelectItem value="Last Month" className="hover:bg-slate-100">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Deposits Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-4">UserName</th>
                  <th className="py-3.5 px-4 text-center">Date</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Transaction Details</th>
                  <th className="py-3.5 px-4 text-center">Currency</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading deposit logs</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#0085d0]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      No deposit requests found in this category
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((d) => {
                    const userName = d.user?.username || d.username || d.user?.email || 'User';
                    const fullName = d.user?.full_name || d.fullName || d.user?.name || userName;
                    const userIdVal = d.user_id || d.user?.id || '';
                    const planTitle = d.plan || d.plan_title || d.plan_name || d.package_name || 'FOUNDATION PLAN';

                    const rawTrx = d.trx || d.transaction_id || d.tx_hash || d.txHash || d.hash || d.reference || d.trx_id;
                    const trxId = rawTrx ? String(rawTrx) : (d.id ? `TRX-${d.id}` : 'N/A');

                    const rawRegUser = d.registered_username || d.registered_user || d.user?.username || d.username || d.user?.email;
                    const registeredUser = rawRegUser ? String(rawRegUser) : userName;

                    const netAmt = parseFloat(d.amount || 0);

                    const rawGateway = d.gateway_code || d.payment_method || d.currency || d.gateway || 'USDT TRC20';
                    const gatewayName = String(rawGateway).toUpperCase();
                    let assetIcon = '₮';
                    let assetBg = 'bg-teal-600 text-white';
                    if (gatewayName.includes('ETH') || gatewayName.includes('BEP20')) {
                      assetIcon = 'Ξ';
                      assetBg = 'bg-indigo-600 text-white';
                    } else if (gatewayName.includes('BTC') || gatewayName.includes('BITCOIN')) {
                      assetIcon = '₿';
                      assetBg = 'bg-amber-500 text-slate-950';
                    } else if (gatewayName.includes('LTC') || gatewayName.includes('LITECOIN')) {
                      assetIcon = 'Ł';
                      assetBg = 'bg-slate-400 text-white';
                    }

                    const { dateStr, timeStr } = formatDateTwoLines(d.created_at || d.date);

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* UserName Column */}
                        <td className="py-4 px-4 align-top space-y-0.5">
                          <div className="font-extrabold text-sm text-slate-900">
                            <Link href={`/admin/users/detail/${userIdVal}`} className="hover:text-indigo-600 transition-colors">
                              {userName}
                            </Link>
                          </div>
                          <div className="text-slate-500 font-medium text-xs">
                            {fullName}
                          </div>
                        </td>

                        {/* Date & Time Column (2-Line Format) */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="font-bold text-slate-800 text-xs">{dateStr}</div>
                          <div className="text-slate-500 text-[11px] font-mono mt-0.5">{timeStr}</div>
                        </td>

                        {/* Plan Column */}
                        <td className="py-4 px-4 align-top font-bold text-slate-800 text-xs uppercase max-w-[200px]">
                          {planTitle}
                        </td>

                        {/* Amount Column */}
                        <td className="py-4 px-4 align-top text-right font-bold font-righteous text-slate-900 text-sm">
                          ${netAmt.toFixed(2)}
                        </td>

                        {/* Transaction Details Column */}
                        <td className="py-4 px-4 align-top text-xs space-y-1 max-w-[320px]">
                          <div className="text-slate-800 font-medium font-mono break-all">
                            <span className="font-bold text-slate-700 font-sans">Transaction ID:</span> {trxId}
                          </div>
                          <div className="text-slate-800 font-medium font-sans">
                            <span className="font-bold text-slate-700">Registered Username:</span> {registeredUser}
                          </div>
                        </td>

                        {/* Currency Name & Icon Badge Column */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-xs text-slate-800 whitespace-nowrap">{gatewayName}</span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ${assetBg}`}>
                              {assetIcon}
                            </span>
                          </div>
                        </td>

                        {/* Action Column with DETAILS and APPROVE Buttons */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <Link
                              href={`/admin/deposit/details/${d.id}`}
                              className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-md inline-block transition-all shadow-sm cursor-pointer"
                            >
                              DETAILS
                            </Link>
                            {String(d.status || '').toUpperCase() === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setApproveModalDeposit(d);
                                  setModalTargetWallet('deposit');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-md inline-flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                APPROVE
                              </button>
                            )}
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
            totalPages={Math.max(1, Math.ceil(filteredDeposits.length / 15))}
            totalResults={filteredDeposits.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>

        {/* Quick Approve Modal */}
        {approveModalDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-sans">
                      Confirm & Direct Deposit
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Deposit #{approveModalDeposit.id?.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setApproveModalDeposit(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Deposit Summary Box */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">User:</span>
                    <strong className="text-slate-900 font-semibold">
                      {approveModalDeposit.user?.username || approveModalDeposit.username || approveModalDeposit.user?.email}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <strong className="text-emerald-600 font-bold text-sm">
                      ${parseFloat(approveModalDeposit.amount || 0).toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Currency / Gateway:</span>
                    <strong className="text-slate-800">
                      {approveModalDeposit.gateway_code || approveModalDeposit.payment_method || approveModalDeposit.currency || 'Crypto'}
                    </strong>
                  </div>
                </div>

                {/* Target Wallet Radio Choice */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Choose Destination Balance:
                  </label>

                  <div className="space-y-2">
                    <label
                      onClick={() => setModalTargetWallet('deposit')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        modalTargetWallet === 'deposit'
                          ? 'border-[#0085d0] bg-blue-50/70'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modalTargetWallet"
                        value="deposit"
                        checked={modalTargetWallet === 'deposit'}
                        onChange={() => setModalTargetWallet('deposit')}
                        className="mt-0.5 text-[#0085d0] focus:ring-[#0085d0]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">Deposit Balance (Capital)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Adds funds to user's investment capital balance (yields daily returns).
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setModalTargetWallet('profit')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        modalTargetWallet === 'profit'
                          ? 'border-emerald-600 bg-emerald-50/70'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modalTargetWallet"
                        value="profit"
                        checked={modalTargetWallet === 'profit'}
                        onChange={() => setModalTargetWallet('profit')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-600"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">Profit Balance (Earnings)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Adds funds directly to user's withdrawable profit earnings.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={approving}
                  onClick={() => setApproveModalDeposit(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={approving}
                  onClick={handleQuickApprove}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {approving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Approve & Credit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
