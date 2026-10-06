'use client';

import { useEffect, useState } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import PageLoader from '../../../../components/PageLoader';
import api from '../../../../lib/api';
import {
  Wallet,
  ShieldCheck,
  RotateCcw,
  Save,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Info,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminCompanyWalletsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Default system fallbacks
  const [fallbacks, setFallbacks] = useState({
    bitcoin: {
      name: 'Bitcoin (BTC)',
      currency: 'bitcoin',
      symbol: 'BTC',
      network: 'Bitcoin Mainnet',
      address: 'bc1qwz6fqarhsuhgllxnqz3ekq8krdfgctkl6r5utk',
    },
    usdt_trc20: {
      name: 'USDT (TRC20)',
      currency: 'usdt_trc20',
      symbol: 'USDT',
      network: 'Tron (TRC-20)',
      address: 'TQsUzgqcBhJe47Tx8fCzEi9GJJUpfpYyio',
    },
    usdt_bep20: {
      name: 'USDT (BEP20)',
      currency: 'usdt_bep20',
      symbol: 'USDT',
      network: 'BNB Smart Chain (BEP-20)',
      address: '0x003848D153e45DDdd24d498B921A888a5567C9c3',
    },
    litecoin: {
      name: 'Litecoin (LTC)',
      currency: 'litecoin',
      symbol: 'LTC',
      network: 'Litecoin Mainnet',
      address: 'ltc1qzhnnvz4gqe7ejhkxgw4jcys28wj6ru2ce79tan',
    },
  });

  // Current form inputs
  const [wallets, setWallets] = useState({
    bitcoin: '',
    usdt_trc20: '',
    usdt_bep20: '',
    litecoin: '',
  });

  // Is custom state tracking
  const [customStates, setCustomStates] = useState({
    bitcoin: false,
    usdt_trc20: false,
    usdt_bep20: false,
    litecoin: false,
  });

  // Fetch wallets on mount
  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/company-wallets');
      if (res.data?.success && res.data?.wallets) {
        const w = res.data.wallets;
        setWallets({
          bitcoin: w.bitcoin?.address || '',
          usdt_trc20: w.usdt_trc20?.address || '',
          usdt_bep20: w.usdt_bep20?.address || '',
          litecoin: w.litecoin?.address || '',
        });
        setCustomStates({
          bitcoin: Boolean(w.bitcoin?.isCustom),
          usdt_trc20: Boolean(w.usdt_trc20?.isCustom),
          usdt_bep20: Boolean(w.usdt_bep20?.isCustom),
          litecoin: Boolean(w.litecoin?.isCustom),
        });
        if (res.data.fallbacks) {
          setFallbacks(res.data.fallbacks);
        }
      }
    } catch (err) {
      console.error('Failed to load company wallets:', err);
      toast.error('Failed to load company wallets from server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setWallets((prev) => ({ ...prev, [key]: value }));
  };

  const handleRestoreFallback = (key) => {
    const fbAddress = fallbacks[key]?.address || '';
    setWallets((prev) => ({ ...prev, [key]: fbAddress }));
    toast.info(`Restored default fallback address for ${fallbacks[key]?.name || key}`);
  };

  const handleResetAll = async () => {
    if (!window.confirm('Are you sure you want to reset all 4 manual deposit wallets back to their system default fallbacks?')) {
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/admin/company-wallets/reset', {});
      if (res.data?.success) {
        toast.success(res.data.message || 'All company deposit addresses reset to system defaults!');
        await fetchWallets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset wallets');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/company-wallets', { wallets });
      if (res.data?.success) {
        toast.success(res.data.message || 'Company deposit addresses saved successfully!');
        if (res.data.wallets) {
          const w = res.data.wallets;
          setWallets({
            bitcoin: w.bitcoin?.address || '',
            usdt_trc20: w.usdt_trc20?.address || '',
            usdt_bep20: w.usdt_bep20?.address || '',
            litecoin: w.litecoin?.address || '',
          });
          setCustomStates({
            bitcoin: Boolean(w.bitcoin?.isCustom),
            usdt_trc20: Boolean(w.usdt_trc20?.isCustom),
            usdt_bep20: Boolean(w.usdt_bep20?.isCustom),
            litecoin: Boolean(w.litecoin?.isCustom),
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save company wallets');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Address copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return <PageLoader />;
  }

  const walletMetaList = [
    {
      key: 'bitcoin',
      name: 'Bitcoin (BTC)',
      symbol: 'BTC',
      badgeSymbol: '₿',
      network: 'Bitcoin Mainnet',
      badgeColor: 'bg-[#f7931a] text-white',
      borderFocus: 'focus:border-[#f7931a]',
      placeholder: 'bc1q...',
      note: 'Used for direct Bitcoin manual deposits',
    },
    {
      key: 'usdt_trc20',
      name: 'USDT (TRC-20)',
      symbol: 'USDT',
      badgeSymbol: '₮',
      network: 'Tron Network (TRC-20)',
      badgeColor: 'bg-[#26a17b] text-white',
      borderFocus: 'focus:border-[#26a17b]',
      placeholder: 'T...',
      note: 'Used for TRC-20 manual deposits (Tron Network)',
    },
    {
      key: 'usdt_bep20',
      name: 'USDT (BEP-20)',
      symbol: 'USDT',
      badgeSymbol: '₮',
      network: 'BNB Smart Chain (BEP-20)',
      badgeColor: 'bg-[#f3ba2f] text-slate-900',
      borderFocus: 'focus:border-[#f3ba2f]',
      placeholder: '0x...',
      note: 'Used for BEP-20 manual deposits (BNB Smart Chain)',
    },
    {
      key: 'litecoin',
      name: 'Litecoin (LTC)',
      symbol: 'LTC',
      badgeSymbol: 'Ł',
      network: 'Litecoin Mainnet',
      badgeColor: 'bg-[#345d9d] text-white',
      borderFocus: 'focus:border-[#345d9d]',
      placeholder: 'ltc1q... or L...',
      note: 'Used for direct Litecoin manual deposits',
    },
  ];

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
              <span>Settings</span>
              <span>/</span>
              <span className="text-indigo-600 font-semibold">Company Deposit Wallets</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-sans tracking-tight flex items-center gap-2.5">
              <Wallet className="w-6 h-6 text-indigo-600" />
              Company Deposit Wallets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure static crypto receiving addresses shown to users for manual deposits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetAll}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset All to Defaults
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Protection Information Banner */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/80 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-800 text-sm">
              Automatic Zero-Downtime Fallback Protection Active
            </p>
            <p>
              You can set your own custom receiving address for any supported cryptocurrency below. If any address field is left empty or removed, the platform automatically protects your transactions by falling back to the verified default company address. Users will never see a blank or broken wallet.
            </p>
          </div>
        </div>

        {/* Wallets Form Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {walletMetaList.map((meta) => {
              const currentVal = wallets[meta.key] || '';
              const fallbackVal = fallbacks[meta.key]?.address || '';
              const isCustom = currentVal.trim() !== '' && currentVal.trim() !== fallbackVal;
              const isUsingFallback = !currentVal.trim() || currentVal.trim() === fallbackVal;

              return (
                <div
                  key={meta.key}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base shadow-sm ${meta.badgeColor}`}>
                        {meta.badgeSymbol}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-800 font-sans">
                          {meta.name}
                        </h2>
                        <span className="text-[11px] font-medium text-slate-500">
                          {meta.network}
                        </span>
                      </div>
                    </div>

                    {/* Active Status Badge */}
                    <div>
                      {isCustom ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Custom Address Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          Default Fallback Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Active Receiving Address Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Receiving Wallet Address
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {meta.symbol}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => handleInputChange(meta.key, e.target.value)}
                          placeholder={meta.placeholder}
                          className={`w-full h-11 bg-white border border-slate-200 rounded-lg pl-3.5 pr-20 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${meta.borderFocus} transition-all`}
                        />
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(currentVal || fallbackVal, meta.key)}
                            title="Copy address"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors"
                          >
                            {copiedKey === meta.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {meta.note}
                      </p>
                    </div>

                    {/* Default Fallback Address Display Box */}
                    <div className="bg-slate-50 rounded-lg border border-slate-200/70 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                          Permanent System Fallback:
                        </span>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRestoreFallback(meta.key)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore Default
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-600 break-all select-all bg-white px-2.5 py-1.5 rounded border border-slate-200/80">
                        {fallbackVal}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Network: <strong className="text-slate-700">{meta.network}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRestoreFallback(meta.key)}
                      className="text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                    >
                      Use Fallback
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Save Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>
                Changes take effect immediately on the user deposit screen upon saving.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetAll}
                disabled={saving}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
              >
                Reset All to Defaults
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminSidebarLayout>
  );
}
