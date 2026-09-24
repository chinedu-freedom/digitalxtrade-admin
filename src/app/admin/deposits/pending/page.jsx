'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, Loader2, Wallet, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import api from '../../../../lib/api';

export default function AdminDepositsFilteredPage({
  title = 'Deposits & External Processings Log',
  filterStatus,
  statusFilter,
}) {
  const activeStatus = String(statusFilter || filterStatus || 'ALL').toUpperCase();

  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('All');
  const [selectedType, setSelectedType] = useState('Transfer from external processings');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/deposits');
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
  }, []);

  const filteredDeposits = deposits.filter((d) => {
    if (activeStatus !== 'ALL') {
      const statusUpper = String(d.status || '').toUpperCase();
      if (activeStatus === 'APPROVED' && statusUpper !== 'APPROVED' && statusUpper !== 'SUCCESS' && statusUpper !== 'COMPLETED') {
        return false;
      }
      if (activeStatus === 'PENDING' && statusUpper !== 'PENDING' && statusUpper !== 'INITIATED') {
        return false;
      }
      if (activeStatus === 'REJECTED' && statusUpper !== 'REJECTED' && statusUpper !== 'FAILED' && statusUpper !== 'CANCELLED') {
        return false;
      }
      if (activeStatus === 'SUCCESSFUL' && statusUpper !== 'APPROVED' && statusUpper !== 'SUCCESS' && statusUpper !== 'COMPLETED') {
        return false;
      }
      if (activeStatus === 'INITIATED' && statusUpper !== 'INITIATED' && statusUpper !== 'PENDING') {
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

  // Calculate Deposit Totals for Metric Summary Cards
  const totalDepositSum = deposits.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const approvedDepositSum = deposits
    .filter((d) => d.status === 'APPROVED' || d.status === 'SUCCESS' || d.status === 'COMPLETED')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const pendingDepositSum = deposits
    .filter((d) => d.status === 'PENDING' || d.status === 'INITIATED')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const rejectedDepositSum = deposits
    .filter((d) => d.status === 'REJECTED' || d.status === 'FAILED')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

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

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Bar */}
        <h1 className="text-xl font-bold text-slate-800 tracking-wide">
          {title}
        </h1>

        {/* Metric Summary Cards Grid (Total Deposit, Approved, Pending, Rejected) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Deposit */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Deposit</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1">${totalDepositSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Approved Deposit */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Deposit</div>
              <div className="text-lg font-bold text-emerald-600 font-righteous mt-1">${approvedDepositSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Pending Deposit */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Deposit</div>
              <div className="text-lg font-bold text-amber-500 font-righteous mt-1">${pendingDepositSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Rejected Deposit */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected Deposit</div>
              <div className="text-lg font-bold text-red-500 font-righteous mt-1">${rejectedDepositSum.toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
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

            {/* Type Dropdown Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Transaction Type
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-normal">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="Transfer from external processings" className="hover:bg-slate-100">
                    Transfer from external processings
                  </SelectItem>
                  <SelectItem value="All Transactions" className="hover:bg-slate-100">
                    All Transactions
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* eCurrencies Dropdown Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                eCurrency / Gateway
              </label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-normal">
                  <SelectValue placeholder="All eCurrencies" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="hover:bg-slate-100">All eCurrencies</SelectItem>
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
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
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
                    const userName = d.user?.username || d.username || 'Mpumi';
                    const fullName = d.user?.full_name || d.fullName || d.user?.name || userName;
                    const userIdVal = d.user_id || d.user?.id || 'usr_101';
                    const planTitle = d.plan || d.plan_title || d.plan_name || 'FOUNDATION PLAN';
                    const trxId = d.trx || d.transaction_id || '';
                    const registeredUser = d.registered_username || d.registered_user || (d.username ? `${d.username} (R6X9N4T8)` : '');
                    const netAmt = parseFloat(d.amount || 500.00);

                    const gatewayName = (d.gateway_code || d.payment_method || d.currency || 'USDT').toUpperCase();
                    let assetIcon = '₮';
                    let assetBg = 'bg-teal-600 text-white';
                    if (gatewayName.includes('ETH') || gatewayName.includes('BEP20')) {
                      assetIcon = 'Ξ';
                      assetBg = 'bg-indigo-600 text-white';
                    } else if (gatewayName.includes('BTC')) {
                      assetIcon = '₿';
                      assetBg = 'bg-amber-500 text-slate-950';
                    } else if (gatewayName.includes('LTC')) {
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
                            <span className="font-bold text-slate-700 font-sans">Transaction ID::</span> {trxId}
                          </div>
                          <div className="text-slate-800 font-medium font-sans">
                            <span className="font-bold text-slate-700">Registered Username::</span> {registeredUser}
                          </div>
                        </td>

                        {/* Currency Icon Badge Column */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="flex items-center justify-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${assetBg}`}>
                              {assetIcon}
                            </span>
                          </div>
                        </td>

                        {/* Action Column with Green DETAILS Button */}
                        <td className="py-4 px-4 align-top text-center">
                          <Link
                            href={`/admin/deposit/details/${d.id}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-md inline-block transition-all shadow-sm cursor-pointer"
                          >
                            DETAILS
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
            totalPages={Math.max(1, Math.ceil(filteredDeposits.length / 15))}
            totalResults={filteredDeposits.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
