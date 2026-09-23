'use client';

import { useEffect, useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import RichTextEditor from '../../../../components/RichTextEditor';
import api from '../../../../lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDepositWithdrawalSettingsPage() {
  const [dailyWithdrawLimit, setDailyWithdrawLimit] = useState('0');
  const [minDeposit, setMinDeposit] = useState('0');
  const [maxDeposit, setMaxDeposit] = useState('0');
  const [depositCharge, setDepositCharge] = useState('0');
  const [minPayout, setMinPayout] = useState('0');
  const [maxPayout, setMaxPayout] = useState('0');
  const [payoutCharge, setPayoutCharge] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const [rechargeNotice, setRechargeNotice] = useState('');
  const [withdrawNotice, setWithdrawNotice] = useState('');

  useEffect(() => {
    api.get('/public/deposit-withdrawal-settings').then((res) => {
      if (res.data?.success && res.data?.settings) {
        const s = res.data.settings;
        if (s.dailyWithdrawLimit !== undefined) setDailyWithdrawLimit(String(s.dailyWithdrawLimit));
        if (s.minDeposit !== undefined) setMinDeposit(String(s.minDeposit));
        if (s.maxDeposit !== undefined) setMaxDeposit(String(s.maxDeposit));
        if (s.depositCharge !== undefined) setDepositCharge(String(s.depositCharge));
        if (s.minPayout !== undefined) setMinPayout(String(s.minPayout));
        if (s.maxPayout !== undefined) setMaxPayout(String(s.maxPayout));
        if (s.payoutCharge !== undefined) setPayoutCharge(String(s.payoutCharge));
        if (s.rechargeNotice !== undefined) setRechargeNotice(s.rechargeNotice);
        if (s.withdrawNotice !== undefined) setWithdrawNotice(s.withdrawNotice);
      }
    }).catch(() => null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/deposit-withdrawal-settings', {
        settings: {
          dailyWithdrawLimit,
          minDeposit,
          maxDeposit,
          depositCharge,
          minPayout,
          maxPayout,
          payoutCharge,
          rechargeNotice,
          withdrawNotice,
        },
      });
      if (res.data.success) {
        toast.success('Deposit & Withdrawal settings & notices updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
          Deposit & Withdrawal Settings
        </h1>

        {/* Setting Form Container */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Daily Withdrawal Limit */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Daily Withdrawal Limit (times)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={dailyWithdrawLimit}
                  onChange={(e) => setDailyWithdrawLimit(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
              </div>

              {/* Minimum Deposit */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Minimum Deposit (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
              </div>

              {/* Maximum Deposit */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Maximum Deposit (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={maxDeposit}
                  onChange={(e) => setMaxDeposit(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
              </div>

              {/* Deposit Charge (%) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Deposit Charge (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={depositCharge}
                  onChange={(e) => setDepositCharge(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
              </div>

              {/* Minimum Payout */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Minimum Payout (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={minPayout}
                  onChange={(e) => setMinPayout(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
              </div>

              {/* Maximum Payout */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Maximum Payout (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={maxPayout}
                  onChange={(e) => setMaxPayout(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
              </div>

              {/* Payout Charge (%) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Payout Charge (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payoutCharge}
                  onChange={(e) => setPayoutCharge(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                />
              </div>
            </div>

            {/* Side-by-Side Rich Text Editors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left Box: Recharge Notice */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 font-sans">
                  Recharge Notice <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={rechargeNotice}
                  onChange={setRechargeNotice}
                  placeholder="Recharge notice instructions..."
                />
              </div>

              {/* Right Box: Withdraw Notice */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 font-sans">
                  Withdraw Notice <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={withdrawNotice}
                  onChange={setWithdrawNotice}
                  placeholder="Withdrawal notice instructions..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5b5bf5] hover:bg-indigo-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span>Submitting</span>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  </>
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
