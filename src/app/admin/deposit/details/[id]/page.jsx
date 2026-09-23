'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../../components/AdminSidebarLayout';
import { Check, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDepositDetailsPage() {
  const routeParams = useParams();
  const depositId = routeParams?.id || '48';

  const [depositData, setDepositData] = useState({
    name: 'rosa Nyakatangure',
    email: 'rosanyakatangure@gmail.com',
    refId: 'EC22DE',
    paymentNumber: 'bb5cac42-0ddd-41e4-a557-6a0f8ed779c3',
    trxId: 'bb5cac42-0ddd-41e4-a557-6a0f8ed779c3',
    date: '21-08-2026 09:33:51',
    paymentAmount: '$30.00',
    finalAmount: '$30.00',
    status: 'APPROVED',
    methodName: 'USDT (TRC20)',
  });

  const handleApprove = () => {
    setDepositData((prev) => ({ ...prev, status: 'APPROVED' }));
    toast.success(`Deposit of ${depositData.paymentAmount} approved successfully!`);
  };

  const handleReject = () => {
    setDepositData((prev) => ({ ...prev, status: 'REJECTED' }));
    toast.error(`Deposit of ${depositData.paymentAmount} rejected.`);
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            Deposit Details (#{depositId})
          </h1>
        </div>

        {/* Structured Horizontal Info Card (Matching Reference Screenshot 1) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-sans">
            {/* Column 1: User Details */}
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 font-medium">Name: </span>
                <span className="font-bold text-slate-800">{depositData.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Username: </span>
                <div className="font-medium text-slate-700 break-all">{depositData.email}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Ref_id: </span>
                <span className="font-mono font-bold text-slate-800">{depositData.refId}</span>
              </div>
            </div>

            {/* Column 2: Payment & Transaction Details */}
            <div className="space-y-2">
              <div>
                <div className="text-slate-500 font-medium">Payment Number:</div>
                <div className="font-mono font-bold text-slate-900 break-all">{depositData.paymentNumber}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Transaction ID: </span>
                <span className="font-mono font-bold text-slate-900 break-all">{depositData.trxId}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Date : </span>
                <span className="text-slate-700 font-medium">{depositData.date}</span>
              </div>
            </div>

            {/* Column 3: Amounts */}
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 font-medium">Payment Amount: </span>
                <span className="font-bold text-slate-800">{depositData.paymentAmount}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Final Amount: </span>
                <span className="font-bold text-slate-900">{depositData.finalAmount}</span>
              </div>
            </div>

            {/* Column 4: Status & Method */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Status: </span>
                <span
                  className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                    depositData.status === 'APPROVED'
                      ? 'bg-blue-600 text-white'
                      : depositData.status === 'PENDING'
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {depositData.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Method Name: </span>
                <span className="font-bold text-slate-800">{depositData.methodName}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons if Pending */}
          {depositData.status === 'PENDING' && (
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
