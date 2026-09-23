'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { ClipboardList, Plus, Search, Trash2, Edit2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

import ConfirmModal from '../../../components/ConfirmModal';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    invites_required: '15',
    reward_amount: '',
    target_url: '',
    task_type: 'INVITATION',
    status: 'ACTIVE',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/tasks');
      if (res.data && res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      invites_required: '15',
      reward_amount: '',
      target_url: '',
      task_type: 'INVITATION',
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      invites_required: task.invites_required || '15',
      reward_amount: task.reward_amount,
      target_url: task.target_url || '',
      task_type: task.task_type || 'INVITATION',
      status: task.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.reward_amount) {
      toast.error('Title and Reward Amount are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTask) {
        const res = await api.put(`/admin/tasks/${editingTask.id}`, form);
        if (res.data && res.data.success) {
          toast.success('Task updated successfully!');
        }
      } else {
        const res = await api.post('/admin/tasks', form);
        if (res.data && res.data.success) {
          toast.success('Task created successfully!');
        }
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTaskId) return;
    try {
      const res = await api.delete(`/admin/tasks/${deleteTaskId}`);
      if (res.data && res.data.success) {
        toast.success('Task deleted successfully!');
        fetchTasks();
      }
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setDeleteTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-[#5b5bf5]" /> Daily Tasks & Rewards
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Create task campaigns for users to complete and earn cash rewards
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-lg bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New Task
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="text-xs text-slate-500 font-semibold font-sans">
            Total Tasks: <span className="text-slate-800 font-bold">{tasks.length}</span>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2 text-xs">
              <span>Loading tasks</span>
              <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              No tasks created yet. Click "Create New Task" to add one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Invites Required</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredTasks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 text-slate-700">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600">
                        {item.invites_required || 0}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                        ${parseFloat(item.reward_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTaskId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 cursor-default"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#5b5bf5]" />
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Follow Official Telegram Channel"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Task Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide details on what the user needs to do..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reward Amount ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.reward_amount}
                      onChange={(e) => setForm({ ...form, reward_amount: e.target.value })}
                      placeholder="e.g. 5.00"
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Invites Required *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.invites_required}
                      onChange={(e) => setForm({ ...form, invites_required: e.target.value })}
                      placeholder="e.g. 15"
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteTaskId}
          onClose={() => setDeleteTaskId(null)}
          onConfirm={handleDelete}
          title="Delete Task"
          description="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          isDanger={true}
        />
      </div>
    </AdminSidebarLayout>
  );
}
