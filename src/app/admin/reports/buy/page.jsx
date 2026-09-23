'use client';

import { useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search } from 'lucide-react';

const mockBuyHistory = [
  {
    id: '1',
    user: 'Simon Smith',
    username: '@Uarmadale',
    amount: '$1,000.00 USDT',
    rate: '1 USDT = 1.00 USD',
    totalUsd: '$1,000.00 USD',
    date: '2026-08-10 11:30 AM',
    status: 'Completed',
  },
  {
    id: '2',
    user: 'Chinedu Afamefuna',
    username: '@Sparko',
    amount: '$500.00 USDT',
    rate: '1 USDT = 1.00 USD',
    totalUsd: '$500.00 USD',
    date: '2026-08-05 09:15 AM',
    status: 'Completed',
  },
];

export default function AdminCurrencyBuyHistoryPage() {
  const [search, setSearch] = useState('');

  const filteredHistory = mockBuyHistory.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.user.toLowerCase().includes(q) || item.username.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            Currency Buy History
          </h1>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-56 sm:w-64 h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800 font-sans"
            />
            <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3.5 flex items-center justify-center shrink-0 cursor-pointer">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Amount (USDT)</th>
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
                    <td className="py-4 px-6 font-bold text-emerald-600 font-righteous">{item.amount}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">{item.rate}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-righteous">{item.totalUsd}</td>
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
            totalPages={2}
            totalResults={18}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
