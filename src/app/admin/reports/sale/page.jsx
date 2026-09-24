'use client';

import { useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, ShoppingBag, CheckCircle2, RefreshCw } from 'lucide-react';

const mockSaleHistory = [
  {
    id: '1',
    user: 'Daniel Swags',
    username: '@furqanmehar',
    amount: '$800.00',
    rate: '1 USDT = 1.00 USD',
    totalUsd: '$800.00',
    date: '2026-08-12 04:20 PM',
    status: 'Completed',
  },
  {
    id: '2',
    user: 'Esmaeil Jonas',
    username: '@DaneshsabzIran',
    amount: '$300.00',
    rate: '1 USDT = 1.00 USD',
    totalUsd: '$300.00',
    date: '2026-08-01 02:10 PM',
    status: 'Completed',
  },
];

export default function AdminCurrencySaleHistoryPage() {
  const [search, setSearch] = useState('');

  const filteredHistory = mockSaleHistory.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.user.toLowerCase().includes(q) || item.username.toLowerCase().includes(q);
    }
    return true;
  });

  const totalSaleVolume = filteredHistory.reduce((acc, item) => {
    const val = parseFloat(item.totalUsd.replace('$', '')) || 0;
    return acc + val;
  }, 0);

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-wide">
            Currency Sale History
          </h1>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
              className="w-56 sm:w-64 h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800"
            />
            <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3.5 flex items-center justify-center shrink-0 cursor-pointer">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Metric Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales Volume</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1 flex items-center gap-1.5">
                <span>${totalSaleVolume.toFixed(2)}</span>
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[9px]">₮</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5b5bf5] border border-indigo-100 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Sales</div>
              <div className="text-lg font-bold text-emerald-600 font-righteous mt-1">{filteredHistory.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rate</div>
              <div className="text-lg font-bold text-slate-900 font-righteous mt-1">1 USDT = 1.00 USD</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Rate</th>
                  <th className="py-3.5 px-6">Total USD</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{item.user}</div>
                      <div className="text-[#5b5bf5] font-semibold text-[11px]">{item.username}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-red-500 font-righteous">
                      <div className="flex items-center gap-1.5">
                        <span>{item.amount}</span>
                        <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[9px]">₮</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">{item.rate}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-righteous">
                      <div className="flex items-center gap-1.5">
                        <span>{item.totalUsd}</span>
                        <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[9px]">₮</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{item.date}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-3.5 py-1 rounded-full text-[11px] font-bold border inline-block bg-emerald-50 text-emerald-600 border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={1}
            totalPages={1}
            totalResults={filteredHistory.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
