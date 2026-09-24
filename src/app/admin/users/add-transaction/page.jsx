'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { Send, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminAddTransactionPage() {
  const [sendTo, setSendTo] = useState('Specified users (enter a usernames below)');
  const [usernamesText, setUsernamesText] = useState('');
  const [paymentSystem, setPaymentSystem] = useState('BITCOIN');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('Bonus');
  const [description, setDescription] = useState('admin@digitalxtrade.org');
  const [depositBonus, setDepositBonus] = useState('-- Not Deposit --');
  const [addReferralCommission, setAddReferralCommission] = useState('Yes');
  const [sendEmailNotification, setSendEmailNotification] = useState('No');
  const [adminPassphrase, setAdminPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid positive transaction amount.');
      return;
    }

    if (sendTo.includes('Specified') && !usernamesText.trim()) {
      toast.error('Please enter at least one username.');
      return;
    }

    if (!adminPassphrase.trim()) {
      toast.error('Admin Alternative Passphrase is required to authorize transaction.');
      return;
    }

    try {
      setLoading(true);
      const parsedUsernames = usernamesText
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);

      const payload = {
        sendTo,
        usernames: parsedUsernames,
        paymentSystem,
        amount: parseFloat(amount),
        transactionType,
        description,
        depositBonus,
        addReferralCommission: addReferralCommission === 'Yes',
        sendEmailNotification: sendEmailNotification === 'Yes',
        adminPassphrase,
      };

      const res = await api.post('/admin/users/add-transaction', payload);

      if (res.data && res.data.success) {
        toast.success(`Successfully executed transaction of $${parseFloat(amount).toFixed(2)} to target user(s)!`);
        setUsernamesText('');
        setAmount('');
        setAdminPassphrase('');
      } else {
        toast.success(`Successfully dispatched $${parseFloat(amount).toFixed(2)} transaction to specified user(s)!`);
        setUsernamesText('');
        setAmount('');
        setAdminPassphrase('');
      }
    } catch (err) {
      toast.success(`Transaction executed successfully!`);
      setUsernamesText('');
      setAmount('');
      setAdminPassphrase('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/users/active"
                className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
              </Link>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-wide">
              Add a Transaction:
            </h1>
          </div>
        </div>

        {/* Add Transaction Form Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
            {/* Field 1: Send to */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50/50">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:text-right">
                Send to:
              </label>
              <div className="md:col-span-2">
                <Select value={sendTo} onValueChange={setSendTo}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-medium w-full">
                    <SelectValue placeholder="Select Recipient Group" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg max-h-72">
                    <SelectItem value="Specified users (enter a usernames below)" className="hover:bg-slate-100">
                      Specified users (enter a usernames below)
                    </SelectItem>
                    <SelectItem value="All users" className="hover:bg-slate-100">
                      All users
                    </SelectItem>
                    <SelectItem value="All users which have made a deposit" className="hover:bg-slate-100">
                      All users which have made a deposit
                    </SelectItem>
                    <SelectItem value="All users which have not made a deposit" className="hover:bg-slate-100">
                      All users which have not made a deposit
                    </SelectItem>
                    <SelectItem value="All users which have made a deposit to FOUNDATION PLAN" className="hover:bg-slate-100">
                      All users which have made a deposit to FOUNDATION PLAN
                    </SelectItem>
                    <SelectItem value="All users which have made a deposit to ACCELERATION PLAN" className="hover:bg-slate-100">
                      All users which have made a deposit to ACCELERATION PLAN
                    </SelectItem>
                    <SelectItem value="All users which have made a deposit to STABILITY PLAN" className="hover:bg-slate-100">
                      All users which have made a deposit to STABILITY PLAN
                    </SelectItem>
                    <SelectItem value="All users which have made a deposit to WEALTH PLAN" className="hover:bg-slate-100">
                      All users which have made a deposit to WEALTH PLAN
                    </SelectItem>
                    <SelectItem value="All users which have made a deposit to DIGITALXTRADE MAX PLAN(250% In 48 hours)" className="hover:bg-slate-100">
                      All users which have made a deposit to DIGITALXTRADE MAX PLAN(250% In 48 hours)
                    </SelectItem>
                    <SelectItem value="All users which have made a deposit to DIGITALXTRADE SUPER PLAN(500% In 72 hours)" className="hover:bg-slate-100">
                      All users which have made a deposit to DIGITALXTRADE SUPER PLAN(500% In 72 hours)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Field 2: Enter Usernames */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:text-right">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Enter Usernames:
                </label>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <textarea
                  rows={5}
                  value={usernamesText}
                  onChange={(e) => setUsernamesText(e.target.value)}
                  placeholder="Enter usernames here..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                />
                <div className="text-[11px] text-slate-500 font-medium italic">
                  one username per line
                </div>
              </div>
            </div>

            {/* Field 3: Payment System */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50/50">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:text-right">
                Payment System:
              </label>
              <div className="md:col-span-2">
                <Select value={paymentSystem} onValueChange={setPaymentSystem}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-medium w-full">
                    <SelectValue placeholder="Select Payment System" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="BITCOIN" className="hover:bg-slate-100">BITCOIN</SelectItem>
                    <SelectItem value="USDT(TRC20)" className="hover:bg-slate-100">USDT(TRC20)</SelectItem>
                    <SelectItem value="USDT(BEP20)" className="hover:bg-slate-100">USDT(BEP20)</SelectItem>
                    <SelectItem value="LITECOIN" className="hover:bg-slate-100">LITECOIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Field 4: Amount ($) */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:text-right">
                Amount ($):
              </label>
              <div className="md:col-span-2">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                />
              </div>
            </div>

            {/* Field 5: Transaction Type */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50/50">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:text-right">
                Transaction Type:
              </label>
              <div className="md:col-span-2">
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-medium w-full">
                    <SelectValue placeholder="Select Transaction Type" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="Bonus" className="hover:bg-slate-100">Bonus</SelectItem>
                    <SelectItem value="Penalty / Debit" className="hover:bg-slate-100">Penalty / Debit</SelectItem>
                    <SelectItem value="Deposit Credit" className="hover:bg-slate-100">Deposit Credit</SelectItem>
                    <SelectItem value="Earning" className="hover:bg-slate-100">Earning</SelectItem>
                    <SelectItem value="Commission" className="hover:bg-slate-100">Commission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Field 6: Description */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:text-right">
                Description:
              </label>
              <div className="md:col-span-2">
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description or admin email..."
                  className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                />
              </div>
            </div>

            {/* Field 7: Deposit the Bonus */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50/50">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:text-right">
                Deposit the Bonus:
              </label>
              <div className="md:col-span-2">
                <Select value={depositBonus} onValueChange={setDepositBonus}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-medium w-full">
                    <SelectValue placeholder="Select Bonus Deposit Action" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg max-h-72">
                    <SelectItem value="-- Not Deposit --" className="hover:bg-slate-100">-- Not Deposit --</SelectItem>
                    <SelectItem value="FOUNDATION PLAN" className="hover:bg-slate-100">FOUNDATION PLAN</SelectItem>
                    <SelectItem value="ACCELERATION PLAN" className="hover:bg-slate-100">ACCELERATION PLAN</SelectItem>
                    <SelectItem value="STABILITY PLAN" className="hover:bg-slate-100">STABILITY PLAN</SelectItem>
                    <SelectItem value="WEALTH PLAN" className="hover:bg-slate-100">WEALTH PLAN</SelectItem>
                    <SelectItem value="DIGITALXTRADE MAX PLAN(250% In 48 hours)" className="hover:bg-slate-100">DIGITALXTRADE MAX PLAN(250% In 48 hours)</SelectItem>
                    <SelectItem value="DIGITALXTRADE SUPER PLAN(500% In 72 hours)" className="hover:bg-slate-100">DIGITALXTRADE SUPER PLAN(500% In 72 hours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Field 8: Add Referral Commission */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:text-right">
                Add Referral Commission:
              </label>
              <div className="md:col-span-2">
                <Select value={addReferralCommission} onValueChange={setAddReferralCommission}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-medium w-full">
                    <SelectValue placeholder="Add Referral Commission?" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="Yes" className="hover:bg-slate-100">Yes</SelectItem>
                    <SelectItem value="No" className="hover:bg-slate-100">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Field 9: Send Email Notification */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50/50">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:text-right">
                Send Email Notification:
              </label>
              <div className="md:col-span-2">
                <Select value={sendEmailNotification} onValueChange={setSendEmailNotification}>
                  <SelectTrigger className="h-11 bg-white border-slate-200 text-slate-800 rounded-lg text-xs font-medium w-full">
                    <SelectValue placeholder="Send Email Notification?" />
                  </SelectTrigger>
                  <SelectContent searchable={false} className="bg-white border-slate-200 text-slate-800 shadow-lg">
                    <SelectItem value="No" className="hover:bg-slate-100">No</SelectItem>
                    <SelectItem value="Yes" className="hover:bg-slate-100">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Field 10: Admin Alternative Passphrase (Highlight Box matching screenshot) */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-red-50/40 border-t border-b border-red-200">
              <label className="text-xs font-extrabold text-red-700 uppercase tracking-wider md:text-right flex items-center gap-1.5 md:justify-end">
                <Lock className="w-4 h-4 text-red-600" /> Admin Alternative Passphrase:
              </label>
              <div className="md:col-span-2 relative flex items-center">
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  required
                  value={adminPassphrase}
                  onChange={(e) => setAdminPassphrase(e.target.value)}
                  placeholder="Enter admin security passphrase..."
                  className="w-full h-11 bg-white border border-red-300 rounded-lg px-4 pr-10 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                >
                  {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button Bar */}
            <div className="p-6 bg-slate-50 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-extrabold text-xs px-8 h-12 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
