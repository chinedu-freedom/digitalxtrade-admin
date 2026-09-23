'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Globe, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

const PARTNER_LOGOS = {
  binance: (
    <svg className="w-10 h-10 shrink-0" viewBox="0 0 24 24" fill="#F0B90B">
      <path d="M12 2L6.5 7.5L9.3 10.3L12 7.6L14.7 10.3L17.5 7.5L12 2ZM2 12L7.5 6.5L10.3 9.3L7.6 12L10.3 14.7L7.5 17.5L2 12ZM12 22L17.5 16.5L14.7 13.7L12 16.4L9.3 13.7L6.5 16.5L12 22ZM22 12L16.5 17.5L13.7 14.7L16.4 12L13.7 9.3L16.5 6.5L22 12ZM12 10.1L13.9 12L12 13.9L10.1 12L12 10.1Z" />
    </svg>
  ),
  bybit: (
    <svg className="w-12 h-12 shrink-0" viewBox="0 0 80 80" fill="none">
      <rect width="80" height="80" rx="16" fill="#0A0B0E" />
      <text x="8" y="47" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="18" letterSpacing="0.5">BYB</text>
      <rect x="52" y="30" width="4.5" height="19" rx="1" fill="#F7A600" />
      <text x="59" y="47" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="18" letterSpacing="0.5">T</text>
    </svg>
  ),
  mexc: (
    <svg className="w-14 h-14 shrink-0" viewBox="0 0 120 50" fill="none">
      <rect width="120" height="50" rx="10" fill="#FFFFFF" />
      <path d="M12 34L22 16C23 14 25 14 26 16L31 25" stroke="#0052FF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 34L32 16C33 14 35 14 36 16L46 34" stroke="#0052FF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="50" y="32" fill="#000000" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16" letterSpacing="0.5">MEXC</text>
    </svg>
  ),
  htx: (
    <svg className="w-14 h-14 shrink-0" viewBox="0 0 120 50" fill="none">
      <rect width="120" height="50" rx="10" fill="#FFFFFF" />
      <path d="M20 34C17 31 16 26 18 21C19 23 21 24 23 23C25 22 26 18 24 15C29 18 31 24 29 29C28 32 25 35 20 34Z" fill="#002B49" />
      <path d="M22 32C20 30 20 27 21 24C22 26 23 26 24 25C25 28 24 31 22 32Z" fill="#00A3E0" />
      <text x="36" y="33" fill="#00162B" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="18" letterSpacing="0.5">HTX</text>
    </svg>
  ),
  okx: (
    <svg className="w-14 h-14 shrink-0" viewBox="0 0 120 50" fill="none">
      <rect width="120" height="50" rx="10" fill="#000000" />
      <rect x="14" y="14" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="28" y="14" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="21" y="21" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="14" y="28" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="28" y="28" width="7" height="7" rx="1" fill="#FFFFFF" />
      <text x="44" y="32" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="18" letterSpacing="1">OKX</text>
    </svg>
  ),
  bingx: (
    <svg className="w-14 h-14 shrink-0" viewBox="0 0 120 50" fill="none">
      <rect width="120" height="50" rx="10" fill="#0052FF" />
      <text x="14" y="33" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="22" letterSpacing="-0.5">Bingx</text>
    </svg>
  ),
  kraken: (
    <svg className="w-14 h-14 shrink-0" viewBox="0 0 120 50" fill="none">
      <rect width="120" height="50" rx="10" fill="#5741D9" />
      <path d="M22 17C17 17 14 20 14 24C14 29 17 31 20 31V34H23V29.5C24.5 28 25 26 25 24C25 20 23.5 17 22 17ZM19.5 25C19 25 18.5 24.5 18.5 24C18.5 23.5 19 23 19.5 23C20 23 20.5 23.5 20.5 24C20.5 24.5 20 25 19.5 25Z" fill="#FFFFFF" />
      <text x="29" y="32" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="17" letterSpacing="0">kraken</text>
    </svg>
  ),
  luno: (
    <svg className="w-14 h-14 shrink-0" viewBox="0 0 120 50" fill="none">
      <rect width="120" height="50" rx="10" fill="#0027BD" />
      <circle cx="28" cy="27" r="10" fill="#001878" />
      <circle cx="28" cy="25" r="10" fill="#4B90FF" />
      <circle cx="28" cy="23" r="10" fill="#8BB8FF" />
      <circle cx="28" cy="21" r="10" fill="#FFFFFF" />
      <circle cx="28" cy="21" r="5" fill="#0027BD" />
      <text x="44" y="31" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="17" letterSpacing="1">LUNO</text>
    </svg>
  ),
};

export default function AdminPartnersSettingPage() {
  const [partners, setPartners] = useState([
    { name: 'Binance', logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', status: 'ACTIVE' },
    { name: 'Bybit', logo: 'https://cryptologos.cc/logos/bybit-logo.png', status: 'ACTIVE' },
    { name: 'Mexc', logo: 'https://cryptologos.cc/logos/mexc-logo.png', status: 'ACTIVE' },
    { name: 'HTX', logo: 'https://cryptologos.cc/logos/htx-logo.png', status: 'ACTIVE' },
    { name: 'OKX', logo: 'https://cryptologos.cc/logos/okx-logo.png', status: 'ACTIVE' },
    { name: 'BingX', logo: 'https://cryptologos.cc/logos/bingx-logo.png', status: 'ACTIVE' },
    { name: 'Kraken', logo: 'https://cryptologos.cc/logos/kraken-logo.png', status: 'ACTIVE' },
    { name: 'Luno', logo: 'https://cryptologos.cc/logos/luno-logo.png', status: 'ACTIVE' },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/public/partners')
      .then((res) => {
        if (res.data.success && res.data.partners?.length > 0) {
          setPartners(res.data.partners);
        }
      })
      .catch(() => null);
  }, []);

  const handleToggleStatus = (index) => {
    const updated = [...partners];
    updated[index].status = updated[index].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setPartners(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/settings/partners', { partners }).catch(() => null);
      toast.success('Exchange Partners updated successfully! Changes reflect live on the website.');
    } catch (err) {
      toast.error('Failed to save partners.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#5b5bf5]" /> Exchange Partners Setting
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure supported cryptocurrency exchange partners displayed on the website.
            </p>
          </div>
        </div>

        {/* Partners Grid */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {partners.map((item, idx) => {
              const partnerKey = (item.name || '').trim().toLowerCase();
              const svgLogo = PARTNER_LOGOS[partnerKey];

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-between shadow-sm space-y-4 relative group"
                >
                  {/* Logo Box */}
                  <div className="w-28 h-14 rounded-2xl bg-slate-950 flex items-center justify-center p-1 shadow-inner overflow-hidden">
                    {svgLogo ? (
                      svgLogo
                    ) : item.logo ? (
                      <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-white font-black text-xs font-mono">{item.name.toUpperCase()}</span>
                    )}
                  </div>

                {/* Name */}
                <h3 className="font-bold text-slate-800 text-sm font-sans">{item.name}</h3>

                {/* Active Badge */}
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                    item.status === 'ACTIVE'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'ACTIVE' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  {item.status}
                </span>

                {/* Edit / Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(idx)}
                  className="w-full bg-[#5b5bf5] text-white hover:bg-indigo-600 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            );
          })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Partners'}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebarLayout>
  );
}
