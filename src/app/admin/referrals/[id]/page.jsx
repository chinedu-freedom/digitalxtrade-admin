'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import api from '../../../../lib/api';
import { Users, UserCheck, ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUserReferralsDetailPage() {
  const routeParams = useParams();
  const userId = routeParams?.id;

  const [loading, setLoading] = useState(true);
  const [updatingUpline, setUpdatingUpline] = useState(false);
  const [user, setUser] = useState({
    username: 'user',
    fullName: 'User Name',
    uplineUsername: '',
  });

  const [stats, setStats] = useState({
    directActive: 30,
    directTotal: 74,
    nonDirectActive: 72,
    nonDirectTotal: 211,
  });

  const [uplineInput, setUplineInput] = useState('');

  const [referralsList, setReferralsList] = useState([
    {
      id: 'ref_1',
      username: 'Nkujas76',
      fullName: 'Nkululeko Enoch Resha',
      email: 'Nkularesha8@gmail.com',
      status: 'FREE',
      deposit: '$0.00',
      levelStats: 'Level 1: 0 active of 0 total',
    },
    {
      id: 'ref_2',
      username: 'Sen2701',
      fullName: 'Mmakoma Mojapelo',
      email: 'meladimojapelo@gmail.com',
      status: 'ACTIVE',
      deposit: '$57.00',
      levelStats: 'Level 1: 0 active of 1 total',
    },
    {
      id: 'ref_3',
      username: 'Bonganasinga',
      fullName: 'nokubonga',
      email: 'rsagoldiie@gmail.com',
      status: 'FREE',
      deposit: '$0.00',
      levelStats: 'Level 1: 0 active of 0 total',
    },
    {
      id: 'ref_4',
      username: 'Craig25',
      fullName: 'Craig',
      email: 'cade6817@gmail.com',
      status: 'ACTIVE',
      deposit: '$100.00',
      levelStats: 'Level 1: 0 active of 1 total',
    },
    {
      id: 'ref_5',
      username: 'Fanele22',
      fullName: 'Fanele',
      email: 'luyanda.sdu@gmail.com',
      status: 'FREE',
      deposit: '$0.00',
      levelStats: 'Level 1: 0 active of 0 total',
    },
  ]);

  const fetchUserReferrals = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(`/admin/users/${userId}`);
      if (res.data && res.data.success && res.data.user) {
        const u = res.data.user;
        setUser({
          username: u.username || 'user',
          fullName: u.full_name || 'User Name',
          uplineUsername: u.upline?.username || u.referred_by || '',
        });
        setUplineInput(u.upline?.username || u.referred_by || '');
      }
    } catch (err) {
      console.error('Fetch user referrals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReferrals();
  }, [userId]);

  const handleUpdateUpline = async (e) => {
    e.preventDefault();
    try {
      setUpdatingUpline(true);
      await api.put(`/admin/users/${userId}`, { upline_username: uplineInput });
      setUser((prev) => ({ ...prev, uplineUsername: uplineInput }));
      toast.success(`Upline for @${user.username} updated to @${uplineInput || 'N/A'}`);
    } catch (err) {
      toast.error('Failed to update upline');
    } finally {
      setUpdatingUpline(false);
    }
  };

  const handleUnlink = async (refId, refUsername) => {
    try {
      setReferralsList((prev) => prev.filter((r) => r.id !== refId));
      toast.success(`Unlinked referral @${refUsername} successfully`);
    } catch (err) {
      toast.error('Failed to unlink referral');
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/admin/users/detail/${userId}`}
                className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to User Details
              </Link>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-wide">
              User Referrals - <span className="text-[#5b5bf5]">@{user.username}</span>
            </h1>
          </div>
        </div>

        {/* 2 Metric Cards: Direct Referrals & Non-Direct Referrals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: Direct Referrals */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Direct Referrals
              </div>
              <div className="text-xl font-bold text-slate-800">
                Active: <span className="text-emerald-600 font-extrabold">{stats.directActive}</span> / Total: <span className="font-extrabold">{stats.directTotal}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Non Direct Referrals */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Non Direct Referrals
              </div>
              <div className="text-xl font-bold text-slate-800">
                Active: <span className="text-indigo-600 font-extrabold">{stats.nonDirectActive}</span> / Total: <span className="font-extrabold">{stats.nonDirectTotal}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Upline Bar Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            Upline Settings
          </h2>
          <form onSubmit={handleUpdateUpline} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                readOnly
                value={user.username}
                className="w-full h-11 bg-slate-100 border border-slate-200 rounded-lg px-4 text-xs font-bold text-slate-700 cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Upline Username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={uplineInput}
                  onChange={(e) => setUplineInput(e.target.value)}
                  placeholder="Enter upline username"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={updatingUpline}
                  className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-5 h-11 rounded-lg text-xs transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {updatingUpline ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* User Referrals Table (Using OUR modern admin table format) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">
              Referral Network List
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {referralsList.length} direct referrals
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Stats</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {referralsList.length > 0 ? (
                  referralsList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-indigo-600 hover:underline">
                          <Link href={`/admin/users/detail/${row.id}`}>{row.username}</Link>
                        </div>
                        <div className="text-slate-700 italic text-[11px]">{row.fullName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{row.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-extrabold uppercase shadow-sm ${
                            row.status === 'ACTIVE'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-sky-500 text-white'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-bold text-slate-800">
                          Deposit: <span className="font-mono text-emerald-600">{row.deposit}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">{row.levelStats}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleUnlink(row.id, row.username)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-md transition-all shadow-sm cursor-pointer"
                        >
                          UNLINK
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No referrals found for this user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referral Commissions Log (Matching Requested Image Format) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">
              Referral Commissions History
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing recent referral commission earnings
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4 w-6/12">UserName</th>
                  <th className="py-3 px-4 w-3/12 text-right">Amount</th>
                  <th className="py-3 px-4 w-3/12 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {[
                  { id: 'c1', username: user.username || '1001', fromUser: 'Zandile22', amount: '$11.02', icon: '₮', bg: 'bg-teal-600 text-white', date: 'Sep-23-2026', time: '05:39:36 PM' },
                  { id: 'c2', username: user.username || 'Asiphe', fromUser: 'Marshezi', amount: '$2.80', icon: 'Ξ', bg: 'bg-indigo-600 text-white', date: 'Sep-23-2026', time: '02:57:26 PM' },
                  { id: 'c3', username: user.username || '082105ab', fromUser: 'Matlotleng64', amount: '$130.00', icon: 'Ξ', bg: 'bg-indigo-600 text-white', date: 'Sep-23-2026', time: '09:50:06 AM' },
                  { id: 'c4', username: user.username || 'Florence25', fromUser: 'Simang', amount: '$3.60', icon: '₮', bg: 'bg-teal-600 text-white', date: 'Sep-22-2026', time: '07:56:08 PM' },
                  { id: 'c5', username: user.username || 'Za414', fromUser: 'monama87', amount: '$24.00', icon: '₮', bg: 'bg-teal-600 text-white', date: 'Sep-21-2026', time: '12:17:16 PM' },
                  { id: 'c6', username: user.username || '082105ab', fromUser: 'Nosanda11', amount: '$4.00', icon: 'Ξ', bg: 'bg-indigo-600 text-white', date: 'Sep-19-2026', time: '07:47:29 PM' },
                  { id: 'c7', username: user.username || 'Succ141', fromUser: 'Rose12', amount: '$3.00', icon: '₮', bg: 'bg-teal-600 text-white', date: 'Sep-19-2026', time: '02:45:00 PM' },
                  { id: 'c8', username: user.username || '1001', fromUser: 'Millicent89', amount: '$90.00', icon: '₮', bg: 'bg-teal-600 text-white', date: 'Sep-18-2026', time: '07:46:11 PM' },
                  { id: 'c9', username: user.username || 'Pearl13', fromUser: 'Gracious', amount: '$7.55', icon: '₮', bg: 'bg-teal-600 text-white', date: 'Sep-18-2026', time: '07:36:03 PM' },
                  { id: 'c10', username: user.username || 'g9s', fromUser: 'Teleka2', amount: '$110.00', icon: '₮', bg: 'bg-teal-600 text-white', date: 'Sep-17-2026', time: '09:40:41 PM' },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* UserName & Referral Commission Subtext */}
                    <td className="py-3.5 px-4 align-top space-y-1">
                      <div className="font-extrabold text-sm text-slate-900 font-sans">
                        {row.username}
                      </div>
                      <div className="text-xs text-slate-500 font-medium font-sans">
                        <span className="font-semibold text-slate-500">Referral commission:</span>{' '}
                        <span>Referral commission from {row.fromUser}</span>
                      </div>
                    </td>

                    {/* Amount Column with Crypto Asset Icon Badge */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-extrabold text-emerald-600 font-righteous text-sm">
                          {row.amount}
                        </span>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0 ${row.bg}`}>
                          {row.icon}
                        </span>
                      </div>
                    </td>

                    {/* Date & Time Column (2-Line Format) */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="font-bold text-slate-800 text-xs">{row.date}</div>
                      <div className="text-slate-500 text-[11px] font-mono mt-0.5">{row.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
