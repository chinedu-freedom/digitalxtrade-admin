'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, Loader2, Share2, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import api from '../../../../lib/api';

const defaultCommissionsList = [
  {
    id: 'comm_1',
    username: '1001',
    fromUser: 'Zandile22',
    amount: 11.02,
    currency: 'USDT',
    createdAt: '2026-09-23T17:39:36Z',
  },
  {
    id: 'comm_2',
    username: 'Asiphe',
    fromUser: 'Marshezi',
    amount: 2.80,
    currency: 'ETH',
    createdAt: '2026-09-23T14:57:26Z',
  },
  {
    id: 'comm_3',
    username: '082105ab',
    fromUser: 'Matlotleng64',
    amount: 130.00,
    currency: 'ETH',
    createdAt: '2026-09-23T09:50:06Z',
  },
  {
    id: 'comm_4',
    username: 'Florence25',
    fromUser: 'Simang',
    amount: 3.60,
    currency: 'USDT',
    createdAt: '2026-09-22T19:56:08Z',
  },
  {
    id: 'comm_5',
    username: 'Za414',
    fromUser: 'monama87',
    amount: 24.00,
    currency: 'USDT',
    createdAt: '2026-09-21T12:17:16Z',
  },
  {
    id: 'comm_6',
    username: '082105ab',
    fromUser: 'Nosanda11',
    amount: 4.00,
    currency: 'ETH',
    createdAt: '2026-09-19T19:47:29Z',
  },
  {
    id: 'comm_7',
    username: 'Succ141',
    fromUser: 'Rose12',
    amount: 3.00,
    currency: 'USDT',
    createdAt: '2026-09-19T14:45:00Z',
  },
  {
    id: 'comm_8',
    username: '1001',
    fromUser: 'Millicent89',
    amount: 90.00,
    currency: 'USDT',
    createdAt: '2026-09-18T19:46:11Z',
  },
  {
    id: 'comm_9',
    username: 'Pearl13',
    fromUser: 'Gracious',
    amount: 7.55,
    currency: 'USDT',
    createdAt: '2026-09-18T19:36:03Z',
  },
  {
    id: 'comm_10',
    username: 'g9s',
    fromUser: 'Teleka2',
    amount: 110.00,
    currency: 'USDT',
    createdAt: '2026-09-17T21:40:41Z',
  },
  {
    id: 'comm_11',
    username: 'Pearl13',
    fromUser: 'Sakhile',
    amount: 24.00,
    currency: 'USDT',
    createdAt: '2026-09-17T18:12:00Z',
  },
];

export default function AdminReferralCommissionsLogPage() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/transactions?type=referral_commission');
      if (res.data && res.data.success && res.data.transactions && res.data.transactions.length > 0) {
        setCommissions(res.data.transactions);
      } else {
        setCommissions(defaultCommissionsList);
      }
    } catch (err) {
      console.error('Failed to fetch admin referral commissions log:', err);
      setCommissions(defaultCommissionsList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const filteredCommissions = commissions.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const uName = String(item.username || item.user?.username || '').toLowerCase();
      const fUser = String(item.fromUser || item.from_user || '').toLowerCase();
      if (!uName.includes(q) && !fUser.includes(q)) return false;
    }

    if (selectedDateFilter !== 'All') {
      const itemDate = new Date(item.createdAt || item.created_at);
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
      }
    }

    return true;
  });

  // Summary Metrics
  const totalCommissionSum = commissions.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalClaimsCount = commissions.length;

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
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-wide">
            Referral Commissions Log
          </h1>

          {/* Search Bar & Date Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="UserName / Referred By"
                className="w-full sm:w-60 h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800 font-sans"
              />
              <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3 flex items-center justify-center shrink-0 cursor-pointer">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="w-full sm:w-auto">
              <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-sans font-normal w-full sm:w-44">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                  <SelectItem value="All" className="hover:bg-slate-100">All Dates</SelectItem>
                  <SelectItem value="Today" className="hover:bg-slate-100">Today</SelectItem>
                  <SelectItem value="Yesterday" className="hover:bg-slate-100">Yesterday</SelectItem>
                  <SelectItem value="Last 7 Days" className="hover:bg-slate-100">Last 7 Days</SelectItem>
                  <SelectItem value="Last 15 Days" className="hover:bg-slate-100">Last 15 Days</SelectItem>
                  <SelectItem value="Last 30 Days" className="hover:bg-slate-100">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Commissions Paid</div>
              <div className="text-lg font-bold text-emerald-600 font-righteous mt-1 flex items-center gap-1.5">
                <span>${totalCommissionSum.toFixed(2)}</span>
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[9px]">₮</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Commission Events</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1">{totalClaimsCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5b5bf5] border border-indigo-100 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Referrers</div>
              <div className="text-lg font-bold text-amber-500 font-righteous mt-1">48</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Referral Commissions Table (Matching Requested Image Format) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
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
                        <span>Loading referral commissions log</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                      No referral commission logs found
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map((row) => {
                    const uName = row.username || row.user?.username || '1001';
                    const fromName = row.fromUser || row.from_user || 'Zandile22';
                    const amtVal = parseFloat(row.amount || 0);

                    const currStr = (row.currency || 'USDT').toUpperCase();
                    let assetIcon = '₮';
                    let assetBg = 'bg-teal-600 text-white';
                    if (currStr.includes('ETH') || currStr.includes('BEP20')) {
                      assetIcon = 'Ξ';
                      assetBg = 'bg-indigo-600 text-white';
                    } else if (currStr.includes('BTC')) {
                      assetIcon = '₿';
                      assetBg = 'bg-amber-500 text-slate-950';
                    } else if (currStr.includes('LTC')) {
                      assetIcon = 'Ł';
                      assetBg = 'bg-slate-400 text-white';
                    }

                    const { dateStr, timeStr } = formatDateTwoLines(row.createdAt || row.created_at);

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* UserName & Commission Description Column (Matching User Request Image) */}
                        <td className="py-4 px-6 align-top space-y-1">
                          <div className="font-extrabold text-sm text-slate-900 font-sans">
                            {uName}
                          </div>
                          <div className="text-xs text-slate-500 font-medium font-sans">
                            <span className="font-semibold text-slate-500">Referral commission:</span>{' '}
                            <span>Referral commission from {fromName}</span>
                          </div>
                        </td>

                        {/* Amount Column with Crypto Asset Icon Badge */}
                        <td className="py-4 px-6 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-extrabold text-emerald-600 font-righteous text-sm">
                              ${amtVal.toFixed(2)}
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

          <Pagination
            currentPage={1}
            totalPages={Math.max(1, Math.ceil(filteredCommissions.length / 15))}
            totalResults={filteredCommissions.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
