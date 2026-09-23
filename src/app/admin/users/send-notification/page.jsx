'use client';

import { useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import RichTextEditor from '../../../../components/RichTextEditor';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import api from '../../../../lib/api';

export default function AdminSendNotificationPage() {
  const [beingSentTo, setBeingSentTo] = useState('All Users');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [startFormId, setStartFormId] = useState('1');
  const [perBatch, setPerBatch] = useState('100');
  const [coolingPeriod, setCoolingPeriod] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message content are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/users/send-notification', {
        channel: 'email',
        target_users: beingSentTo,
        subject,
        message,
        start_from: parseInt(startFormId || '1'),
        per_batch: parseInt(perBatch || '100'),
        cooling_period: parseInt(coolingPeriod || '2'),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Notification batch started via EMAIL!');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification batch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
          Notification to Verified Users
        </h1>

        {/* Main Notification Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Being Sent To */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                Being Sent To <span className="text-red-500">*</span>
              </label>
              <Select value={beingSentTo} onValueChange={setBeingSentTo}>
                <SelectTrigger className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-lg">
                  <SelectItem value="All Users">All Users</SelectItem>
                  <SelectItem value="Active Users">Active Users</SelectItem>
                  <SelectItem value="Banned Users">Banned Users</SelectItem>
                  <SelectItem value="Email Unverified">Email Unverified Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject / Title"
                className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            {/* Message with Rich Text Toolbar */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={message}
                onChange={setMessage}
                placeholder="Write your broadcast message content here..."
                minHeight="220px"
              />
            </div>

            {/* Bottom 3 Inputs Grid (Start Form, Per Batch, Cooling Period) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Start Form */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Start Form <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={startFormId}
                  onChange={(e) => setStartFormId(e.target.value)}
                  placeholder="Start form user id. e.g. 1"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              {/* Per Batch */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Per Batch <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
                  <input
                    type="number"
                    required
                    value={perBatch}
                    onChange={(e) => setPerBatch(e.target.value)}
                    placeholder="How many user"
                    className="w-full h-11 border-0 outline-none px-4 text-xs text-slate-800 font-sans"
                  />
                  <span className="bg-slate-100 border-l border-slate-200 px-4 h-11 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                    User
                  </span>
                </div>
              </div>

              {/* Cooling Period */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Cooling Period <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
                  <input
                    type="number"
                    required
                    value={coolingPeriod}
                    onChange={(e) => setCoolingPeriod(e.target.value)}
                    placeholder="Waiting time"
                    className="w-full h-11 border-0 outline-none px-4 text-xs text-slate-800 font-sans"
                  />
                  <span className="bg-slate-100 border-l border-slate-200 px-4 h-11 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                    Seconds
                  </span>
                </div>
              </div>
            </div>

            {/* Full-width Vibrant Indigo Submit Button (Matching Screenshot 2) */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Batch Notifications
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
