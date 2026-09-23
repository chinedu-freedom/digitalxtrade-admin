'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { Undo2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminCreatePlanPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dailyInterest, setDailyInterest] = useState('');
  const [duration, setDuration] = useState('');
  const [tier, setTier] = useState('Flexible Tier');
  const [status, setStatus] = useState('ACTIVE');
  const [isFixedDeposit, setIsFixedDeposit] = useState(true);
  const [capitalReturn, setCapitalReturn] = useState(true);
  const [isCompounding, setIsCompounding] = useState(true);
  const [maxInvestLimit, setMaxInvestLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !duration || !minAmount || !maxAmount || !dailyInterest) {
      toast.error('Please fill in all required plan fields.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/staking-plans', {
        title: name,
        badge: status,
        status: status,
        is_active: status === 'ACTIVE' || status === 'COMING_SOON',
        min_amount: parseFloat(minAmount),
        max_amount: parseFloat(maxAmount),
        daily_return_percent: parseFloat(dailyInterest),
        duration_days: parseInt(duration),
        tier,
        is_fixed_deposit: isFixedDeposit,
        capital_return: capitalReturn,
        is_compounding: isCompounding,
        max_invest_limit: maxInvestLimit !== '' ? parseInt(maxInvestLimit) : 0,
      });
      toast.success('Staking Plan created successfully!');
      router.push('/admin/staking-plans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Staking Plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            Create Plan
          </h1>

          {/* Back Button */}
          <Link
            href="/admin/staking-plans"
            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-md text-xs font-bold font-sans transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Undo2 className="w-4 h-4 text-indigo-600" /> Back
          </Link>
        </div>

        {/* Form Card Container */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. EverStake Starter"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-800 text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                />
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Duration (Days) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Duration in days"
                    className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans placeholder-slate-400"
                  />
                  <div className="h-11 bg-slate-100 border-l border-slate-200 px-4 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                    Days
                  </div>
                </div>
              </div>

              {/* Daily Interest Rate (%) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Daily Interest (%) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dailyInterest}
                    onChange={(e) => setDailyInterest(e.target.value)}
                    placeholder="e.g. 1.5"
                    className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans placeholder-slate-400"
                  />
                  <div className="h-11 bg-slate-100 border-l border-slate-200 px-4 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                    % Daily
                  </div>
                </div>
              </div>

              {/* Staking Tier Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Staking Tier <span className="text-red-500">*</span>
                </label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-bold font-sans">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="Flexible Tier" className="text-slate-800 hover:bg-slate-100 font-bold">Flexible Tier</SelectItem>
                    <SelectItem value="Dynamic Tier" className="text-slate-800 hover:bg-slate-100 font-bold">Dynamic Tier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Min/Max Amount, Status & Investment Limit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Min Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Min Amount ($) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <input
                    type="number"
                    required
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="Min amount"
                    className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans placeholder-slate-400"
                  />
                  <div className="h-11 bg-slate-100 border-l border-slate-200 px-4 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                    USDT
                  </div>
                </div>
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Max Amount ($) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <input
                    type="number"
                    required
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="Max amount"
                    className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans placeholder-slate-400"
                  />
                  <div className="h-11 bg-slate-100 border-l border-slate-200 px-4 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                    USDT
                  </div>
                </div>
              </div>

              {/* Plan Status (Active, Inactive, Unavailable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Plan Status <span className="text-red-500">*</span>
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-bold font-sans">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="ACTIVE" className="text-slate-800 hover:bg-slate-100 font-bold">Active</SelectItem>
                    <SelectItem value="COMING_SOON" className="text-slate-800 hover:bg-slate-100 font-bold">Coming Soon</SelectItem>
                    <SelectItem value="INACTIVE" className="text-slate-800 hover:bg-slate-100 font-bold">Inactive</SelectItem>
                    <SelectItem value="UNAVAILABLE" className="text-slate-800 hover:bg-slate-100 font-bold">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Investments Per User */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Max Investments / User <span className="text-slate-400 font-normal">(0 = Unlimited)</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <input
                    type="number"
                    min="0"
                    value={maxInvestLimit}
                    onChange={(e) => setMaxInvestLimit(e.target.value)}
                    placeholder="0 (Unlimited)"
                    className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans placeholder-slate-400"
                  />
                  <div className="h-11 bg-slate-100 border-l border-slate-200 px-3 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                    Times
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Rules & Payout Features (Sleek Toggle Switches) */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 font-sans mb-3">
                Plan Rules & Payout Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
                {/* 1. Fixed Deposit Lockup Toggle */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 font-sans">
                      Fixed Deposit Lockup
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsFixedDeposit(!isFixedDeposit)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                        isFixedDeposit ? 'bg-[#2563eb]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          isFixedDeposit ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight font-sans">
                    {isFixedDeposit ? 'Fixed Deposit: YES (Capital locked until maturity)' : 'Fixed Deposit: NO (Capital flexible)'}
                  </p>
                </div>

                {/* 2. Capital Return Toggle */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 font-sans">
                      Capital Return at Maturity
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
                  <p className="text-[11px] text-slate-500 leading-tight font-sans">
                    {capitalReturn ? 'Capital Return: YES (Principal + Profit returned)' : 'Capital Return: N/A (Profit only)'}
                  </p>
                </div>

                {/* 3. Daily Compounding Toggle */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 font-sans">
                      Daily Compounding Yield
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
                  <p className="text-[11px] text-slate-500 leading-tight font-sans">
                    {isCompounding ? 'Compounding: YES (Daily profit compounds)' : 'Compounding: NO (Simple yield)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    Creating Plan <Loader2 className="w-4 h-4 animate-spin" />
                  </span>
                ) : (
                  'Create Staking Plan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
