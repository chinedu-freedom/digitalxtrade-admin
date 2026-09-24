'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { Undo2, Loader2, Plus, Trash2, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../lib/api';

export default function AdminCreatePlanPage() {
  const router = useRouter();

  // Basic Info
  const [name, setName] = useState('');
  const [access, setAccess] = useState('PUBLIC'); // PUBLIC or PRIVATE
  const [status, setStatus] = useState('ACTIVE');
  const [paymentPeriod, setPaymentPeriod] = useState('Daily');
  const [duration, setDuration] = useState('30');
  const [withoutTimeLimit, setWithoutTimeLimit] = useState(false);

  // Tiered Earning Rates
  const [tiers, setTiers] = useState([
    { name: 'Plan 1', minAmount: '100', maxAmount: '999', percent: '2.0' },
    { name: 'Plan 2', minAmount: '1000', maxAmount: '4999', percent: '3.5' },
  ]);

  // Principal & Details
  const [capitalReturn, setCapitalReturn] = useState(true);
  const [description, setDescription] = useState('');
  const [earningsMemo, setEarningsMemo] = useState('Earning from deposit #deposit_amount# - #percent# %');

  // Compounding & Rules
  const [isCompounding, setIsCompounding] = useState(true);
  const [holdEarningsDays, setHoldEarningsDays] = useState('0');
  const [delayEarningDays, setDelayEarningDays] = useState('0');

  // Allowed Funding Sources
  const [allowDepositWallet, setAllowDepositWallet] = useState(true);
  const [allowProfitWallet, setAllowProfitWallet] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const handleAddTier = () => {
    const nextNum = tiers.length + 1;
    setTiers([
      ...tiers,
      { name: `Plan ${nextNum}`, minAmount: '', maxAmount: '', percent: '' },
    ]);
  };

  const handleRemoveTier = (index) => {
    if (tiers.length <= 1) {
      toast.error('At least one earning rate tier is required.');
      return;
    }
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    updated[index][field] = value;
    setTiers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Plan Name is required.');
      return;
    }

    if (!withoutTimeLimit && (!duration || parseInt(duration) <= 0)) {
      toast.error('Please specify a valid Duration in days or select "Without time limit".');
      return;
    }

    const firstTier = tiers[0];
    if (!firstTier.minAmount || !firstTier.maxAmount || !firstTier.percent) {
      toast.error('Please fill out all fields for at least Tier 1.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/staking-plans', {
        title: name,
        package_access: access,
        badge: status,
        status: status,
        is_active: status === 'ACTIVE' || status === 'COMING_SOON',
        payment_period: paymentPeriod,
        duration_days: withoutTimeLimit ? 0 : parseInt(duration),
        without_time_limit: withoutTimeLimit,
        tiers: tiers.map((t) => ({
          name: t.name,
          min_amount: parseFloat(t.minAmount || '0'),
          max_amount: parseFloat(t.maxAmount || '0'),
          percent: parseFloat(t.percent || '0'),
        })),
        min_amount: parseFloat(firstTier.minAmount),
        max_amount: parseFloat(firstTier.maxAmount),
        daily_return_percent: parseFloat(firstTier.percent),
        capital_return: capitalReturn,
        description,
        earnings_memo: earningsMemo,
        is_compounding: isCompounding,
        hold_earnings_days: parseInt(holdEarningsDays || '0'),
        delay_earning_days: parseInt(delayEarningDays || '0'),
        allow_deposit_wallet: allowDepositWallet,
        allow_profit_wallet: allowProfitWallet,
      });

      toast.success('Investment Plan created successfully!');
      router.push('/admin/staking-plans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Investment Plan');
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
              Add Investment Package
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Configure parameters, rates, and rules for new investment packages
            </p>
          </div>

          <Link
            href="/admin/staking-plans"
            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-md text-xs font-bold font-sans transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Undo2 className="w-4 h-4 text-indigo-600" /> Back
          </Link>
        </div>

        {/* Form Card Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Package Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5b5bf5]" /> Basic Package Details
            </h2>

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
                  placeholder="e.g. Starter VIP Plan"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-800 text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Package Access (Public / Private) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Package Access <span className="text-red-500">*</span>
                </label>
                <Select value={access} onValueChange={setAccess}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-bold font-sans">
                    <SelectValue placeholder="Select Access" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="PUBLIC" className="text-slate-800 hover:bg-slate-100 font-bold">
                      Public (Visible to All)
                    </SelectItem>
                    <SelectItem value="PRIVATE" className="text-slate-800 hover:bg-slate-100 font-bold">
                      Private (Closed / Invite Only)
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="COMING_SOON" className="text-slate-800 hover:bg-slate-100 font-bold">Coming Soon</SelectItem>
                    <SelectItem value="INACTIVE" className="text-slate-800 hover:bg-slate-100 font-bold">Inactive</SelectItem>
                    <SelectItem value="UNAVAILABLE" className="text-slate-800 hover:bg-slate-100 font-bold">Unavailable</SelectItem>
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
                    <SelectItem value="Weekly" className="text-slate-800 hover:bg-slate-100 font-bold">Weekly</SelectItem>
                    <SelectItem value="Monthly" className="text-slate-800 hover:bg-slate-100 font-bold">Monthly</SelectItem>
                    <SelectItem value="Yearly" className="text-slate-800 hover:bg-slate-100 font-bold">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Package Duration */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Package Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white w-full sm:w-64 focus-within:ring-1 focus-within:ring-indigo-500">
                    <input
                      type="number"
                      disabled={withoutTimeLimit}
                      required={!withoutTimeLimit}
                      value={withoutTimeLimit ? '' : duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-slate-800 text-xs font-sans placeholder-slate-400 disabled:bg-slate-100"
                    />
                    <div className="h-11 bg-slate-100 border-l border-slate-200 px-4 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                      Days
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={withoutTimeLimit}
                      onChange={(e) => setWithoutTimeLimit(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Without time limit (Lifetime)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Tiered Earning Rates */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800 font-sans">
                  Investment Package Earning Rates
                </h2>
                <p className="text-[11px] text-slate-500">
                  Define deposit brackets and earning percentage rates for this package
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tier Bracket
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-amber-100/70 border-b border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                    <th className="py-2.5 px-4">Tier Name</th>
                    <th className="py-2.5 px-4">Min Amount ($)</th>
                    <th className="py-2.5 px-4">Max Amount ($)</th>
                    <th className="py-2.5 px-4">Percent (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tiers.map((tierItem, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(index)}
                          className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          required
                          value={tierItem.name}
                          onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                          placeholder="e.g. Plan 1"
                          className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="any"
                          required
                          value={tierItem.minAmount}
                          onChange={(e) => handleTierChange(index, 'minAmount', e.target.value)}
                          placeholder="0.00"
                          className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="any"
                          required
                          value={tierItem.maxAmount}
                          onChange={(e) => handleTierChange(index, 'maxAmount', e.target.value)}
                          placeholder="1000.00"
                          className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={tierItem.percent}
                          onChange={(e) => handleTierChange(index, 'percent', e.target.value)}
                          placeholder="2.5"
                          className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Principal & Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-3">
              Principal Return & Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Return Principal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Return Principal <span className="text-red-500">*</span>
                </label>
                <Select
                  value={capitalReturn ? 'RETURN' : 'NO_RETURN'}
                  onValueChange={(val) => setCapitalReturn(val === 'RETURN')}
                >
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-bold font-sans">
                    <SelectValue placeholder="Select Principal Return" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="RETURN" className="text-slate-800 hover:bg-slate-100 font-bold">
                      Return Principal (Refund initial capital at maturity)
                    </SelectItem>
                    <SelectItem value="NO_RETURN" className="text-slate-800 hover:bg-slate-100 font-bold">
                      Do Not Return Principal (Profit payouts only)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Earnings History Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Earnings History Memo
                </label>
                <input
                  type="text"
                  value={earningsMemo}
                  onChange={(e) => setEarningsMemo(e.target.value)}
                  placeholder="e.g. Earning from deposit #deposit_amount# - #percent# %"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-800 text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Available tags: #deposit_amount#, #percent#, #package_name#
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-2">
                  Package Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter package summary, return highlights, or rules shown to users..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-4 text-slate-800 text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Holding, Delay & Compounding Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-3">
              Holding, Delay & Compounding Rules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Daily Compounding */}
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
            </div>
          </div>

          {/* Section 5: Wallet Funding Sources */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-3">
              Allowed Wallet Funding Sources
            </h2>

            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowDepositWallet}
                  onChange={(e) => setAllowDepositWallet(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Accept deposits from Deposit Wallet (Main Balance)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowProfitWallet}
                  onChange={(e) => setAllowProfitWallet(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Accept deposits from Profit Wallet (Earned Profits)</span>
              </label>
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
                  Saving Investment Package <Loader2 className="w-4 h-4 animate-spin" />
                </span>
              ) : (
                'Save Investment Package'
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebarLayout>
  );
}
