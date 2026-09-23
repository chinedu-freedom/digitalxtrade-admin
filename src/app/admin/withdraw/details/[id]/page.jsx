'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../../components/AdminSidebarLayout';
import { Check, X, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../../lib/api';

export default function AdminWithdrawDetailsPage() {
  const routeParams = useParams();
  const withdrawId = routeParams?.id;

  const [withdrawData, setWithdrawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchDetail = async () => {
    if (!withdrawId) return;
    try {
      setLoading(true);
      const res = await api.get('/admin/withdrawals');
      if (res.data && res.data.success && res.data.withdrawals) {
        const found = res.data.withdrawals.find(
          (w) => String(w.id) === String(withdrawId) || w.id.substring(0, 10).toUpperCase() === String(withdrawId).toUpperCase()
        );
        if (found) {
          const numAmt = parseFloat(found.amount || 0);
          const numCharge = parseFloat(found.charge || 0);
          const numNet = parseFloat(found.net_amount || numAmt - numCharge);
          setWithdrawData({
            id: found.id,
            name: found.user?.full_name || found.user?.username || 'User',
            username: found.user?.username ? `@${found.user.username}` : found.user?.email || '',
            method: found.currency || 'USDT (TRC20)',
            walletAddress: found.wallet_address || 'N/A',
            trxId: found.id,
            date: found.created_at ? new Date(found.created_at).toLocaleString('en-US', { hour12: true }) : 'Recently',
            amount: `$${numAmt.toFixed(2)}`,
            charge: `$${numCharge.toFixed(2)}`,
            payable: `$${numNet.toFixed(2)}`,
            status: found.status ? found.status.charAt(0) + found.status.slice(1).toLowerCase() : 'Pending',
            rawStatus: found.status,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [withdrawId]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      const res = await api.post(`/admin/withdrawals/${withdrawId}/approve`);
      if (res.data && res.data.success) {
        toast.success(`Withdrawal approved successfully!`);
        setWithdrawData((prev) => (prev ? { ...prev, status: 'Approved', rawStatus: 'APPROVED' } : null));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      const res = await api.post(`/admin/withdrawals/${withdrawId}/reject`, { reason: 'Admin Rejected' });
      if (res.data && res.data.success) {
        toast.error(`Withdrawal rejected and refunded.`);
        setWithdrawData((prev) => (prev ? { ...prev, status: 'Rejected', rawStatus: 'REJECTED' } : null));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyWallet = (address) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success('Wallet address copied to clipboard!');
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            Withdrawal Details (#{withdrawId ? withdrawId.substring(0, 8) : ''})
          </h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
            <span>Loading withdrawal details</span>
            <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
          </div>
        ) : !withdrawData ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 font-semibold">
            Withdrawal record not found.
          </div>
        ) : (
          /* Structured Horizontal Info Card */
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
              {/* Column 1: User Information */}
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 font-medium">Name: </span>
                  <span className="font-bold text-slate-800">{withdrawData.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Username: </span>
                  <div className="font-medium text-slate-700 break-all">{withdrawData.username}</div>
                </div>
              </div>

              {/* Column 2: Method, Wallet & Transaction */}
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 font-medium">Method: </span>
                  <span className="font-bold text-slate-800">{withdrawData.method}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Wallet Address: </span>
                  <span className="font-mono font-bold text-slate-900 break-all ml-1">
                    {withdrawData.walletAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyWallet(withdrawData.walletAddress)}
                    className="inline-flex items-center ml-2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer align-middle"
                    title="Copy Wallet Address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Transaction ID: </span>
                  <span className="font-mono font-bold text-slate-900 break-all">{withdrawData.trxId}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Date: </span>
                  <span className="text-slate-700 font-medium">{withdrawData.date}</span>
                </div>
              </div>

              {/* Column 3: Amount, Charge & Payable */}
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 font-medium">Amount: </span>
                  <span className="font-bold text-slate-800 font-righteous">{withdrawData.amount}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Charge: </span>
                  <span className="font-bold text-red-500 font-righteous">{withdrawData.charge}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Payable: </span>
                  <span className="font-bold text-slate-900 font-righteous text-sm">{withdrawData.payable}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons if Pending */}
            {(withdrawData.rawStatus === 'PENDING' || withdrawData.status === 'Pending') && (
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={processing}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}

