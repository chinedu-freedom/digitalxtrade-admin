'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Calendar, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

export default function AdminEarningHolidaysPage() {
  const [holidays, setHolidays] = useState([
    { id: '1', date: 'Sep-2-2026', rawDate: '2026-09-02', description: 'jj' },
  ]);

  const [dateVal, setDateVal] = useState('');
  const [descriptionVal, setDescriptionVal] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/admin/earning-holidays')
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.holidays)) {
          setHolidays(res.data.holidays);
        }
      })
      .catch(() => null);
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!dateVal) {
      toast.error('Please select a date for the earning holiday.');
      return;
    }

    try {
      setLoading(true);

      const formattedDate = new Date(dateVal).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const newHoliday = {
        id: Date.now().toString(),
        date: formattedDate,
        rawDate: dateVal,
        description: descriptionVal.trim() || 'Holiday',
      };

      await api.post('/admin/earning-holidays', newHoliday).catch(() => null);

      setHolidays([newHoliday, ...holidays]);
      setAlertMsg('Holiday has been added.');
      toast.success('Holiday added successfully!');
      setDateVal('');
      setDescriptionVal('');
    } catch (err) {
      toast.error('Failed to add holiday.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await api.delete(`/admin/earning-holidays/${id}`).catch(() => null);
      setHolidays(holidays.filter((h) => h.id !== id));
      setAlertMsg('Holiday deleted successfully.');
      toast.success('Holiday deleted.');
    } catch (err) {
      toast.error('Failed to delete holiday.');
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Title Header */}
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#5b5bf5]" /> Earning Holidays
          </h1>
        </div>

        {/* Green Notification Banner */}
        {alertMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-lg shadow-sm flex items-center justify-between animate-in fade-in duration-300">
            <span>{alertMsg}</span>
            <button
              onClick={() => setAlertMsg('')}
              className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Holidays Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-amber-100/80 text-slate-800 font-bold border-b border-amber-200 uppercase tracking-wider">
                  <th className="py-3 px-6 w-1/4 text-center border-r border-amber-200">Date</th>
                  <th className="py-3 px-6 w-2/4 text-center border-r border-amber-200">Description</th>
                  <th className="py-3 px-6 w-1/4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-amber-50/20 font-medium">
                {holidays.length > 0 ? (
                  holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-amber-100/30 transition-colors">
                      <td className="py-3.5 px-6 text-center font-bold text-slate-800 border-r border-slate-100">
                        {h.date}
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-700 font-mono border-r border-slate-100">
                        {h.description || 'N/A'}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteHoliday(h.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] px-4 py-1.5 rounded uppercase tracking-wider transition-all shadow-sm cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> DELETE
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 font-sans">
                      No earning holidays configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Holiday Form Container */}
        <div className="bg-amber-50/40 rounded-xl border border-amber-200 p-6 shadow-sm">
          <form onSubmit={handleAddHoliday} className="space-y-4 max-w-xl mx-auto">
            {/* Field 1: Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider sm:text-right">
                Date:
              </label>
              <div className="sm:col-span-2">
                <input
                  type="date"
                  required
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  className="w-full h-10 bg-white border border-amber-300 rounded px-3 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
              </div>
            </div>

            {/* Field 2: Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider sm:text-right">
                Description:
              </label>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={descriptionVal}
                  onChange={(e) => setDescriptionVal(e.target.value)}
                  placeholder="Enter holiday description..."
                  className="w-full h-10 bg-white border border-amber-300 rounded px-3 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
              </div>
            </div>

            {/* Add Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1">
              <div className="hidden sm:block"></div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#ffe8a3] hover:bg-amber-300 border border-amber-400 text-slate-900 font-extrabold text-xs px-6 py-2 rounded transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Yellow Warning / Guidance Info Box (Exact layout & text from Screenshot 1) */}
        <div className="bg-yellow-50/70 border border-yellow-300 rounded-xl p-5 shadow-sm space-y-2">
          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            Here you can set any future day as holiday. All <strong className="font-extrabold text-slate-900">Daily</strong> plans will not pay earnings on holidays.
          </p>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            Users will receive no earning with description: <span className="font-mono bg-yellow-100 text-amber-900 px-1.5 py-0.5 rounded border border-yellow-200">&quot;no interest: holiday description&quot;</span>.
          </p>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            <strong className="font-extrabold text-slate-900">Attention:</strong> if you use plan with duration 5 days, and one of this day will be holiday, user will receive 4 earnings only.
          </p>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            If you&apos;ll set date has passed as holiday, it will not be any affect on past earnings.
          </p>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
