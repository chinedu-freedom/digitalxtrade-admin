'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import { ToggleLeft, ToggleRight, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

export default function AdminManageReferralPage() {
  const [enabled, setEnabled] = useState(true);
  const [levels, setLevels] = useState([
    { level: 1, percent: '10.00' },
    { level: 2, percent: '5.00' },
    { level: 3, percent: '3.00' },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchReferralSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/referral-settings');
      if (res.data && res.data.success && res.data.referralSettings) {
        const s = res.data.referralSettings;
        const isEnabled = s.enabled !== undefined ? s.enabled : s.depositEnabled;
        setEnabled(Boolean(isEnabled));

        const targetLevels = s.levels || s.depositLevels;
        if (Array.isArray(targetLevels) && targetLevels.length >= 3) {
          setLevels(
            targetLevels.slice(0, 3).map((d) => ({
              level: d.level,
              percent: String(d.percent),
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch referral settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/referral-settings', {
        enabled,
        levels: levels.map((d) => ({ level: d.level, percent: parseFloat(d.percent || 0) })),
      });
      if (res.data && res.data.success) {
        toast.success('Referral commission updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to update referral settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextState = !enabled;
    setEnabled(nextState);
    try {
      await api.post('/admin/referral-settings', {
        enabled: nextState,
        levels: levels.map((d) => ({ level: d.level, percent: parseFloat(d.percent || 0) })),
      });
      toast.success(`Referral commission ${nextState ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
          Manage Referral (3-Tier Commission)
        </h1>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2 text-xs shadow-sm">
            <span>Loading referral commission settings</span>
            <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
          </div>
        ) : (
          /* Single Master Referral Commission Card */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header Banner */}
            <div className="bg-[#5b5bf5] text-white p-4 px-6 flex justify-between items-center">
              <h2 className="text-sm font-bold font-sans tracking-wide">
                Referral Commission
              </h2>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  enabled
                    ? 'bg-[#22c55e] hover:bg-emerald-600 text-white'
                    : 'bg-[#dc2626] hover:bg-red-700 text-white'
                }`}
              >
                {enabled ? (
                  <>
                    <ToggleRight className="w-4 h-4" /> Enable Now
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4" /> Disable Now
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
              <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-lg text-[11px] text-indigo-900 leading-relaxed font-sans font-medium">
                💡 Referral commission is granted directly to the inviter (up to 3 levels) when their referred user deposits and invests in a plan, calculated on the invested amount.
              </div>

              {/* 3 Fixed Level Inputs */}
              <div className="space-y-4">
                {levels.map((row) => (
                  <div
                    key={row.level}
                    className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500"
                  >
                    <div className="h-11 bg-slate-100 border-r border-slate-200 px-4 text-xs font-bold text-slate-700 flex items-center shrink-0 min-w-[100px]">
                      Level {row.level}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={row.percent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLevels(
                          levels.map((d) => (d.level === row.level ? { ...d, percent: val } : d))
                        );
                      }}
                      placeholder="Commission Percentage (%)"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-xs font-bold text-slate-900 font-mono"
                    />
                    <div className="h-11 bg-slate-50 border-l border-slate-200 px-4 text-xs font-bold text-slate-500 flex items-center shrink-0">
                      %
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Referral Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
