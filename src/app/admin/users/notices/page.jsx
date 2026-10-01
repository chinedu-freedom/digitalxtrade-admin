'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import PageLoader from '../../../../components/PageLoader';
import ConfirmModal from '../../../../components/ConfirmModal';
import {
  Bell,
  Trash2,
  Plus,
  Info,
  Calendar,
  Clock,
  Search,
  Users,
  Send,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

export default function AdminUserNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiresIn, setExpiresIn] = useState('0');
  const [targetUsersText, setTargetUsersText] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/admin/user-notices');
      const list = res.data?.notices || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(list)) {
        setNotices(list);
      } else {
        setNotices([]);
      }
    } catch (err) {
      console.error('Failed to fetch user notices:', err);
      toast.error('Failed to load user notices from server');
      setNotices([]);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    // Default startDate to current local formatted string
    const now = new Date();
    const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
    setStartDate(formatted);

    fetchNotices();
  }, []);

  const handleAddNotice = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Notice title is required.');
      return;
    }
    if (!noticeContent.trim()) {
      toast.error('Notice content message is required.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        startDate: startDate || new Date().toISOString().replace('T', ' ').substring(0, 19),
        expiresInDays: parseInt(expiresIn || '0', 10),
        targetUsers: targetUsersText.trim() ? targetUsersText.trim() : 'All Users',
        content: noticeContent.trim(),
      };

      const res = await api.post('/admin/user-notices', payload);
      toast.success(res.data?.message || 'Notice created and broadcasted successfully!');

      setTitle('');
      setTargetUsersText('');
      setNoticeContent('');
      setExpiresIn('0');
      setStartDate(new Date().toISOString().replace('T', ' ').substring(0, 19));

      await fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create notice.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await api.delete(`/admin/user-notices/${deleteTarget.id}`).catch(() =>
        api.post(`/admin/user-notices/${deleteTarget.id}/delete`)
      );
      toast.success('Notice deleted successfully.');
      setDeleteTarget(null);
      await fetchNotices();
    } catch (err) {
      toast.error('Failed to delete notice.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const titleMatch = (n.title || '').toLowerCase().includes(q);
    const contentMatch = (n.content || '').toLowerCase().includes(q);
    const userMatch = (n.targetUsers || '').toLowerCase().includes(q);
    return titleMatch || contentMatch || userMatch;
  });

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-6xl mx-auto font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5b5bf5] border border-indigo-100 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </span>
              User Notices
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Broadcast announcements, maintenance advisories, and system notices to platform members.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Total Notices: <strong className="text-slate-900">{notices.length}</strong>
          </div>
        </div>

        {/* Guidance Info Card */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-[#5b5bf5] shrink-0 shadow-xs mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1">
            <p className="font-bold text-slate-900 text-sm">Notice Dispatching Rules</p>
            <p>
              Here you can broadcast notices to your users. Specify a comma-separated list of usernames (e.g.{' '}
              <code className="text-[#5b5bf5] font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-indigo-100">
                alex, sparko, michael
              </code>
              ) to deliver the notice to specific users, or leave blank to automatically broadcast to{' '}
              <strong className="text-slate-800 font-semibold">All Users</strong>.
            </p>
          </div>
        </div>

        {/* Create Notice Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#5b5bf5] flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                Create & Broadcast Notice
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-400">All dispatched notices appear on user dashboards</span>
          </div>

          <form onSubmit={handleAddNotice} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Field 1: Notice Title */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Notice Title <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scheduled Node Server Upgrade Advisory"
                    className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Start Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Start Date & Time
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM:SS"
                    className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs transition-all"
                  />
                </div>
              </div>

              {/* Field 3: Expires in (Days) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Expires In (Days)
                </label>
                <div className="relative flex items-center">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    required
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Enter <span className="font-semibold text-slate-600">0</span> for permanent (no expiration limit)
                </p>
              </div>

              {/* Field 4: Target Users */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Users (Optional)
                </label>
                <div className="relative flex items-center">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={targetUsersText}
                    onChange={(e) => setTargetUsersText(e.target.value)}
                    placeholder="Leave blank for All Users, or specify usernames separated by commas..."
                    className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Leave empty to broadcast to <strong className="text-slate-600">All Users</strong>, or list specific accounts like <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">sparko, john_doe, user123</code>.
                </p>
              </div>

              {/* Field 5: Notice Content */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Notice Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Write notice message content here..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3.5 text-xs text-slate-800 placeholder-slate-400 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-extrabold text-xs px-8 h-11 rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Broadcast Notice
              </button>
            </div>
          </form>
        </div>

        {/* Existing Notices Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header Bar with Search */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                Active System Notices
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#5b5bf5] border border-indigo-100">
                {notices.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs w-full sm:w-64 focus-within:ring-1 focus-within:ring-indigo-500">
              <span className="pl-3 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notices or users..."
                className="w-full h-9 bg-transparent border-0 outline-none px-2.5 text-xs text-slate-800 placeholder-slate-400 font-sans"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6 w-5/12">Notice & Content</th>
                  <th className="py-3.5 px-4 w-2/12">Target Users</th>
                  <th className="py-3.5 px-4 w-2/12">Schedule</th>
                  <th className="py-3.5 px-4 w-2/12">Expires</th>
                  <th className="py-3.5 px-4 w-1/12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredNotices.length > 0 ? (
                  filteredNotices.map((n) => {
                    const isAll = !n.targetUsers || n.targetUsers.toLowerCase() === 'all users';
                    const targetList = !isAll ? n.targetUsers.split(',').map((u) => u.trim()) : [];
                    const isNever = !n.expiresInDays || n.expiresInDays === 0;

                    return (
                      <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Notice & Content */}
                        <td className="py-4 px-6 align-top space-y-1">
                          <div className="font-extrabold text-slate-900 text-xs tracking-tight flex items-center gap-2">
                            <span>{n.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Active
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {n.content}
                          </p>
                        </td>

                        {/* Target Users */}
                        <td className="py-4 px-4 align-top">
                          {isAll ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-[#5b5bf5] border border-indigo-100">
                              <Users className="w-3 h-3" /> All Users
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {targetList.map((usr, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  @{usr}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Schedule (Start Date) */}
                        <td className="py-4 px-4 align-top font-mono text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{n.startDate || 'N/A'}</span>
                          </div>
                        </td>

                        {/* Expires */}
                        <td className="py-4 px-4 align-top">
                          {isNever ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> Never (No limit)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" /> {n.expiresInDays} days
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-center align-middle">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(n)}
                              className="w-8 h-8 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                              title="Delete Notice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-7 h-7 text-slate-300" />
                        <span className="text-xs">No user notices found. Create one above to broadcast.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteNotice}
        title="Delete User Notice"
        description={`Are you sure you want to delete the notice "${deleteTarget?.title}"? It will immediately stop appearing on users' dashboards.`}
        confirmText={deleting ? 'Deleting...' : 'Yes, Delete Notice'}
        cancelText="Cancel"
        isDanger={true}
      />
    </AdminSidebarLayout>
  );
}
