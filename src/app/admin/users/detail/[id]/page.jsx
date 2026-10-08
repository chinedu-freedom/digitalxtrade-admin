'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../../components/AdminSidebarLayout';
import PageLoader from '../../../../../components/PageLoader';
import api from '../../../../../lib/api';
import {
  Wallet,
  Landmark,
  ArrowLeftRight,
  Layers,
  PlusCircle,
  MinusCircle,
  List,
  Ban,
  Banknote,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  X,
  Loader2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Trash2,
  Users,
  HandCoins,
  Clock,
  TrendingUp,
  Zap,
  Gift,
  AlertTriangle,
  Megaphone,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { countries } from '../../../../../lib/countries';

export default function AdminUserDetailPage() {
  const routeParams = useParams();
  const userId = routeParams?.id;

  const [userData, setUserData] = useState({
    fullName: 'User',
    username: 'user',
    email: '',
    dialCode: '+1',
    mobile: '',
    country: '',
    lastLogin: 'Never',
    lastLoginIp: 'N/A',
    uplineName: 'System Sponsor',
    uplineUsername: 'admin_ref',
    uplineId: '1',
    btcAddress: '',
    usdtAddress: '',
    usdtBep20Address: '',
    ethAddress: '',
    ltcAddress: '',
    secretQuestion: '',
    secretAnswer: '',
    adminNote: '',
    userIps: [],
    btcBalance: '$0.00',
    usdtTrc20Balance: '$0.00',
    usdtBep20Balance: '$0.00',
    ltcBalance: '$0.00',
    mainBalance: '$0.00',
    walletBalanceUsdt: '$0.00',
    deposits: '$0.00',
    activeDeposit: '$0.00',
    totalEarning: '$0.00',
    withdrawals: '$0.00',
    pendingWithdrawals: '$0.00',
    totalBonus: '$0.00',
    totalPenalty: '$0.00',
    referralsCount: '0',
    referralCommissions: '$0.00',
    transactions: '0',
    stakings: '0',
    emailVerified: true,
    twoFaEnabled: false,
    banned: false,
    maxDailyWithdraw: '50000.00',
    maxDailyWithdrawal: '50000.00',
    maxDailyBtcWithdrawal: '20000.00',
    maxDailyUsdtWithdrawal: '50000.00',
    maxDailyEthWithdrawal: '20000.00',
    maxDailyLtcWithdrawal: '10000.00',
  });

  const [loading, setLoading] = useState(true);

  const fetchUserDetail = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(`/admin/users/${userId}`);
      if (res.data.success && res.data.user) {
        const u = res.data.user;
        const nameParts = (u.full_name || '').split(' ');
        const fName = nameParts[0] || 'User';
        const lName = nameParts.slice(1).join(' ') || '';
        const foundCountry = countries.find((c) => c.name.toLowerCase() === (u.country || '').toLowerCase()) || countries[0];
        let rawMobile = u.mobile || '';
        // Clean mobile number to contain only digits, removing dial code prefix if embedded
        rawMobile = rawMobile.replace(/^\+\d+\s*/, '').replace(/\D/g, '');
        if (rawMobile.startsWith('0') && rawMobile.length === 11) {
          rawMobile = rawMobile.substring(1);
        }

        setUserData({
          id: u.id,
          fullName: u.full_name || u.name || 'User',
          username: u.username || 'user',
          email: u.email || '',
          dialCode: foundCountry.dialCode || '+1',
          mobile: rawMobile,
          country: u.country || foundCountry.name || '',
          lastLogin: u.last_login_formatted || (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Never'),
          lastLoginIp: u.lastLoginIp || u.last_login_ip || 'N/A',
          uplineName: u.upline?.name || u.upline?.full_name || 'System Sponsor',
          uplineUsername: u.upline?.username || u.referred_by || 'admin_ref',
          uplineId: u.upline?.id || u.upline_id || '1',
          btcAddress: u.bitcoinAddress || u.btc_address || u.btcAddress || '',
          usdtAddress: u.usdtTrc20Address || u.usdt_trc20_address || u.usdt_address || u.usdtAddress || '',
          usdtBep20Address: u.usdtBep20Address || u.usdt_bep20_address || u.ethAddress || u.eth_address || '',
          ethAddress: u.usdtBep20Address || u.usdt_bep20_address || u.ethAddress || u.eth_address || '',
          ltcAddress: u.litecoinAddress || u.ltc_address || u.ltcAddress || '',
          secretQuestion: u.secret_question || u.secretQuestion || '',
          secretAnswer: u.secret_answer || u.secretAnswer || '',
          adminNote: u.admin_note || u.adminNote || '',
          userIps: u.user_ips || u.userIps || [],
          btcBalance: `$${parseFloat(u.btc_balance ?? u.btcBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          usdtTrc20Balance: `$${parseFloat(u.usdt_trc20_balance ?? u.usdtTrc20Balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          usdtBep20Balance: `$${parseFloat(u.usdt_bep20_balance ?? u.usdtBep20Balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          ltcBalance: `$${parseFloat(u.ltc_balance ?? u.ltcBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          mainBalance: `$${parseFloat(u.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          walletBalanceUsdt: `$${parseFloat(u.staked_balance ?? u.stakedBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          deposits: (u.deposits || []).length > 0 ? `$${(u.deposits || []).filter(d => d.status === 'APPROVED').reduce((acc, d) => acc + parseFloat(d.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
          activeDeposit: u.active_deposit ? `$${parseFloat(u.active_deposit).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
          totalEarning: u.total_earning ? `$${parseFloat(u.total_earning).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
          withdrawals: (u.withdrawals || []).length > 0 ? `$${(u.withdrawals || []).filter(w => w.status === 'APPROVED').reduce((acc, w) => acc + parseFloat(w.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
          pendingWithdrawals: u.pending_withdrawals ? `$${parseFloat(u.pending_withdrawals).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
          totalBonus: u.total_bonus ? `$${parseFloat(u.total_bonus).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
          totalPenalty: u.total_penalty ? `$${parseFloat(u.total_penalty).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
          referralsCount: u.referrals_count || u.referrals?.length ? String(u.referrals_count || u.referrals.length) : '0',
          referralCommissions: u.referral_commissions ? `$${parseFloat(u.referral_commissions).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
          transactions: String((u.transactions || []).length),
          stakings: String((u.stakes || []).length),
          emailVerified: u.email_verified !== undefined ? Boolean(u.email_verified) : Boolean(u.isEmailVerified),
          twoFaEnabled: false,
          banned: u.is_suspended !== undefined ? Boolean(u.is_suspended) : Boolean(u.banned),
          maxDailyWithdraw: u.maxDailyWithdraw !== undefined && u.maxDailyWithdraw !== null
            ? String(u.maxDailyWithdraw)
            : (u.max_daily_withdraw !== undefined && u.max_daily_withdraw !== null
              ? String(u.max_daily_withdraw)
              : (u.maxDailyWithdrawal !== undefined ? String(u.maxDailyWithdrawal) : '50000.00')),
        });
      }
    } catch (err) {
      console.error('Fetch user detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceAction, setBalanceAction] = useState('add'); // 'add' | 'subtract'
  const [walletType, setWalletType] = useState('USDT (TRC20) Wallet');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Reset Login Password Modal State
  const [resetLoginModalOpen, setResetLoginModalOpen] = useState(false);
  const [newLoginPass, setNewLoginPass] = useState('');
  const [confirmLoginPass, setConfirmLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Reset Withdrawal Password Modal State
  const [resetWithdrawalModalOpen, setResetWithdrawalModalOpen] = useState(false);
  const [newWithdrawalPass, setNewWithdrawalPass] = useState('');
  const [confirmWithdrawalPass, setConfirmWithdrawalPass] = useState('');
  const [showWithdrawalPass, setShowWithdrawalPass] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);



  const handleLoginAsUser = async () => {
    try {
      const res = await api.post(`/admin/users/${userId}/impersonate`);
      if (res.data && res.data.success && res.data.token) {
        const token = res.data.token;
        const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
        const defaultUserAppUrl = isLocal ? 'http://localhost:3000' : 'https://everstake.cx';
        const userAppUrl = process.env.NEXT_PUBLIC_USER_APP_URL || defaultUserAppUrl;

        document.cookie = `stakelab_token=${token}; path=/; max-age=7200; SameSite=Lax${!isLocal ? '; domain=.everstake.cx; Secure' : ''}`;
        document.cookie = `sec-prd-token=${token}; path=/; max-age=7200; SameSite=Lax${!isLocal ? '; domain=.everstake.cx; Secure' : ''}`;
        localStorage.setItem('stakelab_token', token);

        const targetUrl = `${userAppUrl.replace(/\/$/, '')}/dashboard?impersonate_token=${token}`;
        toast.success(`Logging in as @${userData.username}...`);
        window.open(targetUrl, '_blank');
      } else {
        toast.error(res.data?.message || 'Failed to generate user impersonation token.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred during user impersonation.');
    }
  };

  const handleResetLoginPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newLoginPass || newLoginPass.length < 6) {
      toast.error('New login password must be at least 6 characters.');
      return;
    }
    if (newLoginPass !== confirmLoginPass) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      let res;
      try {
        res = await api.put(`/admin/users/${userId}`, { password: newLoginPass, new_password: newLoginPass });
      } catch (err1) {
        try {
          res = await api.put(`/admin/users/${userId}/password`, { password: newLoginPass, new_password: newLoginPass });
        } catch (err2) {
          res = await api.post(`/admin/users/${userId}/reset-password`, { password: newLoginPass, new_password: newLoginPass });
        }
      }

      if (res.data && res.data.success !== false) {
        toast.success(`Login password for @${userData.username} has been reset successfully!`);
        setResetLoginModalOpen(false);
        setNewLoginPass('');
        setConfirmLoginPass('');
        setShowLoginPass(false);
      } else {
        toast.error(res.data?.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetWithdrawalPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newWithdrawalPass || newWithdrawalPass.length < 4) {
      toast.error('New withdrawal PIN/password must be at least 4 digits/characters.');
      return;
    }
    if (newWithdrawalPass !== confirmWithdrawalPass) {
      toast.error('Withdrawal passwords do not match.');
      return;
    }
    try {
      const res = await api.put(`/admin/users/${userId}`, { withdrawal_pin: newWithdrawalPass });
      if (res.data && res.data.success) {
        toast.success(`Withdrawal PIN for @${userData.username} has been updated successfully!`);
        setResetWithdrawalModalOpen(false);
        setNewWithdrawalPass('');
        setConfirmWithdrawalPass('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update withdrawal PIN');
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const handleDeleteUser = async () => {
    try {
      setDeletingUser(true);
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'User deleted successfully!');
        setDeleteModalOpen(false);
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/users';
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeletingUser(false);
    }
  };

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSelectCountry = (c) => {
    setUserData({
      ...userData,
      country: c.name,
      dialCode: c.dialCode,
    });
    setCountryDropdownOpen(false);
    setCountrySearch('');
  };

  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);

  // Option 3: Asset Wallets by Currency
  const assetWallets = [
    {
      id: 'usdt_trc20',
      name: 'USDT (TRC20) Wallet',
      symbol: 'USDT',
      network: 'TRC20',
      icon: '₮',
      iconBg: 'bg-teal-500',
      badgeClass: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      balance: userData.usdtTrc20Balance || '$0.00',
    },
    {
      id: 'usdt_bep20',
      name: 'USDT (BEP20) Wallet',
      symbol: 'USDT',
      network: 'BEP20',
      icon: '₮',
      iconBg: 'bg-indigo-500',
      badgeClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      balance: userData.usdtBep20Balance || '$0.00',
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin (BTC) Wallet',
      symbol: 'BTC',
      network: 'BTC Network',
      icon: '₿',
      iconBg: 'bg-amber-500',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      balance: userData.btcBalance || '$0.00',
    },
    {
      id: 'litecoin',
      name: 'Litecoin (LTC) Wallet',
      symbol: 'LTC',
      network: 'LTC Network',
      icon: 'Ł',
      iconBg: 'bg-slate-400',
      badgeClass: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
      balance: userData.ltcBalance || '$0.00',
    },
  ];

  const selectedWallet = assetWallets.find((w) => w.name === walletType) || assetWallets[0];

  const handleOpenBalanceModal = (actionType) => {
    setBalanceAction(actionType);
    setWalletType('USDT (TRC20) Wallet');
    setAmount('');
    setRemark('');
    setWalletDropdownOpen(false);
    setBalanceModalOpen(true);
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please provide a positive amount.');
      return;
    }
    if (!remark) {
      toast.error('Remark is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/users/balance', {
        user_id: userId,
        action: balanceAction,
        wallet_type: walletType,
        amount: parseFloat(amount),
        remark,
        admin_password: adminPassword,
      });

      if (res.data && res.data.success) {
        toast.success(res.data.message || `Successfully adjusted user balance!`);
        setBalanceModalOpen(false);
        setAmount('');
        setRemark('');
        fetchUserDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user balance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBanSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const nextActiveState = userData.banned; // if currently banned (banned=true), unban it -> is_active=true
      const res = await api.put(`/admin/users/${userId}`, { is_active: nextActiveState });
      if (res.data && res.data.success) {
        const newBannedState = !nextActiveState;
        setUserData((prev) => ({ ...prev, banned: newBannedState }));
        toast.warning(`User ${userData.username} status updated (${newBannedState ? 'Banned' : 'Active'}).`);
        setBanModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setSubmitting(false);
    }
  };


  const handleSaveMaxDailyWithdraw = async () => {
    try {
      const amount = parseFloat(userData.maxDailyWithdraw);
      const finalVal = isNaN(amount) ? 0 : amount;
      const res = await api.put(`/admin/users/${userId}`, {
        maxDailyWithdraw: finalVal,
        max_daily_withdraw: finalVal,
      });
      if (res.data?.success) {
        toast.success(`Max daily withdrawal for @${userData.username} set to ${finalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        fetchUserDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update max daily withdrawal limit');
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/admin/users/${userId}`, {
        full_name: userData.fullName,
        username: userData.username,
        email: userData.email,
        mobile: userData.mobile,
        country: userData.country,
        bitcoinAddress: userData.btcAddress,
        btc_address: userData.btcAddress,
        usdtTrc20Address: userData.usdtAddress,
        usdt_address: userData.usdtAddress,
        usdtBep20Address: userData.usdtBep20Address || userData.ethAddress,
        usdt_bep20_address: userData.usdtBep20Address || userData.ethAddress,
        litecoinAddress: userData.ltcAddress,
        ltc_address: userData.ltcAddress,
        secret_question: userData.secretQuestion,
        secret_answer: userData.secretAnswer,
        admin_note: userData.adminNote,
        maxDailyWithdraw: parseFloat(userData.maxDailyWithdraw) || 0,
        max_daily_withdraw: parseFloat(userData.maxDailyWithdraw) || 0,
        email_verified: userData.emailVerified,
      });

      if (res.data && res.data.success) {
        toast.success('User details updated successfully!');
        fetchUserDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user information');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            User Detail - {userData.username}
          </h1>
        </div>

        {/* Crypto Asset Balances Row (4 Cards Per Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Bitcoin (BTC) Balance */}
          <Link
            href={`/admin/report/transaction/${userId}?gateway=Bitcoin`}
            className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all border border-slate-800 cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 font-sans">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">₿</span>
                Bitcoin (BTC)
              </div>
              <div className="text-lg font-bold font-righteous mt-1 text-white">
                {userData.btcBalance}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-amber-400 font-bold text-base">₿</span>
            </div>
          </Link>

          {/* Card 2: USDT (TRC20) Balance */}
          <Link
            href={`/admin/report/transaction/${userId}?gateway=USDT`}
            className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all border border-slate-800 cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 font-sans">
                <span className="w-3.5 h-3.5 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">₮</span>
                USDT (TRC20)
              </div>
              <div className="text-lg font-bold font-righteous mt-1 text-white">
                {userData.usdtTrc20Balance}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-teal-400 font-bold text-base">₮</span>
            </div>
          </Link>

          {/* Card 3: USDT (BEP20) Balance */}
          <Link
            href={`/admin/report/transaction/${userId}?gateway=BEP20`}
            className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all border border-slate-800 cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 font-sans">
                <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">Ξ</span>
                USDT (BEP20)
              </div>
              <div className="text-lg font-bold font-righteous mt-1 text-white">
                {userData.usdtBep20Balance}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-indigo-400 font-bold text-base">Ξ</span>
            </div>
          </Link>

          {/* Card 4: Litecoin (LTC) Balance */}
          <Link
            href={`/admin/report/transaction/${userId}?gateway=Litecoin`}
            className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all border border-slate-800 cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 font-sans">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">Ł</span>
                Litecoin (LTC)
              </div>
              <div className="text-lg font-bold font-righteous mt-1 text-white">
                {userData.ltcBalance}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-slate-300 font-bold text-base">Ł</span>
            </div>
          </Link>
        </div>

        {/* Top Financial Metric Cards Grid (4 per line) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Balance */}
          <Link
            href={`/admin/report/transaction/${userId}`}
            className="bg-[#3b5998] hover:bg-[#324b82] text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Total Balance</div>
              <div className="text-lg font-bold font-righteous mt-1">
                {userData.mainBalance}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 2: Total Deposit */}
          <Link
            href={`/admin/deposits?search=${userData.username}`}
            className="bg-[#10b981] hover:bg-[#059669] text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Total Deposit</div>
              <div className="text-lg font-bold font-righteous mt-1">
                {userData.deposits}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 4: Total Earning */}
          <Link
            href={`/admin/report/transaction/${userId}?type=earnings`}
            className="bg-[#059669] hover:bg-[#047857] text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Total Earning</div>
              <div className="text-lg font-bold font-righteous mt-1">
                {userData.totalEarning}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 5: Total Withdrawal */}
          <Link
            href={`/admin/withdrawals?search=${userData.username}`}
            className="bg-[#00695c] hover:bg-[#00574d] text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Total Withdrawal</div>
              <div className="text-lg font-bold font-righteous mt-1">
                {userData.withdrawals}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 6: Pending Withdrawals */}
          <Link
            href={`/admin/withdrawals/pending?search=${userData.username}`}
            className="bg-[#d97706] hover:bg-[#b45309] text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Pending Withdrawals</div>
              <div className="text-lg font-bold font-righteous mt-1">
                {userData.pendingWithdrawals}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 9: Referrals 1st Level */}
          <Link
            href={`/admin/referrals/${userId}`}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Referrals 1st Level</div>
              <div className="text-lg font-bold font-righteous mt-1">
                {userData.referralsCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 10: Referral Commissions */}
          <Link
            href={`/admin/report/transaction/${userId}?type=referral_commission`}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Referral Commissions</div>
              <div className="text-lg font-bold font-righteous mt-1">
                {userData.referralCommissions}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HandCoins className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Middle Action Buttons Row (Horizontally Scrollable, Balanced Single-Line Buttons) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {/* Button 1: + Balance */}
          <button
            type="button"
            onClick={() => handleOpenBalanceModal('add')}
            className="flex-1 min-w-[130px] whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Balance
          </button>

          {/* Button 2: - Balance */}
          <button
            type="button"
            onClick={() => handleOpenBalanceModal('subtract')}
            className="flex-1 min-w-[130px] whitespace-nowrap bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <MinusCircle className="w-4 h-4" /> Balance
          </button>

          {/* Button 3: Reset Login Password */}
          <button
            type="button"
            onClick={() => setResetLoginModalOpen(true)}
            className="flex-1 min-w-[160px] whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Key className="w-4 h-4" /> Reset Login Pass
          </button>

          {/* Button 4: Reset Withdrawal Password */}
          <button
            type="button"
            onClick={() => setResetWithdrawalModalOpen(true)}
            className="flex-1 min-w-[170px] whitespace-nowrap bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Lock className="w-4 h-4" /> Reset Withdraw Pass
          </button>


          {/* Button 6: Ban User */}
          <button
            type="button"
            onClick={() => setBanModalOpen(true)}
            className={`flex-1 min-w-[130px] whitespace-nowrap font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-white shrink-0 ${
              userData.banned
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#ffb020] hover:bg-amber-500'
            }`}
          >
            <Ban className="w-4 h-4" /> {userData.banned ? 'Unban User' : 'Ban User'}
          </button>

          {/* Button 7: Delete User */}
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="flex-1 min-w-[130px] whitespace-nowrap bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" /> Delete User
          </button>
        </div>

        {/* Information Form Card Container */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 font-sans">
              Information of {userData.fullName}
            </h2>
            {/* Last Login & IP Address Security Badge */}
            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3.5 py-1.5 text-xs font-sans">
              <span className="font-semibold text-slate-600">Last Login:</span>
              <span className="font-bold text-slate-800 font-mono">{userData.lastLogin || 'Never'}</span>
              <span className="text-indigo-300">|</span>
              <span className="font-semibold text-slate-600">IP:</span>
              <span className="font-bold text-[#5b5bf5] font-mono">{userData.lastLoginIp || 'N/A'}</span>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Row 1: Full Name, Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.fullName}
                  onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Row 2: Email, Referred By (Upline) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 font-sans">
                    Referred By (Upline)
                  </label>
                  {userData.uplineId &&
                    userData.uplineUsername &&
                    userData.uplineName !== 'System Sponsor' &&
                    !['n/a', 'none', '', 'system sponsor', 'admin_ref', 'system'].includes(String(userData.uplineUsername).toLowerCase()) && (
                      <Link
                        href={`/admin/users/detail/${userData.uplineId}`}
                        className="text-[11px] font-bold text-[#5b5bf5] hover:underline flex items-center gap-0.5"
                      >
                        View Upline Details →
                      </Link>
                    )}
                </div>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50/60">
                  <div className="h-11 bg-slate-100 border-r border-slate-200 px-3 text-xs font-bold text-slate-500 flex items-center shrink-0">
                    @
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={
                      userData.uplineUsername &&
                      !['n/a', 'none', ''].includes(String(userData.uplineUsername).toLowerCase())
                        ? (userData.uplineName && userData.uplineName !== 'System Sponsor'
                            ? `${userData.uplineName} (@${userData.uplineUsername})`
                            : userData.uplineUsername)
                        : 'N/A'
                    }
                    className="w-full h-11 bg-transparent border-0 outline-none px-3 text-xs font-bold text-slate-700 font-sans cursor-default"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Account ID (BTC) & Account ID (USDT TRC20) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  <span>Account ID</span>
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">₿</span>
                    BTC
                  </span>
                </label>
                <input
                  type="text"
                  value={userData.btcAddress}
                  onChange={(e) => setUserData({ ...userData, btcAddress: e.target.value })}
                  placeholder="Bitcoin Wallet Address"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  <span>Account ID</span>
                  <span className="inline-flex items-center gap-1 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">₮</span>
                    USDT (TRC20)
                  </span>
                </label>
                <input
                  type="text"
                  value={userData.usdtAddress}
                  onChange={(e) => setUserData({ ...userData, usdtAddress: e.target.value })}
                  placeholder="Tether TRC20 Wallet Address"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Row 4: Account ID (USDT BEP20) & Account ID (LTC) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  <span>Account ID</span>
                  <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">Ξ</span>
                    USDT (BEP20)
                  </span>
                </label>
                <input
                  type="text"
                  value={userData.usdtBep20Address || userData.ethAddress}
                  onChange={(e) => setUserData({ ...userData, usdtBep20Address: e.target.value, ethAddress: e.target.value })}
                  placeholder="USDT BEP20 Wallet Address"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  <span>Account ID</span>
                  <span className="inline-flex items-center gap-1 bg-slate-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">Ł</span>
                    LTC
                  </span>
                </label>
                <input
                  type="text"
                  value={userData.ltcAddress}
                  onChange={(e) => setUserData({ ...userData, ltcAddress: e.target.value })}
                  placeholder="Litecoin Wallet Address"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Row 5: Secret Question & Secret Answer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Secret Question
                </label>
                <input
                  type="text"
                  value={userData.secretQuestion}
                  onChange={(e) => setUserData({ ...userData, secretQuestion: e.target.value })}
                  placeholder="e.g. First born"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Secret Answer
                </label>
                <input
                  type="text"
                  value={userData.secretAnswer}
                  onChange={(e) => setUserData({ ...userData, secretAnswer: e.target.value })}
                  placeholder="e.g. Gingirikani"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Max Daily Withdraw Section Card (Matches Reference Header) */}
            <div className="rounded-xl overflow-hidden border border-amber-300/90 shadow-sm">
              {/* Peach Header Bar */}
              <div className="bg-[#fed7aa] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-950/85 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-amber-950 tracking-tight font-sans">
                    Max Daily Withdraw:
                  </span>
                </div>
                <div className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Current: ${parseFloat(userData.maxDailyWithdraw || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Card Body */}
              <div className="bg-amber-50/70 p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={userData.maxDailyWithdraw}
                      onChange={(e) => setUserData({ ...userData, maxDailyWithdraw: e.target.value })}
                      placeholder="50000.00"
                      className="w-full h-11 bg-white border border-amber-300 rounded-lg pl-8 pr-4 text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveMaxDailyWithdraw}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider"
                  >
                    Save Limit
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-slate-600">Quick Presets:</span>
                  {[1000, 5000, 10000, 25000, 50000, 0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setUserData({ ...userData, maxDailyWithdraw: String(preset) })}
                      className="px-2.5 py-1 text-[11px] font-bold rounded bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      {preset === 0 ? 'Unlimited ($0)' : `${preset.toLocaleString()}`}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-600 font-medium">
                  Controls the maximum total USD withdrawal limit allowed for @{userData.username} per 24-hour day. Withdrawals exceeding this sum are rejected automatically. Set to 0 for unlimited withdrawals.
                </p>
              </div>
            </div>

            {/* Row 7: Admin Note (Ticker Announcement to User) */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-800 font-sans uppercase tracking-wider flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-600" />
                    <span>Admin Note</span>
                  </label>
                </div>
                {userData.adminNote && (
                  <button
                    type="button"
                    onClick={() => setUserData({ ...userData, adminNote: '' })}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
                  >
                    Clear Note
                  </button>
                )}
              </div>

              <textarea
                rows={3}
                value={userData.adminNote}
                onChange={(e) => setUserData({ ...userData, adminNote: e.target.value })}
                placeholder="e.g. Notice: You have an outstanding account bill/fee of $250.00 to pay off before withdrawal. Please contact support."
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>




            {/* Row 6: Full-width Vibrant Indigo Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* User IPs Section (Using OUR modern admin table format) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
            User IPs:
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4 w-1/3 border-r border-slate-200 text-center">
                    IP
                  </th>
                  <th className="py-3 px-4 w-2/3 text-center">
                    Last Access
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {Array.isArray(userData.userIps) && userData.userIps.length > 0 ? (
                  userData.userIps.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 border-r border-slate-100 text-center">
                        {item.ip}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 text-center">
                        {item.lastAccess}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-slate-400 font-sans">
                      No IP log history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reset Login Password Modal */}
        {resetLoginModalOpen && (
          <div
            onClick={() => setResetLoginModalOpen(false)}
            className="fixed inset-0 z-[100] w-full h-full min-h-screen bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 font-sans">
                  Reset Login Password
                </h3>
                <button
                  onClick={() => setResetLoginModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Set a new login password for @{userData.username}.
              </p>

              <form onSubmit={handleResetLoginPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    New Login Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      value={newLoginPass}
                      onChange={(e) => setNewLoginPass(e.target.value)}
                      placeholder="Enter new password (min 6 chars)..."
                      className="w-full bg-white border border-slate-200 rounded-lg pl-3.5 pr-10 h-11 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    Confirm Login Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      value={confirmLoginPass}
                      onChange={(e) => setConfirmLoginPass(e.target.value)}
                      placeholder="Confirm new password..."
                      className="w-full bg-white border border-slate-200 rounded-lg pl-3.5 pr-10 h-11 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        Resetting Password <Loader2 className="w-4 h-4 animate-spin" />
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Withdrawal Password Modal */}
        {resetWithdrawalModalOpen && (
          <div
            onClick={() => setResetWithdrawalModalOpen(false)}
            className="fixed inset-0 z-[100] w-full h-full min-h-screen bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 font-sans">
                  Reset Withdrawal PIN / Password
                </h3>
                <button
                  onClick={() => setResetWithdrawalModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Set a new security withdrawal PIN/password for @{userData.username}.
              </p>

              <form onSubmit={handleResetWithdrawalPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    New Withdrawal PIN/Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showWithdrawalPass ? 'text' : 'password'}
                      required
                      value={newWithdrawalPass}
                      onChange={(e) => setNewWithdrawalPass(e.target.value)}
                      placeholder="Enter new PIN/password..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 pr-10 h-11 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWithdrawalPass(!showWithdrawalPass)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    >
                      {showWithdrawalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    Confirm Withdrawal PIN/Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showWithdrawalPass ? 'text' : 'password'}
                      required
                      value={confirmWithdrawalPass}
                      onChange={(e) => setConfirmWithdrawalPass(e.target.value)}
                      placeholder="Confirm new PIN/password..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 pr-10 h-11 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWithdrawalPass(!showWithdrawalPass)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    >
                      {showWithdrawalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Balance / Subtract Balance Modal */}
        {balanceModalOpen && (
          <div
            onClick={() => setBalanceModalOpen(false)}
            className="fixed inset-0 z-[100] w-full h-full min-h-screen bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 font-sans">
                  {balanceAction === 'add' ? 'Add Balance' : 'Subtract Balance'}
                </h3>
                <button
                  onClick={() => setBalanceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBalanceSubmit} className="space-y-4">
                {/* Dedicated Asset Wallets Dropdown (Option 3: Currency Asset Wallets) */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5 flex items-center justify-between">
                    <span>Select Asset Wallet</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Current: <strong className="font-semibold text-slate-800 font-mono">{selectedWallet.balance}</strong>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                    className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 flex items-center justify-between text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs transition-all hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full ${selectedWallet.iconBg} text-white font-bold flex items-center justify-center text-[11px] shadow-xs shrink-0`}>
                        {selectedWallet.icon}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{selectedWallet.name}</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {selectedWallet.network}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-700 text-xs">{selectedWallet.balance}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${walletDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {walletDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 font-sans animate-in fade-in zoom-in-95 duration-150 overflow-hidden divide-y divide-slate-100">
                      {assetWallets.map((wallet) => {
                        const isSelected = walletType === wallet.name;
                        return (
                          <button
                            key={wallet.id}
                            type="button"
                            onClick={() => {
                              setWalletType(wallet.name);
                              setWalletDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 font-medium transition-colors cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-50/80 text-indigo-950 font-bold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded-full ${wallet.iconBg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                                {wallet.icon}
                              </span>
                              <div>
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  {wallet.name}
                                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                    {wallet.network}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold font-mono ${isSelected ? 'text-[#5b5bf5]' : 'text-slate-600'}`}>
                                {wallet.balance}
                              </span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5b5bf5]"></span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Amount Input Group with Dynamic Asset Badge */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    Amount ($ USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Please provide positive amount"
                      className="w-full h-11 bg-transparent border-0 outline-none px-4 text-xs text-slate-800 font-sans placeholder-slate-400"
                    />
                    <div className="h-11 bg-slate-100 border-l border-slate-200 px-3.5 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 select-none">
                      <span className={`w-4 h-4 rounded-full ${selectedWallet.iconBg} text-white text-[10px] font-bold flex items-center justify-center`}>
                        {selectedWallet.icon}
                      </span>
                      <span>{selectedWallet.symbol} ($)</span>
                    </div>
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <p className="mt-1.5 text-[11px] text-slate-500 font-sans flex items-center gap-1">
                      <span>Preview:</span>
                      <span className="font-semibold text-slate-700">
                        {balanceAction === 'add' ? 'Crediting' : 'Debiting'}{' '}
                        <strong className="text-slate-900 font-mono">${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>{' '}
                        {balanceAction === 'add' ? 'to' : 'from'} {selectedWallet.name}
                      </span>
                    </p>
                  )}
                </div>

                {/* Remark Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    Remark <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Provide reason for balance adjustment..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Admin Security Password Field */}
                <div>
                  <label className="block text-xs font-bold text-amber-700 font-sans mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Admin Security Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password to confirm..."
                      className="w-full h-11 bg-white border border-amber-300 rounded-lg px-3.5 pr-10 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    >
                      {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying & Submitting
                      </span>
                    ) : (
                      'Confirm Balance Adjustment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ban User Modal */}
        {banModalOpen && (
          <div
            onClick={() => setBanModalOpen(false)}
            className="fixed inset-0 z-[100] w-full h-full min-h-screen bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 font-sans">
                  Ban User
                </h3>
                <button
                  onClick={() => setBanModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                If you ban this user he/she won't able to access his/her dashboard.
              </p>

              <form onSubmit={handleBanSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder=""
                    className="w-full bg-white border border-slate-200 rounded-lg p-3.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}



        {/* 6. Delete User Confirmation Modal */}
        {deleteModalOpen && (
          <div
            onClick={() => setDeleteModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-800 font-sans">Delete User Account</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete user <strong className="text-slate-900">@{userData.username}</strong> ({userData.email})?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium leading-relaxed">
                <strong>Warning:</strong> This will delete all user stakes, transaction history, deposits, withdrawals, and wallet records. This action cannot be undone!
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deletingUser}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold font-sans transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deletingUser}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-red-500/20 disabled:opacity-50"
                >
                  {deletingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deletingUser ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
