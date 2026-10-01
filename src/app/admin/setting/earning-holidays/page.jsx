'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import PageLoader from '../../../../components/PageLoader';
import ConfirmModal from '../../../../components/ConfirmModal';
import { Calendar, Trash2, Loader2, Plus, Info, Edit2, Clock, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

export default function AdminEarningHolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [dateVal, setDateVal] = useState('');
  const [descriptionVal, setDescriptionVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Delete & Edit Modals state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editDateVal, setEditDateVal] = useState('');
  const [editDescVal, setEditDescVal] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchHolidays = async () => {
    try {
      setFetching(true);
      const res = await api.get('/admin/earning-holidays');
      const list = res.data?.holidays || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(list)) {
        setHolidays(list);
      } else {
        setHolidays([]);
      }
    } catch (err) {
      console.error('Failed to fetch earning holidays from database:', err);
      toast.error('Failed to load earning holidays from server');
      setHolidays([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!dateVal) {
      toast.error('Please select a date for the earning holiday.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        rawDate: dateVal,
        description: descriptionVal.trim() || 'Earning Holiday',
      };

      const res = await api.post('/admin/earning-holidays', payload);
      toast.success(res.data?.message || 'Holiday scheduled successfully in database!');
      setDateVal('');
      setDescriptionVal('');
      await fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule holiday.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (h) => {
    setEditTarget(h);
    if (h.rawDate) {
      const d = new Date(h.rawDate);
      if (!isNaN(d.getTime())) {
        setEditDateVal(d.toISOString().split('T')[0]);
      } else {
        setEditDateVal('');
      }
    } else {
      setEditDateVal('');
    }
    setEditDescVal(h.description || '');
  };

  const handleUpdateHoliday = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      setEditing(true);
      const payload = {
        rawDate: editDateVal || undefined,
        description: editDescVal.trim(),
      };

      const res = await api.put(`/admin/earning-holidays/${editTarget.id}`, payload);
      toast.success(res.data?.message || 'Holiday updated successfully in database!');
      setEditTarget(null);
      await fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update holiday.');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteHoliday = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/earning-holidays/${deleteTarget.id}`);
      toast.success(res.data?.message || 'Holiday deleted successfully from database.');
      setDeleteTarget(null);
      await fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete holiday.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredHolidays = holidays.filter((h) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (h.date && h.date.toLowerCase().includes(q)) ||
      (h.description && h.description.toLowerCase().includes(q))
    );
  });

  if (fetching) {
    return <PageLoader />;
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-wide flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-[#5b5bf5]" /> Earning Holidays
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure dates where daily investment interest and payouts are paused across all active plans
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              ● {holidays.length} Holidays Scheduled in Database
            </span>
          </div>
        </div>

        {/* Add Holiday Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#5b5bf5]" /> Schedule Earning Holiday
            </h2>
            <span className="text-[11px] text-slate-400">
              Stored live in PostgreSQL database
            </span>
          </div>

          <form onSubmit={handleAddHoliday} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Field 1: Date */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Holiday Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                <input
                  type="date"
                  required
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            {/* Field 2: Description */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Holiday Description / Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={descriptionVal}
                onChange={(e) => setDescriptionVal(e.target.value)}
                placeholder="e.g. Christmas Day, Easter Monday, Bank Holiday"
                className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-4 rounded-lg text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Holiday
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Bar & Table Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search holidays by date or description..."
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredHolidays.length}</span> of {holidays.length} holidays
            </div>
          </div>

          {/* Scheduled Holidays Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider whitespace-nowrap">
                  <th className="py-3.5 px-6">Holiday Date</th>
                  <th className="py-3.5 px-6">Description / Memo</th>
                  <th className="py-3.5 px-6 text-center">Payout Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredHolidays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-sans">
                      {search ? 'No holidays matching your search.' : 'No earning holidays configured in database yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredHolidays.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5b5bf5] flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span>{h.date}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {h.description || 'Holiday'}
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> No Earnings Paid
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(h)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 font-bold text-[11px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                            title="Edit Holiday"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> EDIT
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(h)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-bold text-[11px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                            title="Delete Holiday"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guidance / Info Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm space-y-3 font-sans">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <Info className="w-4 h-4 text-[#5b5bf5]" />
            <span>Important Information Regarding Earning Holidays</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2.5 bg-white p-4 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-slate-800">Paused Yields:</strong> All <strong className="text-slate-800">Daily</strong> investment packages will pause profit payouts on scheduled holiday dates.
              </span>
            </div>

            <div className="flex items-start gap-2.5 bg-white p-4 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-slate-800">Ledger Notice:</strong> Users will receive a record entry: <code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[11px]">&quot;no interest: [holiday reason]&quot;</code>.
              </span>
            </div>

            <div className="flex items-start gap-2.5 bg-white p-4 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-slate-800">Duration Impact:</strong> If a plan runs for 5 days and includes 1 holiday, the user receives 4 daily profit payouts.
              </span>
            </div>

            <div className="flex items-start gap-2.5 bg-white p-4 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-slate-800">Past Dates:</strong> Setting a past date will not affect previous earnings that have already been credited.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Holiday Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#5b5bf5]" />
                <h3 className="font-bold text-slate-800 text-base">Edit Earning Holiday</h3>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateHoliday} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Holiday Date
                </label>
                <input
                  type="date"
                  value={editDateVal}
                  onChange={(e) => setEditDateVal(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Current in database: {editTarget.date}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Holiday Description / Reason
                </label>
                <input
                  type="text"
                  required
                  value={editDescVal}
                  onChange={(e) => setEditDescVal(e.target.value)}
                  placeholder="e.g. Christmas Day"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteHoliday}
        title="Delete Earning Holiday"
        description={`Are you sure you want to delete the holiday "${deleteTarget?.description || deleteTarget?.date}"? Daily investment packages will resume paying earnings on this day.`}
        confirmText="Yes, Delete Holiday"
        cancelText="Cancel"
        isDanger={true}
        loading={deleting}
      />
    </AdminSidebarLayout>
  );
}
