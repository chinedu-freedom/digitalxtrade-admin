'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

export default function AdminUserNoticesPage() {
  const [notices, setNotices] = useState([
    {
      id: '1',
      title: 'Scheduled System Upgrade Notice',
      startDate: '2026-09-24 15:04:06',
      expiresInDays: 0,
      targetUsers: 'All Users',
      content: 'Dear valued investors, our node servers will undergo routine optimization today.',
    },
  ]);

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().replace('T', ' ').substring(0, 19)
  );
  const [expiresIn, setExpiresIn] = useState('0');
  const [targetUsersText, setTargetUsersText] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/admin/user-notices')
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.notices)) {
          setNotices(res.data.notices);
        }
      })
      .catch(() => null);
  }, []);

  const handleAddNotice = async (e) => {
    e.preventDefault();

    if (!title.trim() || !noticeContent.trim()) {
      toast.error('Notice title and notice content are required.');
      return;
    }

    try {
      setLoading(true);

      const newNotice = {
        id: Date.now().toString(),
        title: title.trim(),
        startDate: startDate || new Date().toISOString().replace('T', ' ').substring(0, 19),
        expiresInDays: parseInt(expiresIn || '0', 10),
        targetUsers: targetUsersText.trim() ? targetUsersText.trim() : 'All Users',
        content: noticeContent.trim(),
      };

      await api.post('/admin/user-notices', newNotice).catch(() => null);

      setNotices([newNotice, ...notices]);
      setAlertMsg('Notice has been added and dispatched to target user(s).');
      toast.success('Notice added successfully!');
      setTitle('');
      setTargetUsersText('');
      setNoticeContent('');
      setExpiresIn('0');
    } catch (err) {
      toast.error('Failed to create notice.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    try {
      await api.delete(`/admin/user-notices/${id}`).catch(() => null);
      setNotices(notices.filter((n) => n.id !== id));
      toast.success('Notice deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete notice.');
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Title Header */}
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#5b5bf5]" /> User Notices:
          </h1>
        </div>

        {/* Success Alert */}
        {alertMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-lg shadow-sm flex items-center justify-between animate-in fade-in duration-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {alertMsg}
            </span>
            <button
              onClick={() => setAlertMsg('')}
              className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Yellow Guidance Info Box (Exact layout & text from Screenshot 2) */}
        <div className="bg-yellow-50/70 border border-yellow-300 rounded-xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            Here you can send notices to your users.
          </p>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            You can specify list of usernames and system will create notices for each user in the list.
          </p>
        </div>

        {/* Add a Notice Form Container */}
        <div className="bg-amber-50/40 rounded-xl border border-amber-200 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 font-sans tracking-wide">
            Add a Notice:
          </h2>

          <form onSubmit={handleAddNotice} className="divide-y divide-amber-200/60 bg-white border border-amber-200 rounded-lg overflow-hidden shadow-xs">
            {/* Field 1: Notice Title */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-amber-100/30">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider md:text-right">
                Notice Title:
              </label>
              <div className="md:col-span-3">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notice title..."
                  className="w-full h-10 bg-white border border-amber-300 rounded px-3 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
              </div>
            </div>

            {/* Field 2: Start Date */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider md:text-right">
                Start Date:
              </label>
              <div className="md:col-span-3">
                <input
                  type="text"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 bg-white border border-amber-300 rounded px-3 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
              </div>
            </div>

            {/* Field 3: Expires in */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-amber-100/30">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider md:text-right">
                Expires in:
              </label>
              <div className="md:col-span-3 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  required
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-24 h-10 bg-white border border-amber-300 rounded px-3 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
                <span className="text-xs font-bold text-slate-700 font-sans">
                  days <span className="font-normal text-slate-500 text-[11px]">(set 0 to skip limitation)</span>
                </span>
              </div>
            </div>

            {/* Field 4: Users */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
              <div className="md:text-right pt-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Users:
                </label>
              </div>
              <div className="md:col-span-3 space-y-1">
                <input
                  type="text"
                  value={targetUsersText}
                  onChange={(e) => setTargetUsersText(e.target.value)}
                  placeholder="Leave blank for all users or enter usernames..."
                  className="w-full h-10 bg-white border border-amber-300 rounded px-3 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
                <div className="text-[11px] text-slate-500 font-medium italic">
                  Leave blank to show message to all users or enter usernames divided by comma
                </div>
              </div>
            </div>

            {/* Field 5: Notice */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-start bg-amber-100/30">
              <div className="md:text-right pt-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Notice:
                </label>
              </div>
              <div className="md:col-span-3">
                <textarea
                  rows={4}
                  required
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Enter notice message content..."
                  className="w-full bg-white border border-amber-300 rounded p-3 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
              </div>
            </div>

            {/* Add Button */}
            <div className="p-4 bg-amber-50/80 flex items-center justify-start">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#ffe8a3] hover:bg-amber-300 border border-amber-400 text-slate-900 font-extrabold text-xs px-8 py-2 rounded transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Notices Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
          <h3 className="text-sm font-bold text-slate-800 font-sans uppercase tracking-wider">
            Active System Notices ({notices.length})
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Expires In</th>
                  <th className="py-3 px-4">Target Users</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {notices.length > 0 ? (
                  notices.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">{n.title}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{n.startDate}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {n.expiresInDays === 0 ? 'Never (No limit)' : `${n.expiresInDays} days`}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{n.targetUsers}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(n.id)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No active user notices.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
