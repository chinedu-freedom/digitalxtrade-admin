'use client';

import { useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Eye, EyeOff, ShieldCheck, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminVerificationPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current verification password.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      toast.error('New verification password must be at least 4 digits/characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New verification password and confirm password do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/verification-password', { currentPassword, newPassword });
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Verification security password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update verification password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto font-sans">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#5b5bf5]" /> Verification Password
        </h1>

        {/* Form Container */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl text-xs text-indigo-900 leading-relaxed font-sans font-medium">
            🔒 This verification password is required when approving high-security operations (e.g. balance adjustments, withdrawals, or administrative user actions).
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Verification Password * */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                Current Verification Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current verification password..."
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-3.5 pr-11 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Verification Password * */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                New Verification Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new verification password..."
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-3.5 pr-11 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Verification Password * */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                Confirm Verification Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new verification password..."
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-3.5 pr-11 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
