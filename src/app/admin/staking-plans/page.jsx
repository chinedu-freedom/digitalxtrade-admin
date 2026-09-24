'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import { Plus, Edit, EyeOff, CheckCircle2, BarChart2, X, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

import ConfirmModal from '../../../components/ConfirmModal';

export default function AdminStakingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/staking-plans');
      if (res.data && res.data.success && Array.isArray(res.data.plans)) {
        const formatted = res.data.plans.map((p) => {
          const minAmt = parseFloat(p.min_amount || 10);
          const maxAmt = parseFloat(p.max_amount || 5000);
          const dailyRate = parseFloat(p.daily_return_percent || 1.5);
          const step = Math.round((maxAmt - minAmt) / 3) || 100;

          let planStatus = 'Active';
          const rawSt = (p.status || p.badge || '').toUpperCase();
          if (rawSt === 'COMING_SOON' || rawSt === 'COMING SOON') {
            planStatus = 'Coming Soon';
          } else if (rawSt === 'UNAVAILABLE' || rawSt === 'DISABLED' || p.is_active === false) {
            planStatus = 'Unavailable';
          } else if (rawSt === 'INACTIVE') {
            planStatus = 'Inactive';
          } else {
            planStatus = 'Active';
          }

          return {
            ...p,
            id: p.id,
            name: p.title,
            tier: p.tier || 'Flexible Tier',
            duration: `${p.duration_days} Days`,
            days: p.duration_days,
            duration_days: p.duration_days,
            is_fixed_deposit: p.is_fixed_deposit !== false,
            capital_return: p.capital_return !== false,
            is_compounding: p.is_compounding !== false,
            status: planStatus,
            segments: [
              { range: `${minAmt.toLocaleString()} USDT – ${(minAmt + step).toLocaleString()} USDT`, rate: `${dailyRate.toFixed(2)}%` },
              { range: `${(minAmt + step + 1).toLocaleString()} USDT – ${(minAmt + step * 2).toLocaleString()} USDT`, rate: `${(dailyRate * 1.5).toFixed(2)}%` },
              { range: `${(minAmt + step * 2 + 1).toLocaleString()} USDT – ${maxAmt.toLocaleString()} USDT`, rate: `${(dailyRate * 2.0).toFixed(2)}%` },
            ],
          };
        });
        setPlans(formatted);
      }
    } catch (err) {
      console.error('Failed to load admin plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenSegmentModal = (plan) => {
    setSelectedPlan(plan);
    setSegmentModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    const target = plans.find((p) => p.id === id);
    if (!target) return;

    const nextIsActive = target.status !== 'Active';
    const nextStatusText = nextIsActive ? 'Active' : 'Unavailable';

    try {
      await api.put(`/admin/staking-plans/${id}`, { is_active: nextIsActive });
      toast.success(`Plan "${target.name}" status updated to ${nextStatusText}!`);
      setPlans(plans.map((p) => (p.id === id ? { ...p, status: nextStatusText } : p)));
    } catch (err) {
      toast.error('Failed to update plan status');
    }
  };

  const handleDeletePlan = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    try {
      await api.delete(`/admin/staking-plans/${id}`);
      toast.success(`Plan "${name}" deleted successfully!`);
      setPlans(plans.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Bar */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            Investment Plans
          </h1>

          {/* + Add New Button */}
          <Link
            href="/admin/plan/manage"
            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-xs font-bold font-sans transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-indigo-600" /> Add New Package
          </Link>
        </div>

        {/* Staking / Investment Plans Table Container (Horizontally Scrollable) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1350px] text-left border-collapse font-sans text-xs">
              {/* Vibrant Indigo Header */}
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  <th className="py-3.5 px-5">Package Name</th>
                  <th className="py-3.5 px-4 text-center">Deposit Range ($)</th>
                  <th className="py-3.5 px-4 text-center">Return Rate</th>
                  <th className="py-3.5 px-4 text-center">Duration</th>
                  <th className="py-3.5 px-4 text-center">Access</th>
                  <th className="py-3.5 px-5">Plan Rules & Rules</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <span>Loading Investment Plans</span>
                        <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
                      </div>
                    </td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No investment plans found.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Package Name & Details */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800 text-sm">{plan.name}</div>
                        {plan.description && (
                          <div className="text-[11px] text-slate-500 max-w-xs truncate mt-0.5">
                            {plan.description}
                          </div>
                        )}
                        {plan.earnings_memo && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-xs">
                            Memo: {plan.earnings_memo}
                          </div>
                        )}
                      </td>

                      {/* Deposit Range */}
                      <td className="py-4 px-4 text-center whitespace-nowrap font-mono font-bold text-slate-800">
                        ${Number(plan.min_amount || 0).toLocaleString()} – ${Number(plan.max_amount || 0).toLocaleString()}
                        <div className="text-[10px] font-sans font-normal text-slate-400">USDT / Crypto</div>
                      </td>

                      {/* Return Rate & Payment Period */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="font-bold text-emerald-600 text-sm font-mono">
                          {plan.daily_return_percent || plan.percent || '1.5'}%
                        </div>
                        <div className="text-[10px] font-bold text-indigo-600 uppercase">
                          {plan.payment_period || 'Daily'} Payouts
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 text-center font-bold text-slate-700 whitespace-nowrap">
                        {plan.without_time_limit || plan.duration_days === 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] uppercase font-bold">
                            ∞ Lifetime
                          </span>
                        ) : (
                          <span>{plan.duration_days || plan.days || 30} Days</span>
                        )}
                      </td>

                      {/* Access */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                            plan.package_access === 'PRIVATE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {plan.package_access || 'PUBLIC'}
                        </span>
                      </td>

                      {/* Rules & Badges */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                          <span className={`px-2 py-0.5 rounded border whitespace-nowrap ${plan.capital_return !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            Capital Return: {plan.capital_return !== false ? 'YES' : 'NO'}
                          </span>
                          <span className={`px-2 py-0.5 rounded border whitespace-nowrap ${plan.is_compounding !== false ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            Compounding: {plan.is_compounding !== false ? 'YES' : 'NO'}
                          </span>
                          {(plan.hold_earnings_days > 0 || plan.delay_earning_days > 0) && (
                            <span className="px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-800 whitespace-nowrap">
                              Hold: {plan.hold_earnings_days || 0}d | Delay: {plan.delay_earning_days || 0}d
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 whitespace-nowrap">
                            Wallets: {plan.allow_deposit_wallet !== false ? 'Deposit' : ''}{plan.allow_deposit_wallet !== false && plan.allow_profit_wallet !== false ? ' + ' : ''}{plan.allow_profit_wallet !== false ? 'Profit' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${
                            plan.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/plan/manage/${plan.id}`}
                            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </Link>

                          <button
                            onClick={() => handleToggleStatus(plan.id)}
                            className={`border px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              plan.status === 'Active'
                                ? 'border-amber-500 text-amber-600 hover:bg-amber-50'
                                : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {plan.status === 'Active' ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" /> Disable
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Enable
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setDeleteTarget({ id: plan.id, name: plan.name })}
                            className="border border-red-500 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeletePlan}
          title="Delete Staking Plan"
          description={`Are you sure you want to delete the "${deleteTarget?.name || ''}" staking plan? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          isDanger={true}
        />
      </div>
    </AdminSidebarLayout>
  );
}
