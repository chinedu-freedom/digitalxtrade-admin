'use client';

import { useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { CheckSquare, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const mockTasksList = [
  {
    id: '1',
    title: 'Join Telegram Official Channel',
    reward: '$5.00 USDT',
    link: 'https://t.me/stakelab_official',
    completions: '412 users',
    status: 'Active',
  },
  {
    id: '2',
    title: 'Follow Twitter / X Page',
    reward: '$3.00 USDT',
    link: 'https://x.com/stakelab_app',
    completions: '280 users',
    status: 'Active',
  },
  {
    id: '3',
    title: 'Deposit First $50',
    reward: '$10.00 USDT',
    link: 'https://stakelab.app/deposit',
    completions: '195 users',
    status: 'Active',
  },
];

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState(mockTasksList);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [taskLink, setTaskLink] = useState('');

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle || !taskReward) {
      toast.error('Please complete task title and reward.');
      return;
    }
    const newTask = {
      id: String(Date.now()),
      title: taskTitle,
      reward: `$${parseFloat(taskReward).toFixed(2)} USDT`,
      link: taskLink || '#',
      completions: '0 users',
      status: 'Active',
    };
    setTasks([newTask, ...tasks]);
    toast.success('Task created successfully!');
    setModalOpen(false);
    setTaskTitle('');
    setTaskReward('');
    setTaskLink('');
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast.success('Task removed!');
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#5b5bf5]" /> Reward Tasks Management
          </h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Task
          </button>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Task Title</th>
                  <th className="py-3.5 px-6">Reward (USDT)</th>
                  <th className="py-3.5 px-6">Action Link</th>
                  <th className="py-3.5 px-6">Completed By</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{t.title}</td>
                    <td className="py-4 px-6 font-bold text-emerald-600 font-righteous">{t.reward}</td>
                    <td className="py-4 px-6 font-mono text-[#5b5bf5] truncate max-w-[200px]">
                      <a href={t.link} target="_blank" rel="noreferrer" className="hover:underline">
                        {t.link}
                      </a>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">{t.completions}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold inline-block">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(t.id)}
                        className="border border-red-500 text-red-600 hover:bg-red-50 p-1.5 rounded transition-all cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={1}
            totalPages={1}
            totalResults={tasks.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>

        {/* Create Task Modal (Full Height & Click Outside to Close) */}
        {modalOpen && (
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 min-h-screen w-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 font-sans">
                  Create Reward Task
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Join Telegram Group"
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1">
                    Reward Amount (USDT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={taskReward}
                    onChange={(e) => setTaskReward(e.target.value)}
                    placeholder="5.00"
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1">
                    Task Link (URL)
                  </label>
                  <input
                    type="url"
                    value={taskLink}
                    onChange={(e) => setTaskLink(e.target.value)}
                    placeholder="https://t.me/yourgroup"
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
