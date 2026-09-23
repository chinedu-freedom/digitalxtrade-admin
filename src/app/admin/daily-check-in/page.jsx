'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import { CalendarCheck, Save, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

export default function AdminDailyCheckInPage() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCheckins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/check-ins');
      if (res.data && res.data.success) {
        setCheckins(res.data.checkins || []);
      }
    } catch (err) {
      console.error('Failed to load check-in settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  const handleChangeAmount = (id, amount) => {
    setCheckins(
      checkins.map((item) => (item.id === id ? { ...item, reward_amount: parseFloat(amount) || 0 } : item))
    );
  };

  const handleChangeDesc = (id, description) => {
    setCheckins(
      checkins.map((item) => (item.id === id ? { ...item, description } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/admin/check-ins/bulk', { checkins });
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Daily check-in streak rewards saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save check-in rewards');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Page Header Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#5b5bf5]" /> Daily Check-In Rewards (7-Day Streak)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Configure daily check-in bonus rewards for consecutive user logins (Days 1 to 7)
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2 text-xs">
            <span>Loading check-in settings</span>
            <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {checkins.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="px-3.5 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5b5bf5] font-extrabold text-xs whitespace-nowrap shrink-0">
                        Day {item.day_number}
                      </div>
                      <span className="font-bold text-slate-800 text-xs whitespace-nowrap">
                        Streak Day {item.day_number}
                      </span>
                    </div>

                    {item.day_number === 7 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 flex items-center gap-1 shrink-0">
                        <Award className="w-3 h-3" /> MEGA BONUS
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Reward Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={item.reward_amount}
                        onChange={(e) => handleChangeAmount(item.id, e.target.value)}
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-extrabold text-emerald-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Description / Badge
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleChangeDesc(item.id, e.target.value)}
                        placeholder="Day description..."
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Check-In Rewards
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
