'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../../components/AdminSidebarLayout';
import PageLoader from '../../../../../components/PageLoader';
import { Check, X, Copy, Loader2, Undo2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../../lib/api';

export default function AdminDepositDetailsPage() {
  const routeParams = useParams();
  const depositId = routeParams?.id;

  const [depositData, setDepositData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchDepositDetails = async () => {
    if (!depositId) return;
    try {
      setLoading(true);
      let res;
      try {
        res = await api.get(`/admin/deposits/${depositId}`);
      } catch (e1) {
        try {
          res = await api.get(`/deposits/${depositId}`);
        } catch (e2) {
          res = await api.get('/admin/deposits');
        }
      }

      const rawData = res.data?.deposit || res.data?.data || res.data;
      let target = null;
      if (Array.isArray(rawData)) {
        target = rawData.find(d => String(d.id || d._id) === String(depositId));
      } else if (rawData && typeof rawData === 'object') {
        target = rawData;
      }

      if (target) {
        const amt = parseFloat(target.amount || 0);
        const chg = parseFloat(target.charge || target.fee || target.gateway_charge || 0);
        const net = parseFloat(target.final_amount || target.after_charge || (amt - chg) || amt);

        const rawDate = target.created_at || target.createdAt || target.date || target.updated_at || target.updatedAt;
        let formattedDate = 'N/A';
        if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
              ' ' +
              d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
          } else {
            formattedDate = String(rawDate);
          }
        }
        const rawPlan = target.plan || target.plan_title || target.plan_name || target.package_name || target.packageTitle || target.planTitle || target.stakingPlan?.title || target.investmentPlan?.name || target.investmentPlan?.title;
        const parsedPlan = (rawPlan && rawPlan !== 'N/A' && String(rawPlan).trim() !== '') ? String(rawPlan) : 'Direct Wallet Balance Top-up';

        const rawRef = target.user?.ref_id || target.user?.referrer_id || target.user?.referred_by || target.user?.referral_code || target.ref_id || target.referrer_id || target.referred_by || target.user?.ref_code;
        const parsedRef = (rawRef && rawRef !== 'N/A' && String(rawRef).trim() !== '') ? String(rawRef) : 'None (Direct Registration)';

        const rawWallet = target.wallet_address || target.address || target.to_address || target.user_wallet || target.gateway?.address || target.gateway_address || target.deposit_address || target.crypto_address || target.pay_address || target.destination_address;
        const parsedWallet = (rawWallet && rawWallet !== 'N/A' && String(rawWallet).trim() !== '') ? String(rawWallet) : 'System Default Gateway Wallet';

        setDepositData({
          id: target.id || target._id || depositId,
          name: target.user?.full_name || target.user?.name || target.full_name || target.name || 'N/A',
          username: target.user?.username || target.username || 'N/A',
          email: target.user?.email || target.email || 'N/A',
          userId: target.user?.id || target.user_id || target.userId || 'N/A',
          refId: parsedRef,
          plan: parsedPlan,
          paymentNumber: target.payment_number || target.trx || target.transaction_id || target.id || 'N/A',
          trxId: target.trx || target.transaction_id || target.tx_hash || target.txHash || target.hash || target.id || 'N/A',
          date: formattedDate,
          paymentAmount: `$${amt.toFixed(2)}`,
          charge: `$${chg.toFixed(2)}`,
          finalAmount: `$${net.toFixed(2)}`,
          status: String(target.status || 'PENDING').toUpperCase(),
          methodName: target.gateway_code || target.payment_method || target.currency || target.method_name || 'BITCOIN',
          walletAddress: parsedWallet,
          proofImg: target.proof_file || target.proof || target.image || target.attachment || target.payment_proof || null,
          remarks: target.remarks || target.note || target.user_note || target.description || 'N/A',
          rawAmount: amt
        });
      } else {
        setDepositData(null);
      }
    } catch (err) {
      console.error('Failed to fetch deposit details:', err);
      toast.error('Failed to load deposit details');
      setDepositData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositDetails();
  }, [depositId]);

  const handleApprove = async () => {
    if (!depositId) return;
    try {
      setProcessing(true);
      try {
        await api.post(`/admin/deposits/${depositId}/approve`);
      } catch (e1) {
        try {
          await api.put(`/admin/deposits/${depositId}`, { status: 'APPROVED' });
        } catch (e2) {
          await api.post(`/deposits/${depositId}/approve`);
        }
      }

      setDepositData((prev) => (prev ? { ...prev, status: 'APPROVED' } : prev));
      toast.success(`Deposit of ${depositData?.paymentAmount || 'funds'} approved successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve deposit');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!depositId) return;
    try {
      setProcessing(true);
      try {
        await api.post(`/admin/deposits/${depositId}/reject`);
      } catch (e1) {
        try {
          await api.put(`/admin/deposits/${depositId}`, { status: 'REJECTED' });
        } catch (e2) {
          await api.post(`/deposits/${depositId}/reject`);
        }
      }

      setDepositData((prev) => (prev ? { ...prev, status: 'REJECTED' } : prev));
      toast.error(`Deposit of ${depositData?.paymentAmount || 'funds'} rejected.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject deposit');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyText = (text, label) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-wide">
              Deposit Details
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {depositId}
            </p>
          </div>

          <Link
            href="/admin/deposits/pending"
            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Undo2 className="w-4 h-4 text-indigo-600" /> Back to Deposits
          </Link>
        </div>

        {/* Structured Info Container */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
              <span>Loading deposit details...</span>
              <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
            </div>
          ) : !depositData ? (
            <div className="py-12 text-center text-slate-400 font-medium">
              Deposit request record not found.
            </div>
          ) : (
            <>
              {/* Top Summary Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    ${depositData.rawAmount?.toFixed(0) || '0'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase">
                      {depositData.plan !== 'N/A' ? depositData.plan : 'Direct Gateway Deposit'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Method: <span className="font-bold text-slate-700">{depositData.methodName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                      depositData.status === 'APPROVED' || depositData.status === 'SUCCESS' || depositData.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : depositData.status === 'PENDING' || depositData.status === 'INITIATED'
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {depositData.status}
                  </span>
                </div>
              </div>

              {/* Detailed 4-Column Grid with Individual Distinct Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                {/* Section 1: User Account Details */}
                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase text-[11px] tracking-wider">
                    User Information
                  </h3>
                  
                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Full Name</div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">{depositData.name}</div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Username</div>
                    <div className="font-bold text-indigo-600 mt-0.5 flex items-center gap-1.5">
                      <span>{depositData.username}</span>
                      {depositData.username !== 'N/A' && (
                        <button onClick={() => handleCopyText(depositData.username, 'Username')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Email Address</div>
                    <div className="font-medium text-slate-800 break-all mt-0.5 flex items-center gap-1.5">
                      <span>{depositData.email}</span>
                      {depositData.email !== 'N/A' && (
                        <button onClick={() => handleCopyText(depositData.email, 'Email')} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">User ID</div>
                    <div className="font-mono font-semibold text-slate-700 mt-0.5 break-all">{depositData.userId}</div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Referrer ID / Code</div>
                    <div className="font-mono text-slate-600 mt-0.5">{depositData.refId}</div>
                  </div>
                </div>

                {/* Section 2: Deposit & Transaction Identifiers */}
                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase text-[11px] tracking-wider">
                    Transaction Identifiers
                  </h3>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Target Plan</div>
                    <div className="font-bold text-slate-900 uppercase mt-0.5">{depositData.plan}</div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Payment Number / ID</div>
                    <div className="font-mono font-bold text-slate-800 break-all mt-0.5 flex items-center gap-1.5">
                      <span className="truncate">{depositData.paymentNumber}</span>
                      {depositData.paymentNumber !== 'N/A' && (
                        <button onClick={() => handleCopyText(depositData.paymentNumber, 'Payment Number')} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Transaction Hash / TRX ID</div>
                    <div className="font-mono font-bold text-slate-900 break-all mt-0.5 flex items-center gap-1.5">
                      <span className="truncate">{depositData.trxId}</span>
                      {depositData.trxId !== 'N/A' && (
                        <button onClick={() => handleCopyText(depositData.trxId, 'Transaction ID')} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Date & Time Created</div>
                    <div className="font-bold text-slate-800 mt-0.5">{depositData.date}</div>
                  </div>
                </div>

                {/* Section 3: Financial Breakdown */}
                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase text-[11px] tracking-wider">
                    Financial Breakdown
                  </h3>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Payment Amount</div>
                    <div className="font-extrabold font-righteous text-slate-900 text-base mt-0.5">{depositData.paymentAmount}</div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Final Credited Amount</div>
                    <div className="font-extrabold font-righteous text-emerald-600 text-base mt-0.5">{depositData.finalAmount}</div>
                  </div>
                </div>

                {/* Section 4: Gateway Method & Destination */}
                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase text-[11px] tracking-wider">
                    Gateway & Destination
                  </h3>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Payment Method Name</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">{depositData.methodName}</div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Destination Wallet Address</div>
                    <div className="font-mono text-slate-800 text-[11px] break-all mt-0.5 bg-white p-2 rounded border border-slate-200 flex items-center justify-between gap-1">
                      <span className="truncate">{depositData.walletAddress}</span>
                      {depositData.walletAddress !== 'N/A' && (
                        <button onClick={() => handleCopyText(depositData.walletAddress, 'Wallet Address')} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {depositData.remarks !== 'N/A' && (
                    <div>
                      <div className="text-slate-500 text-[11px] font-medium">User Remarks / Note</div>
                      <div className="text-slate-700 font-medium italic mt-0.5">{depositData.remarks}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar if Pending or Initiated */}
              {(depositData.status === 'PENDING' || depositData.status === 'INITIATED') && (
                <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleApprove}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check className="w-5 h-5" />} Approve Deposit
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleReject}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <X className="w-5 h-5" />} Reject Deposit
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
