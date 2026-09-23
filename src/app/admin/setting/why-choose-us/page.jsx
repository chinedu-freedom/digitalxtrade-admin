'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import RichTextEditor from '../../../../components/RichTextEditor';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import {
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Coins,
  Headphones,
  Users,
  Lock,
  Globe,
  Award,
  CheckCircle2,
  Loader2,
  X,
  Shield,
  DollarSign,
  Wallet,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

const availableIcons = [
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Zap', icon: Zap },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Coins', icon: Coins },
  { name: 'Headphones', icon: Headphones },
  { name: 'Users', icon: Users },
  { name: 'Lock', icon: Lock },
  { name: 'Award', icon: Award },
  { name: 'Shield', icon: Shield },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Wallet', icon: Wallet },
  { name: 'Star', icon: Star },
];

import ConfirmModal from '../../../../components/ConfirmModal';

export default function AdminWhyChooseUsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(null); // index or null
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState('ShieldCheck');

  useEffect(() => {
    api
      .get('/public/why-choose-us')
      .then((res) => {
        if (res.data.success && res.data.items) {
          setItems(res.data.items);
        }
      })
      .catch(() => {
        toast.error('Failed to load items.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenAdd = () => {
    setIsEditing('new');
    setTitle('');
    setDesc('');
    setIcon('ShieldCheck');
  };

  const handleOpenEdit = (idx) => {
    setIsEditing(idx);
    setTitle(items[idx].title);
    setDesc(items[idx].desc);
    setIcon(items[idx].icon || 'ShieldCheck');
  };

  const handleDelete = () => {
    if (deleteIdx === null) return;
    const updated = items.filter((_, i) => i !== deleteIdx);
    setItems(updated);
    toast.info('Item removed. Click Save Changes to persist.');
    setDeleteIdx(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isEditing === 'new') {
      setItems([...items, { title, desc, icon }]);
      toast.success('New feature added!');
    } else if (typeof isEditing === 'number') {
      const updated = [...items];
      updated[isEditing] = { title, desc, icon };
      setItems(updated);
      toast.success('Feature updated!');
    }
    setIsEditing(null);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings/why-choose-us', { items });
      toast.success('Why Choose StakeLab section updated live on the user website!');
    } catch (err) {
      toast.error('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
              Why Choose EverStake Management
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Customize feature cards, titles, descriptions, and icons shown on the homepage.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="bg-indigo-50 hover:bg-indigo-100 text-[#5b5bf5] font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all border border-indigo-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Feature Card
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Modal / Inline Editor Panel */}
        {isEditing !== null && (
          <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-md space-y-4 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {isEditing === 'new' ? 'Add New Feature Card' : 'Edit Feature Card'}
              </h3>
              <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Money Security"
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Icon</label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger className="h-10 bg-white border-slate-200 text-slate-800 text-xs rounded-lg">
                      <SelectValue placeholder="Select Icon" />
                    </SelectTrigger>
                    <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                      {availableIcons.map((i) => (
                        <SelectItem key={i.name} value={i.name} className="text-slate-800 hover:bg-slate-100">
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <RichTextEditor
                  value={desc}
                  onChange={setDesc}
                  placeholder="Describe why stakeholders choose StakeLab for this feature..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#5b5bf5] hover:bg-indigo-600 rounded-lg shadow-sm"
                >
                  {isEditing === 'new' ? 'Add Card' : 'Update Card'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => {
            const IconObj = availableIcons.find((i) => i.name === item.icon)?.icon || ShieldCheck;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#5b5bf5] flex items-center justify-center border border-indigo-100 shadow-sm">
                    <IconObj className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{item.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(idx)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Feature"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteIdx(idx)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteIdx !== null}
          onClose={() => setDeleteIdx(null)}
          onConfirm={handleDelete}
          title="Delete Feature Card"
          description="Are you sure you want to delete this feature card? Click Save Changes afterwards to persist."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          isDanger={true}
        />
      </div>
    </AdminSidebarLayout>
  );
}
