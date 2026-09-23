'use client';

import { useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { CalendarCheck, Save } from 'lucide-react';
import { toast } from 'sonner';

const mockCheckinLogs = [
  {
    id: '1',
    user: 'Simon Smith',
    username: '@Uarmadale',
    day: 'Day 1',
    reward: '$1.00 USDT',
    checkinTime: '2026-08-21 08:30 AM',
  },
  {
    id: '2',
    user: 'Daniel Swags',
    username: '@furqanmehar',
    day: 'Day 3',
    reward: '$3.00 USDT',
    checkinTime: '2026-08-21 07:15 AM',
  },
  {
    id: '3',
    user: 'Chinedu Afamefuna',
    username: '@Sparko',
    day: 'Day 7',
    reward: '$10.00 USDT',
    checkinTime: '2026-08-20 09:40 PM',
  },
];

export default function AdminDailyCheckinPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [rewards, setRewards] = useState([
    { day: 1, amount: '1.00' },
    { day: 2, amount: '2.00' },
    { day: 3, amount: '3.00' },
    { day: 4, amount: '4.00' },
    { day: 5, amount: '5.00' },
    { day: 6, amount: '6.00' },
    { day: 7, amount: '10.00' },
  ]);

  const handleSaveRewards = (e) => {
    e.preventDefault();
    toast.success('Daily check-in reward structure saved!');
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#5b5bf5]" /> Daily Check-in Bonus
          </h1>
          <button
            type="button"
            onClick={() => {
              setIsEnabled(!isEnabled);
              toast.info(`Daily Check-in ${!isEnabled ? 'Enabled' : 'Disabled'}`);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isEnabled ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'
            }`}
          >
            {isEnabled ? 'Status: Active' : 'Status: Disabled'}
          </button>
        </div>

        {/* Reward Days Configuration Grid */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-3 mb-4">
            7-Day Streak Reward Structure (USDT)
          </h2>
          <form onSubmit={handleSaveRewards} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {rewards.map((r, idx) => (
                <div key={r.day} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                  <div className="text-xs font-bold text-slate-700 font-sans mb-2">Day {r.day}</div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={r.amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRewards(rewards.map((item) => (item.day === r.day ? { ...item, amount: val } : item)));
                      }}
                      className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-center text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" /> Save Streak Rewards
              </button>
            </div>
          </form>
        </div>

        {/* Check-in Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 font-sans">
              Recent Check-in Logs
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Streak Day</th>
                  <th className="py-3.5 px-6">Reward Claimed</th>
                  <th className="py-3.5 px-6">Claim Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {mockCheckinLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{log.user}</div>
                      <span className="text-[#5b5bf5] font-semibold text-[11px]">{log.username}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{log.day}</td>
                    <td className="py-4 px-6 font-bold text-emerald-600 font-righteous">{log.reward}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{log.checkinTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={1}
            totalPages={3}
            totalResults={38}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
