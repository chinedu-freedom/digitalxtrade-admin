'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../../components/AdminSidebarLayout';
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
  LogIn,
  Banknote,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { countries } from '../../../../../lib/countries';

export default function AdminUserDetailPage() {
  const routeParams = useParams();
  const userId = routeParams?.id;

  const [userData, setUserData] = useState({
    firstName: 'User',
    lastName: '',
    username: 'user',
    email: '',
    dialCode: '+1',
    mobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    mainBalance: '$0.00',
    walletBalanceUsdt: '$0.00',
    deposits: '$0.00',
    withdrawals: '$0.00',
    transactions: '0',
    stakings: '0',
    emailVerified: true,
    twoFaEnabled: false,
    banned: false,
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
          firstName: fName,
          lastName: lName,
          username: u.username || 'user',
          email: u.email || '',
          dialCode: foundCountry.dialCode || '+1',
          mobile: rawMobile,
          address: u.address || '',
          city: u.city || '',
          state: u.state || '',
          zipCode: u.zip_code || '',
          country: u.country || foundCountry.name,
          mainBalance: `$${parseFloat(u.balance || 0).toFixed(2)}`,
          walletBalanceUsdt: `$${parseFloat(u.staked_balance || 0).toFixed(2)}`,
          deposits: `$${(u.deposits || []).reduce((acc, d) => acc + parseFloat(d.amount || 0), 0).toFixed(2)}`,
          withdrawals: `$${(u.withdrawals || []).reduce((acc, w) => acc + parseFloat(w.amount || 0), 0).toFixed(2)}`,
          transactions: String((u.transactions || []).length),
          stakings: String((u.stakes || []).length),
          emailVerified: u.email_verified,
          twoFaEnabled: false,
          banned: !u.is_active,
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
  const [walletType, setWalletType] = useState('Main Balance');
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
    try {
      const res = await api.put(`/admin/users/${userId}`, { password: newLoginPass });
      if (res.data && res.data.success) {
        toast.success(`Login password for @${userData.username} has been reset successfully!`);
        setResetLoginModalOpen(false);
        setNewLoginPass('');
        setConfirmLoginPass('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
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

  const handleOpenBalanceModal = (actionType) => {
    setBalanceAction(actionType);
    setWalletType('Main Balance');
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
        if (res.data.user) {
          setUserData((prev) => ({
            ...prev,
            mainBalance: `$${parseFloat(res.data.user.balance || 0).toFixed(2)}`,
            walletBalanceUsdt: `$${parseFloat(res.data.user.staked_balance || 0).toFixed(2)}`,
          }));
        }
        setBalanceModalOpen(false);
        setAmount('');
        setRemark('');
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      const res = await api.put(`/admin/users/${userId}`, {
        full_name: fullName,
        email: userData.email,
        mobile: userData.mobile,
        country: userData.country,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        email_verified: userData.emailVerified,
      });

      if (res.data && res.data.success) {
        toast.success('User details updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user information');
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
            User Detail - {userData.username}
          </h1>

          {/* Login as User Button */}
          <button
            type="button"
            onClick={handleLoginAsUser}
            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-md text-xs font-bold font-sans transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-indigo-600" /> Login as User
          </button>
        </div>

        {/* Top 6 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Main Balance */}
          <Link
            href={`/admin/report/transaction/${userId}`}
            className="bg-[#3b5998] hover:bg-[#324b82] text-white p-5 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Main Balance</div>
              <div className="text-xl font-bold font-righteous mt-1">
                {userData.mainBalance}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 2: Wallet Balance in USDT */}
          <Link
            href={`/admin/report/transaction/${userId}`}
            className="bg-[#0c1c38] hover:bg-[#12274d] text-white p-5 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Wallet Balance in USDT</div>
              <div className="text-xl font-bold font-righteous mt-1">
                {userData.walletBalanceUsdt}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 3: Deposits */}
          <Link
            href={`/admin/deposits?user=${userId}`}
            className="bg-[#10b981] hover:bg-[#0ea5e9] text-white p-5 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Deposits</div>
              <div className="text-xl font-bold font-righteous mt-1">
                {userData.deposits}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 4: Withdrawals */}
          <Link
            href={`/admin/withdrawals?user=${userId}`}
            className="bg-[#00695c] hover:bg-[#00574d] text-white p-5 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Withdrawals</div>
              <div className="text-xl font-bold font-righteous mt-1">
                {userData.withdrawals}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 5: Transactions */}
          <Link
            href={`/admin/report/transaction/${userId}`}
            className="bg-[#6a1b9a] hover:bg-[#5c1688] text-white p-5 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Transactions</div>
              <div className="text-xl font-bold font-righteous mt-1">
                {userData.transactions}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Card 6: Stakings */}
          <Link
            href={`/admin/reports/staking?user=${userId}`}
            className="bg-[#e65100] hover:bg-[#cf4900] text-white p-5 rounded-xl shadow-sm flex items-center justify-between transition-all cursor-pointer"
          >
            <div>
              <div className="text-xs font-medium opacity-90">Stakings</div>
              <div className="text-xl font-bold font-righteous mt-1">
                {userData.stakings}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
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

          {/* Button 5: Logins */}
          <Link
            href={`/admin/report/login/history?search=${userData.username}`}
            className="flex-1 min-w-[120px] whitespace-nowrap bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all text-center shrink-0"
          >
            <List className="w-4 h-4" /> Logins
          </Link>

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
              Information of {userData.firstName} {userData.lastName}
            </h2>
            {/* Last Login & IP Address Security Badge */}
            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3.5 py-1.5 text-xs font-sans">
              <span className="font-semibold text-slate-600">Last Login:</span>
              <span className="font-bold text-slate-800 font-mono">21-Aug-2026 11:32 AM</span>
              <span className="text-indigo-300">|</span>
              <span className="font-semibold text-slate-600">IP:</span>
              <span className="font-bold text-[#5b5bf5] font-mono">102.90.81.60</span>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Row 1: First Name, Last Name, Username */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
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

            {/* Row 2: Email & Mobile Number */}
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
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                  <div className="h-11 bg-slate-100 border-r border-slate-200 px-3.5 text-xs font-bold text-slate-600 flex items-center shrink-0">
                    {userData.dialCode}
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    value={userData.mobile}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.startsWith('0')) val = val.substring(1);
                      setUserData({ ...userData, mobile: val.slice(0, 10) });
                    }}
                    placeholder="e.g. 8158051119"
                    className="w-full h-11 bg-transparent border-0 outline-none px-4 text-xs text-slate-800 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={userData.address}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Row 4: City, State, Zip/Postal, Country (4 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={userData.city}
                  onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={userData.state}
                  onChange={(e) => setUserData({ ...userData, state: e.target.value })}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Zip/Postal
                </label>
                <input
                  type="text"
                  value={userData.zipCode}
                  onChange={(e) => setUserData({ ...userData, zipCode: e.target.value })}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Country Searchable Dropdown */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Country
                </label>

                {/* Dropdown Trigger Box */}
                <div
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans flex items-center justify-between cursor-pointer focus:ring-1 focus:ring-indigo-500 shadow-sm"
                >
                  <span className="font-semibold">{userData.country || 'Select Country'}</span>
                  {countryDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Searchable Dropdown Popover Box (Matching Exact Reference Screenshot) */}
                {countryDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-1 w-full bg-white border border-[#5b5bf5] rounded-xl shadow-2xl z-50 p-2 font-sans space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    {/* Top Search Input Field */}
                    <input
                      type="text"
                      autoFocus
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder=""
                      className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    {/* Scrollable Country List */}
                    <div className="max-h-48 overflow-y-auto no-scrollbar border-t border-slate-100 divide-y divide-slate-100 text-xs">
                      {filteredCountries.length === 0 ? (
                        <div className="p-3 text-center text-slate-400">No country found</div>
                      ) : (
                        filteredCountries.map((c) => (
                          <div
                            key={c.name}
                            onClick={() => handleSelectCountry(c)}
                            className={`px-3 py-2.5 hover:bg-slate-100 cursor-pointer font-medium transition-colors ${
                              userData.country === c.name
                                ? 'bg-slate-100 font-bold text-slate-900'
                                : 'text-slate-700'
                            }`}
                          >
                            {c.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 5: Verification Toggles Grid */}
            <div className="grid grid-cols-1 gap-5 pt-2">
              {/* Email Verification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                  Email Verification
                </label>
                <button
                  type="button"
                  onClick={() => setUserData({ ...userData, emailVerified: !userData.emailVerified })}
                  className={`w-full h-11 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-sm relative flex items-center justify-between px-2 overflow-hidden ${
                    userData.emailVerified ? 'bg-[#22c55e] hover:bg-[#16a34a]' : 'bg-[#ef4444] hover:bg-[#dc2626]'
                  }`}
                >
                  {!userData.emailVerified && (
                    <span className="w-2.5 h-7 rounded bg-[#061127] shadow-inner shrink-0" />
                  )}
                  <span className="flex-1 text-center font-bold text-white tracking-wide">
                    {userData.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                  {userData.emailVerified && (
                    <span className="w-2.5 h-7 rounded bg-[#061127] shadow-inner shrink-0" />
                  )}
                </button>
              </div>
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
                  <input
                    type="password"
                    required
                    value={newLoginPass}
                    onChange={(e) => setNewLoginPass(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 h-11 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    Confirm Login Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmLoginPass}
                    onChange={(e) => setConfirmLoginPass(e.target.value)}
                    placeholder="Confirm new password..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 h-11 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
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
                {/* Customized Wallet Select Dropdown (Limited to 2 Supported Balances) */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    Wallet
                  </label>
                  <button
                    type="button"
                    onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                    className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 flex items-center justify-between text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs transition-all"
                  >
                    <span>
                      {walletType === 'Staked Balance'
                        ? `Staked Balance / Profits Wallet (${userData.walletBalanceUsdt || '$0.00'})`
                        : `Main Balance / Staking Wallet (${userData.mainBalance || '$0.00'})`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${walletDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {walletDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs text-slate-700 font-sans animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setWalletType('Main Balance');
                          setWalletDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          walletType === 'Main Balance'
                            ? 'bg-[#5b5bf5] text-white font-bold'
                            : 'hover:bg-indigo-50 text-slate-700'
                        }`}
                      >
                        <span>Main Balance / Staking Wallet ({userData.mainBalance || '$0.00'})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWalletType('Staked Balance');
                          setWalletDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          walletType === 'Staked Balance'
                            ? 'bg-[#5b5bf5] text-white font-bold'
                            : 'hover:bg-indigo-50 text-slate-700'
                        }`}
                      >
                        <span>Staked Balance / Profits Wallet ({userData.walletBalanceUsdt || '$0.00'})</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Amount Input Group with USDT Badge */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-sans mb-1.5">
                    Amount <span className="text-red-500">*</span>
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
                    <div className="h-11 bg-slate-100 border-l border-slate-200 px-4 text-xs font-bold text-slate-600 flex items-center shrink-0 select-none">
                      USDT
                    </div>
                  </div>
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
                  ⚠️ <strong>Warning:</strong> This will delete all user stakes, transaction history, deposits, withdrawals, and wallet records. This action cannot be undone!
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
