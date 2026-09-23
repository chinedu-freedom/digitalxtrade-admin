'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Sliders, Gift, ClipboardList, CalendarCheck, Disc, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminSystemFeaturesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState({
    giftBonus: true,
    tasks: true,
    dailyCheckin: true,
    spinWheel: true,
  });

  useEffect(() => {
    api
      .get('/public/system-features')
      .then((res) => {
        if (res.data && res.data.success && res.data.features) {
          setFeatures(res.data.features);
        }
      })
      .catch(() => toast.error('Failed to load system features.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/settings/system-features', features);
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'System features updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save feature toggles.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-4xl font-sans pb-12">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-righteous tracking-wide flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#5b5bf5]" /> System Features & Gamification Modules
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enable or disable gamification features across the user dashboard in real-time.
            </p>
          </div>
        </div>

        {/* Feature Toggles Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
              <span>Loading feature settings</span>
              <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feature 1: Gift Bonus */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Gift Bonus & Lucky Treasure</h3>
                    <p className="text-xs text-slate-500">Allow users to redeem gift codes for instant cash rewards</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('giftBonus')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    features.giftBonus ? 'bg-[#5b5bf5]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      features.giftBonus ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Feature 2: Tasks */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Invitation Tasks Module</h3>
                    <p className="text-xs text-slate-500">Enable task milestone campaigns for user referral invites</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('tasks')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    features.tasks ? 'bg-[#5b5bf5]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      features.tasks ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Feature 3: Daily Check-In */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">7-Day Daily Check-In Streak</h3>
                    <p className="text-xs text-slate-500">Displays the daily check-in popup modal for 7 consecutive days rewards</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('dailyCheckin')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    features.dailyCheckin ? 'bg-[#5b5bf5]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      features.dailyCheckin ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Feature 4: Spin Wheel */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Disc className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Lucky Spin Wheel Module</h3>
                    <p className="text-xs text-slate-500">Enable lucky spin wheel for free & paid spins</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('spinWheel')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    features.spinWheel ? 'bg-[#5b5bf5]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      features.spinWheel ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Submit Save Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Feature Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
