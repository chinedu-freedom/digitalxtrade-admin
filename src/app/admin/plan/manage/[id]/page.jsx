'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../../components/AdminSidebarLayout';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../../components/ui/select';
import { Undo2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../../lib/api';

export default function AdminEditPlanPage() {
  const router = useRouter();
  const routeParams = useParams();
  const planId = routeParams?.id;

  // Basic Info
  const [name, setName] = useState('');
  const [planLabel, setPlanLabel] = useState('Plan 1');
  const [status, setStatus] = useState('ACTIVE');
  const [paymentPeriod, setPaymentPeriod] = useState('Daily');
  const [duration, setDuration] = useState('30');
  const [durationUnit, setDurationUnit] = useState('Days'); // 'Days' | 'Hours'

  // Rates & Limits
  const [minAmount, setMinAmount] = useState('100');
  const [maxAmount, setMaxAmount] = useState('1000');
  const [dailyProfit, setDailyProfit] = useState('2.5');

  // Principal Return
  const [capitalReturn, setCapitalReturn] = useState(true);
  const [capitalReturnHoldPercent, setCapitalReturnHoldPercent] = useState('0.00');

  // Compounding & Rules
  const [isCompounding, setIsCompounding] = useState(true);
  const [holdEarningsDays, setHoldEarningsDays] = useState('0');
  const [delayEarningDays, setDelayEarningDays] = useState('0');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!planId) return;
      try {
        setLoading(true);
        let res;
        try {
          res = await api.get(`/admin/staking-plans/${planId}`);
        } catch (e) {
          try {
            res = await api.get('/admin/staking-plans');
          } catch (e2) {
            res = await api.get('/staking/plans');
          }
        }

        const rawList = res.data?.plans || res.data?.stakingPlans || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        const target = res.data?.plan || (Array.isArray(rawList) ? rawList.find((p) => String(p.id || p._id) === String(planId)) : null);

        if (target) {
          setName(target.title || target.name || '');
          setPlanLabel(target.planLabel || target.tier || 'Plan 1');
          setPaymentPeriod(target.payment_period || target.paymentPeriod || 'Daily');

          const durDays = target.duration_days ?? target.durationDays ?? (target.durationHours ? Math.ceil(target.durationHours / 24) : 30);
          setDuration(durDays > 0 ? durDays.toString() : '30');

          let currentStatus = (target.status || target.badge || 'ACTIVE').toUpperCase();
          if (['STARTER', 'RUNNING', 'ACTIVE'].includes(currentStatus)) {
            currentStatus = 'ACTIVE';
          } else {
            currentStatus = 'INACTIVE';
          }
          setStatus(currentStatus);

          const minVal = target.min_amount ?? target.minAmount ?? (Array.isArray(target.tiers) && target.tiers[0]?.min_amount) ?? '100';
          const maxVal = target.max_amount ?? target.maxAmount ?? (Array.isArray(target.tiers) && target.tiers[0]?.max_amount) ?? '5000';
          const rateVal = target.daily_return_percent ?? target.dailyProfit ?? target.percent ?? (Array.isArray(target.tiers) && target.tiers[0]?.percent) ?? '2.5';

          setMinAmount(minVal.toString());
          setMaxAmount(maxVal.toString());
          setDailyProfit(rateVal.toString());

          setCapitalReturn(target.capital_return !== false);
          setCapitalReturnHoldPercent((target.capital_return_hold_percent ?? target.hold_percent ?? '0.00').toString());
          setIsCompounding(target.is_compounding !== false);
          setHoldEarningsDays(target.hold_earnings_days?.toString() || '0');
          setDelayEarningDays(target.delay_earning_days?.toString() || '0');
        }
      } catch (err) {
        console.error('Failed to fetch plan details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanData();
  }, [planId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Plan Name is required.');
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      toast.error('Please specify a valid Duration in Days.');
      return;
    }

    if (!minAmount || parseFloat(minAmount) < 0) {
      toast.error('Valid Minimum Investment Amount is required.');
      return;
    }
    if (!maxAmount || parseFloat(maxAmount) <= parseFloat(minAmount)) {
      toast.error('Maximum Investment Amount must be greater than Minimum Amount.');
      return;
    }
    if (!dailyProfit || parseFloat(dailyProfit) <= 0) {
      toast.error('Valid Daily Profit Rate is required.');
      return;
    }

    setSubmitting(true);
    try {
      const durInt = parseInt(duration || '0');
      const minNum = parseFloat(minAmount);
      const maxNum = parseFloat(maxAmount);
      const profitNum = parseFloat(dailyProfit);

      const payload = {
        title: name,
        name: name,
        planLabel: planLabel || 'Plan 1',
        package_access: 'PUBLIC',
        badge: status,
        status: status,
        is_active: status === 'ACTIVE' || status === 'COMING_SOON',
        payment_period: paymentPeriod,
        paymentPeriod: paymentPeriod,
        duration_days: durInt,
        durationDays: durInt,
        durationHours: null,
        duration_unit: 'Days',
        durationUnit: 'Days',
        without_time_limit: false,
        tiers: [{
          name: planLabel || 'Plan 1',
          min_amount: minNum,
          max_amount: maxNum,
          percent: profitNum,
        }],
        min_amount: minNum,
        max_amount: maxNum,
        minAmount: minNum,
        maxAmount: maxNum,
        daily_return_percent: profitNum,
        dailyProfit: profitNum,
        capital_return: capitalReturn,
        capital_return_hold_percent: 0,
        hold_percent: 0,
        is_compounding: isCompounding,
        hold_earnings_days: parseInt(holdEarningsDays || '0'),
        delay_earning_days: parseInt(delayEarningDays || '0'),
      };

      try {
        await api.put(`/admin/staking-plans/${planId}`, payload);
      } catch (err1) {
        await api.put(`/staking/plans/${planId}`, payload);
      }

      toast.success('Investment Package updated successfully in live database!');
      router.push('/admin/staking-plans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update Investment Package');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
              Edit Investment Package
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Modify rates, limits, and rules for {name || 'package'}
            </p>
          </div>

          <Link
            href="/admin/staking-plans"
            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-md text-xs font-bold font-sans transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Undo2 className="w-4 h-4 text-indigo-600" /> Back
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <span>Loading package details</span>
            <Loader2 className="w-5 h-5 animate-spin text-[#0085d0]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Package Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Package Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. FOUNDATION PLAN"
                    className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-800 text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Plan Display Label */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Plan Display Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={planLabel}
                    onChange={(e) => setPlanLabel(e.target.value)}
                    placeholder="e.g. Plan 1 or PROMO PLAN 1"
                    className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-800 text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-bold font-sans">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                      <SelectItem value="ACTIVE" className="text-slate-800 hover:bg-slate-100 font-bold">Active</SelectItem>
                      <SelectItem value="INACTIVE" className="text-slate-800 hover:bg-slate-100 font-bold">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Period */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Payment Period (Payout Frequency) <span className="text-red-500">*</span>
                  </label>
                  <Select value={paymentPeriod} onValueChange={setPaymentPeriod}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-bold font-sans">
                      <SelectValue placeholder="Select Payment Period" />
                    </SelectTrigger>
                    <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                      <SelectItem value="Hourly" className="text-slate-800 hover:bg-slate-100 font-bold">Hourly</SelectItem>
                      <SelectItem value="Daily" className="text-slate-800 hover:bg-slate-100 font-bold">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Package Duration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Package Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <input
                      type="number"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans placeholder-slate-400 font-mono"
                    />
                    <div className="h-11 bg-slate-100 border-l border-slate-200 px-4 text-xs font-bold text-slate-700 flex items-center shrink-0 select-none">
                      Days
                    </div>
                  </div>
                </div>

                {/* Profit Rate % */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    {paymentPeriod === 'Hourly' ? 'Hourly' : 'Daily'} Profit Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={dailyProfit}
                      onChange={(e) => setDailyProfit(e.target.value)}
                      placeholder="2.50"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans font-mono"
                    />
                    <div className="h-11 bg-slate-100 border-l border-slate-200 px-3.5 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                      %
                    </div>
                  </div>
                </div>

                {/* Minimum Investment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Minimum Investment ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <div className="h-11 bg-slate-100 border-r border-slate-200 px-3.5 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                      $
                    </div>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="100.00"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans font-mono"
                    />
                  </div>
                </div>

                {/* Maximum Investment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Maximum Investment ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <div className="h-11 bg-slate-100 border-r border-slate-200 px-3.5 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                      $
                    </div>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="1000.00"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans font-mono"
                    />
                  </div>
                </div>

                {/* Hold Earnings Days */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Hold Earnings on Account (Days)
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <input
                      type="number"
                      min="0"
                      value={holdEarningsDays}
                      onChange={(e) => setHoldEarningsDays(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans"
                    />
                    <div className="h-11 bg-slate-100 border-l border-slate-200 px-3 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                      Days
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Set 0 to disable holding period</p>
                </div>

                {/* Delay Earning Start Days */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                    Delay Earning Start (Days)
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <input
                      type="number"
                      min="0"
                      value={delayEarningDays}
                      onChange={(e) => setDelayEarningDays(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans"
                    />
                    <div className="h-11 bg-slate-100 border-l border-slate-200 px-3 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                      Days
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Set 0 to disable start delay</p>
                </div>

                {/* Return Principal Toggle */}
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 font-sans">
                      Return Principal
                    </label>
                    <button
                      type="button"
                      onClick={() => setCapitalReturn(!capitalReturn)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                        capitalReturn ? 'bg-[#2563eb]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          capitalReturn ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {capitalReturn ? 'Return Principal: ENABLED' : 'Return Principal: DISABLED'}
                  </p>
                </div>

                {/* Daily Compounding Toggle */}
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 font-sans">
                      Compounding Settings
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCompounding(!isCompounding)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                        isCompounding ? 'bg-[#2563eb]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          isCompounding ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {isCompounding ? 'Compounding: ENABLED' : 'Compounding: DISABLED'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    Updating Investment Package <Loader2 className="w-4 h-4 animate-spin" />
                  </span>
                ) : (
                  'Update Investment Package'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
