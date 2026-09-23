'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import api from '../../../lib/api';
import {
  Users,
  UserCheck,
  Mail,
  Smartphone,
  ChevronRight,
  HandCoins,
  Loader2,
  XCircle,
  Percent,
  Wallet,
  Wrench,
  Calendar,
  ChevronDown,
  Plus,
  Minus,
  Search,
  Hand,
  Home,
  Menu,
  TrendingUp,
  Activity,
  UserPlus,
  ArrowUpRight,
  Clock,
  Zap,
  Settings,
  PlusCircle,
  Layers,
  LifeBuoy,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayUsers: 0,
    emailUnverified: 0,
    totalDeposited: 0,
    todaysDeposit: 0,
    pendingDeposits: 0,
    pendingDepositsSum: 0,
    approvedDepositsCount: 0,
    rejectedDeposits: 0,
    depositCharge: 0,
    depositChargeCount: 0,
    totalWithdrawn: 0,
    todaysWithdrawal: 0,
    pendingWithdrawals: 0,
    pendingWithdrawalsSum: 0,
    approvedWithdrawalsCount: 0,
    rejectedWithdrawals: 0,
    withdrawalCharge: 0,
    totalStaked: 0,
    todaysStaking: 0,
    activeStakingCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [dateFilterDep, setDateFilterDep] = useState('Last 15 Days');
  const [dateFilterTrx, setDateFilterTrx] = useState('Last 15 Days');
  const [openDepDropdown, setOpenDepDropdown] = useState(false);
  const [openTrxDropdown, setOpenTrxDropdown] = useState(false);

  const filterOptions = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'This Month',
    'Last Month',
    'Last 6 Months',
    'This Year',
  ];

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/stats')
      .then((res) => {
        if (res.data.success && res.data.stats) {
          setStats((prev) => ({ ...prev, ...res.data.stats }));
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            Dashboard
          </h1>
        </div>

        {/* User Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <Link
            href="/admin/users"
            className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Total Users</div>
                <div className="text-lg font-bold text-slate-800 mt-0.5">
                  {stats.totalUsers}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Card 2: Active Users */}
          <Link
            href="/admin/users/active"
            className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Active Users</div>
                <div className="text-lg font-bold text-slate-800 mt-0.5">
                  {stats.activeUsers}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Card 3: Today's Users */}
          <Link
            href="/admin/users"
            className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Today's Users</div>
                <div className="text-lg font-bold text-slate-800 mt-0.5">
                  {stats.todayUsers}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Card 4: Investment Packages */}
          <Link
            href="/admin/staking-plans"
            className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Investment Packages</div>
                <div className="text-lg font-bold text-slate-800 mt-0.5">
                  {stats.investmentPackages || stats.activeStakingCount || 6}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Middle Large Cards Grid (Deposits Summary & Withdrawals Summary Full Width) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Box 1: Deposits Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 font-sans flex items-center justify-between">
              <span>Deposits Overview</span>
              <span className="text-xs text-slate-400 font-normal">Live</span>
            </h2>

            <div className="space-y-3">
              {/* Total Deposited */}
              <Link
                href="/admin/deposits"
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100/80 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <HandCoins className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      ${Number(stats.totalDeposited || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-400">Total Deposited</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Today's Deposit */}
              <Link
                href="/admin/deposits"
                className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 flex items-center justify-between hover:bg-blue-100/60 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-900">
                      ${Number(stats.todaysDeposit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-blue-600 font-medium">Today's Deposit</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Pending Deposits Amount & Count */}
              <Link
                href="/admin/deposits/pending"
                className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center justify-between hover:bg-amber-100/60 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      ${Number(stats.pendingDepositsSum || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({stats.pendingDeposits})
                    </div>
                    <div className="text-[11px] text-amber-600 font-medium">Pending Deposits</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>


              {/* Rejected Deposits */}
              <Link
                href="/admin/deposits/rejected"
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100/80 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{stats.rejectedDeposits}</div>
                    <div className="text-[11px] text-slate-400">Rejected Deposits</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Box 2: Withdrawals Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 font-sans flex items-center justify-between">
              <span>Withdrawals Overview</span>
              <span className="text-xs text-slate-400 font-normal">Live</span>
            </h2>

            <div className="space-y-3">
              {/* Total Withdrawn */}
              <Link
                href="/admin/withdrawals"
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100/80 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      ${Number(stats.totalWithdrawn || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-400">Total Withdrawn</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Today's Withdrawal */}
              <Link
                href="/admin/withdrawals"
                className="p-3 rounded-xl border border-red-100 bg-red-50/40 flex items-center justify-between hover:bg-red-100/60 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-red-900">
                      ${Number(stats.todaysWithdrawal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-red-600 font-medium">Today's Withdrawal</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Pending Withdrawals Amount & Count */}
              <Link
                href="/admin/withdrawals/pending"
                className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center justify-between hover:bg-amber-100/60 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      ${Number(stats.pendingWithdrawalsSum || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({stats.pendingWithdrawals})
                    </div>
                    <div className="text-[11px] text-amber-600 font-medium">Pending Withdrawals</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>


              {/* Rejected Withdrawals */}
              <Link
                href="/admin/withdrawals/rejected"
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100/80 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{stats.rejectedWithdrawals}</div>
                    <div className="text-[11px] text-slate-400">Rejected Withdrawals</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

        {/* 3. Weekly Staking & Revenue Chart + Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Staking Trend Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base font-sans">Weekly Activity & Staking Trends</h3>
                <p className="text-xs text-slate-400 font-sans">Live volume split between Staking Investments and Direct Wallet Deposits.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold pt-1 sm:pt-0">
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-2.5 h-2.5 rounded bg-[#5b5bf5]" /> Staking
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded bg-[#10b981]" /> Deposits
                </span>
              </div>
            </div>

            {/* Custom SVG Area Chart */}
            <div className="h-64 w-full relative pt-4">
              <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="colorStaking" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b5bf5" stopOpacity="0.25"/>
                    <stop offset="95%" stopColor="#5b5bf5" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity="0.25"/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="0" x2="500" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="37" x2="500" y2="37" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="112" x2="500" y2="112" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Staking Area Path */}
                <path
                  d="M0,150 L50,140 L120,135 L200,120 L300,130 L400,110 L500,150 Z"
                  fill="url(#colorStaking)"
                />
                <path
                  d="M0,150 L50,140 L120,135 L200,120 L300,130 L400,110 L500,150"
                  fill="none"
                  stroke="#5b5bf5"
                  strokeWidth="2.5"
                />

                {/* Deposits Area Path */}
                <path
                  d="M0,150 L70,145 L150,130 L230,140 L320,125 L420,135 L500,150 Z"
                  fill="url(#colorDeposits)"
                />
                <path
                  d="M0,150 L70,145 L150,130 L230,140 L320,125 L420,135 L500,150"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              </svg>

              <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-3 px-2">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base font-sans mb-1">Quick Admin Actions</h3>
              <p className="text-xs text-slate-400 mb-1.5 font-sans">Common operational shortcuts</p>
            </div>
            <div className="space-y-2.5">
              <Link href="/admin/users/active" className="block w-full">
                <button className="w-full flex items-center justify-between bg-[#5b5bf5] hover:bg-indigo-600 text-white rounded-xl px-4 py-3 text-xs font-bold transition-all shadow-sm cursor-pointer">
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" /> Manage All Users
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </button>
              </Link>
              <Link href="/admin/deposits/pending" className="block w-full">
                <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-600 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer">
                  <span className="flex items-center gap-2.5">
                    <HandCoins className="w-4 h-4 text-slate-400" /> Pending Deposits ({stats.pendingDeposits})
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </Link>
              <Link href="/admin/withdrawals/pending" className="block w-full">
                <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-600 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer">
                  <span className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-slate-400" /> Pending Withdrawals ({stats.pendingWithdrawals})
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </Link>
              <Link href="/admin/plan/manage" className="block w-full">
                <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-600 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer">
                  <span className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-slate-400" /> Create Investment
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
