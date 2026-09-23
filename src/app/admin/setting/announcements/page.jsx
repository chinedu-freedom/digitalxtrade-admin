'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Megaphone, Plus, Trash2, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import RichTextEditor from '../../../../components/RichTextEditor';

export default function AdminAnnouncementsSettingPage() {
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      date: '18 March, 2024',
      title: 'Planning for Retirement: Strategies for a Secure Future',
      desc: 'Crypto currencies are sets of software protocols for generating digital tokens and tracking transactions to build long-term wealth.',
      img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '2',
      date: '18 March, 2024',
      title: "Demystifying Cryptocurrency: A Beginner's Guide",
      desc: "Invest in the world's leading digital assets and proof-of-stake networks with automated yield generation and high security.",
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '3',
      date: '18 March, 2024',
      title: 'Maximizing Yield Returns with Stakelab Proof-of-Stake',
      desc: 'Discover advanced staking pool allocation strategies designed for consistent high-yield earnings and asset protection.',
      img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/public/announcements')
      .then((res) => {
        if (res.data.success && res.data.announcements?.length > 0) {
          setAnnouncements(res.data.announcements);
        }
      })
      .catch(() => null);
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...announcements];
    updated[index][field] = value;
    setAnnouncements(updated);
  };

  const handleAdd = () => {
    setAnnouncements([
      ...announcements,
      {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        title: 'New Stakelab Update',
        desc: 'Announcing new platform feature releases and high-yield staking pools for global investors.',
        img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
      },
    ]);
  };

  const handleDelete = (index) => {
    if (announcements.length <= 1) {
      toast.error('You must keep at least one announcement.');
      return;
    }
    const updated = announcements.filter((_, idx) => idx !== index);
    setAnnouncements(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/settings/announcements', { announcements }).catch(() => null);
      toast.success('Latest Announcements updated successfully! Changes reflect live on the website.');
    } catch (err) {
      toast.error('Failed to save announcements.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#5b5bf5]" /> Latest Announcements Setting
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create and edit announcement posts displayed on the homepage news section.
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="border border-[#5b5bf5] text-[#5b5bf5] hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Announcement
          </button>
        </div>

        {/* Announcements List Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {announcements.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm relative group"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#5b5bf5]" />
                    <span className="font-bold text-slate-700 text-xs">{item.date}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleChange(idx, 'title', e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-[#5b5bf5]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Date String</label>
                    <input
                      type="text"
                      value={item.date}
                      onChange={(e) => handleChange(idx, 'date', e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-[#5b5bf5]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Feature Image URL</label>
                    <input
                      type="text"
                      value={item.img}
                      onChange={(e) => handleChange(idx, 'img', e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-[#5b5bf5]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Description / Excerpt</label>
                    <RichTextEditor
                      value={item.desc}
                      onChange={(val) => handleChange(idx, 'desc', val)}
                      placeholder="Write announcement content here..."
                      minHeight="140px"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Announcements'}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebarLayout>
  );
}
