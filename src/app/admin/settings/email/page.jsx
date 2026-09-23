'use client';

import { useState } from 'react';
import AdminNavbar from '../../../../components/AdminNavbar';
import api from '../../../../lib/api';
import { Mail, Save, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminEmailSettingsPage() {
  const [formData, setFormData] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    from_email: 'noreply@everstake.cx',
    from_name: 'EverStake Protocol',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/settings/email', formData);
      if (res.data.success) {
        toast.success('SMTP & Email configuration saved!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="max-w-3xl mx-auto px-4 py-8 w-full flex-grow space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">SMTP Email Settings</h1>
            <p className="text-xs text-slate-400">Configure outbound email delivery for deposits, withdrawals, and welcome notifications.</p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SMTP Host</label>
                <input
                  type="text"
                  required
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SMTP Port</label>
                <input
                  type="number"
                  required
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
                  placeholder="587"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SMTP Username / Email</label>
                <input
                  type="text"
                  value={formData.smtp_user}
                  onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                  placeholder="your-email@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SMTP Password / App Secret</label>
                <input
                  type="password"
                  value={formData.smtp_pass}
                  onChange={(e) => setFormData({ ...formData, smtp_pass: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sender Email ("From")</label>
                <input
                  type="email"
                  required
                  value={formData.from_email}
                  onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                  placeholder="noreply@stakelab.io"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sender Name</label>
                <input
                  type="text"
                  required
                  value={formData.from_name}
                  onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                  placeholder="Stakelab Protocol"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving Config...' : 'Save Email Configuration'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
