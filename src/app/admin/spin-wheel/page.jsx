'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import { Disc, Save, Loader2, Coins, Edit2, Plus, Trash2, Award } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';
import ConfirmModal from '../../../components/ConfirmModal';

export default function AdminSpinWheelPage() {
  const [settings, setSettings] = useState({
    feature_enabled: true,
    total_spins_used: 0,
    total_rewards_earned: 0,
    free_spins_used: 0,
  });

  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteSliceId, setDeleteSliceId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);

  const [prizeForm, setPrizeForm] = useState({
    label: '',
    prize_type: 'CASH',
    amount: '',
    probability: '10',
    color: '#ff0044',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSettings, resPrizes] = await Promise.all([
        api.get('/admin/spin-settings'),
        api.get('/admin/spin-prizes'),
      ]);

      if (resSettings.data && resSettings.data.success) {
        setSettings(resSettings.data.settings || resSettings.data);
      }
      if (resPrizes.data && resPrizes.data.success) {
        setPrizes(resPrizes.data.prizes || resPrizes.data);
      }
    } catch (err) {
      console.error('Failed to load spin wheel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/admin/spin-settings', settings);
      if (res.data && res.data.success) {
        toast.success('Spin wheel configuration saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save spin settings');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreatePrize = () => {
    if (prizes.length >= 8) {
      toast.error('Maximum 8 spin wheel slices allowed!');
      return;
    }
    setEditingPrize(null);
    setPrizeForm({ label: '', prize_type: 'CASH', amount: '', probability: '10', color: '#ff0044' });
    setShowModal(true);
  };

  const handleOpenEditPrize = (prize) => {
    setEditingPrize(prize);
    setPrizeForm({
      label: prize.label,
      prize_type: prize.prize_type || 'CASH',
      amount: prize.amount,
      probability: prize.probability,
      color: prize.color || '#ff0044',
    });
    setShowModal(true);
  };

  const handleSavePrize = async (e) => {
    e.preventDefault();
    try {
      if (editingPrize) {
        await api.put(`/admin/spin-prizes/${editingPrize.id}`, prizeForm);
        toast.success('Prize slice updated!');
      } else {
        await api.post('/admin/spin-prizes', prizeForm);
        toast.success('Prize slice added!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save prize slice');
    }
  };

  const handleDeletePrize = async () => {
    if (!deleteSliceId) return;
    try {
      await api.delete(`/admin/spin-prizes/${deleteSliceId}`);
      toast.success('Prize slice deleted!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete prize slice');
    } finally {
      setDeleteSliceId(null);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
            <Disc className="w-6 h-6 text-[#5b5bf5]" /> Lucky Spin Wheel Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Manage lucky spin wheel feature settings and 8 prize wheel slots. Free spins are awarded when users invite new registrations.
          </p>
        </div>

        {/* 3 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total Spins Used</div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {settings.total_spins_used || 0} <span className="text-xs font-semibold text-slate-400">spins</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total Rewards Claimed</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ${parseFloat(settings.total_rewards_earned || 0).toFixed(2)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Free Spins Redeemed</div>
            <div className="text-2xl font-black text-[#5b5bf5] mt-1">
              {settings.free_spins_used || 0} <span className="text-xs font-semibold text-slate-400">free</span>
            </div>
          </div>
        </div>

        {/* Main Form & Prize Slices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Spin Config Rules */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#5b5bf5]" /> Spin Reward Model
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 space-y-1">
                <span className="text-xs font-bold text-emerald-800 block">Referral Reward Model</span>
                <span className="text-[11px] text-emerald-700 leading-relaxed block">
                  Users earn <b>+1 Free Spin credit</b> every time a new member registers on the platform using their referral link.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Config
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: 8 Wheel Prize Slices */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 font-sans flex items-center gap-2">
                <Award className="w-4 h-4 text-[#5b5bf5]" /> Wheel Slices ({prizes.length} / 8)
              </h2>

              <button
                onClick={handleOpenCreatePrize}
                disabled={prizes.length >= 8}
                className="px-3 py-1.5 rounded-lg bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Add Wheel Slice
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prizes.map((prize, idx) => (
                <div
                  key={prize.id || idx}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-inner shrink-0"
                        style={{ backgroundColor: prize.color || '#ff0044' }}
                      ></div>
                      <span className="font-bold text-xs text-slate-800">{prize.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditPrize(prize)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteSliceId(prize.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg font-sans">
                    <div>
                      <span className="text-slate-400">Reward:</span>{' '}
                      <span className="font-extrabold text-emerald-600">
                        {prize.prize_type === 'NONE' ? 'No Reward' : `$${parseFloat(prize.amount).toFixed(2)}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Probability:</span>{' '}
                      <span className="font-extrabold text-indigo-600">{prize.probability}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prize Modal */}
        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 cursor-default"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#5b5bf5]" />
                  {editingPrize ? 'Edit Wheel Slice' : 'Add Wheel Slice'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePrize} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Slice Label *</label>
                  <input
                    type="text"
                    required
                    value={prizeForm.label}
                    onChange={(e) => setPrizeForm({ ...prizeForm, label: e.target.value })}
                    placeholder="e.g. $10 Cash Bonus"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Reward Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={prizeForm.amount}
                      onChange={(e) => setPrizeForm({ ...prizeForm, amount: e.target.value })}
                      placeholder="e.g. 10.00"
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Probability (%)</label>
                    <input
                      type="number"
                      required
                      value={prizeForm.probability}
                      onChange={(e) => setPrizeForm({ ...prizeForm, probability: e.target.value })}
                      placeholder="10"
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Slice Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={prizeForm.color}
                      onChange={(e) => setPrizeForm({ ...prizeForm, color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={prizeForm.color}
                      onChange={(e) => setPrizeForm({ ...prizeForm, color: e.target.value })}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-mono focus:outline-none"
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
                    className="px-5 py-2.5 bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-md transition-all"
                  >
                    Save Wheel Slice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteSliceId}
          onClose={() => setDeleteSliceId(null)}
          onConfirm={handleDeletePrize}
          title="Delete Prize Slice"
          description="Are you sure you want to delete this prize slice? This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          isDanger={true}
        />
      </div>
    </AdminSidebarLayout>
  );
}
