'use client';

import { useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Sparkles, Save, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

const mockSpinLogs = [
  {
    id: '1',
    user: 'Daniel Swags',
    username: '@furqanmehar',
    reward: '$10.00 USDT',
    spinDate: '2026-08-20 02:15 PM',
    status: 'Won',
  },
  {
    id: '2',
    user: 'Chinedu Afamefuna',
    username: '@Sparko',
    reward: '$50.00 USDT',
    spinDate: '2026-08-19 11:30 AM',
    status: 'Won',
  },
  {
    id: '3',
    user: 'Esmaeil Jonas',
    username: '@DaneshsabzIran',
    reward: '$0.00 USDT',
    spinDate: '2026-08-18 09:10 AM',
    status: 'Better Luck Next Time',
  },
];

export default function AdminSpinWheelPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [spinCost, setSpinCost] = useState('1.00');
  const [prizes, setPrizes] = useState([
    { id: 1, label: '$5 USDT', probability: '30%' },
    { id: 2, label: '$10 USDT', probability: '20%' },
    { id: 3, label: '$50 USDT', probability: '5%' },
    { id: 4, label: 'Better Luck', probability: '45%' },
  ]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Spin Wheel settings saved successfully!');
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-[#5b5bf5]" /> Spin Wheel Settings & Logs
          </h1>
          <button
            type="button"
            onClick={() => {
              setIsEnabled(!isEnabled);
              toast.info(`Spin Wheel ${!isEnabled ? 'Enabled' : 'Disabled'}`);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isEnabled ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'
            }`}
          >
            {isEnabled ? 'Status: Active' : 'Status: Disabled'}
          </button>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-3 mb-4">
            Wheel Configuration
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                  Spin Cost per Turn (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={spinCost}
                  onChange={(e) => setSpinCost(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" /> Save Wheel Settings
              </button>
            </div>
          </form>
        </div>

        {/* Spin History Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 font-sans">
              User Spin Logs History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Reward Won</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {mockSpinLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{log.user}</div>
                      <span className="text-[#5b5bf5] font-semibold text-[11px]">{log.username}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600 font-righteous">{log.reward}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{log.spinDate}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border inline-block ${
                          log.status === 'Won'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {log.status}
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
            totalResults={24}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
