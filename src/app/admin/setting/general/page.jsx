'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { Upload, Loader2, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminGeneralSettingPage() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [siteTitle, setSiteTitle] = useState('EverStake');
  const [currency] = useState('USDT');
  const [currencySymbol] = useState('$');
  const [timezone, setTimezone] = useState('UTC');
  const [registrationBonus, setRegistrationBonus] = useState('10.00');
  const [appDownloadUrl, setAppDownloadUrl] = useState('https://everstake.io/everstake-app.apk');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/general-setting');
      if (res.data && res.data.success && res.data.settings) {
        const s = res.data.settings;
        if (s.siteTitle !== undefined) setSiteTitle(s.siteTitle);
        if (s.timezone !== undefined) setTimezone(s.timezone);
        if (s.registrationBonus !== undefined) setRegistrationBonus(String(s.registrationBonus));
        if (s.logoUrl !== undefined) setLogoPreview(s.logoUrl);
        if (s.faviconUrl !== undefined) setFaviconPreview(s.faviconUrl);
        if (s.appDownloadUrl !== undefined) setAppDownloadUrl(s.appDownloadUrl);
      }
      
      // Also attempt fetching from logo-favicon as backup
      try {
        const lfRes = await api.get('/admin/logo-favicon');
        if (lfRes.data && lfRes.data.success && lfRes.data.settings) {
          if (lfRes.data.settings.logoUrl !== undefined) setLogoPreview(lfRes.data.settings.logoUrl);
          if (lfRes.data.settings.faviconUrl !== undefined) setFaviconPreview(lfRes.data.settings.faviconUrl);
        }
      } catch (e) {
        // Silent catch for secondary endpoint
      }
    } catch (err) {
      console.error('Failed to load general settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        toast.success('New logo file selected.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
        toast.success('New favicon file selected.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!siteTitle.trim()) {
      toast.error('Site Title is required.');
      return;
    }

    try {
      setSaving(true);
      
      // Update General Setting
      const res = await api.post('/admin/general-setting', {
        siteTitle,
        timezone,
        registrationBonus: parseFloat(registrationBonus || 0),
        logoUrl: logoPreview,
        faviconUrl: faviconPreview,
        appDownloadUrl,
      });

      // Also update logo-favicon endpoint to keep data strictly in sync
      try {
        await api.post('/admin/logo-favicon', {
          logoUrl: logoPreview,
          faviconUrl: faviconPreview,
        });
      } catch (e) {
        // Silent catch
      }

      if (res.data && res.data.success) {
        toast.success(res.data.message || 'General settings, Logo & Favicon saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save general settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
          General Setting & Brand Assets
        </h1>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2 text-xs">
            <span>Loading settings</span>
            <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
          </div>
        ) : (
          /* Setting Form Container */
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Logo & Favicon Upload Grid */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#5b5bf5]" /> Site Logo & Favicon Branding
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Box: Logo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2 font-sans">
                      Site Logo
                    </label>
                    <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-6 min-h-[180px] shadow-sm">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="max-h-20 object-contain" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded bg-gradient-to-r from-[#ff0044] to-[#fe780b] flex items-center justify-center text-white font-righteous font-bold text-lg shadow-md">
                            E
                          </div>
                          <span className="text-2xl font-extrabold text-[#091630] font-sans">
                            Ever<span className="text-[#5b5bf5]">Stake</span>
                          </span>
                        </div>
                      )}

                      {logoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            toast.success('Site logo removed.');
                          }}
                          className="absolute left-4 bottom-4 bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                          title="Remove Site Logo"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      )}

                      <label className="absolute right-4 bottom-4 bg-[#5b5bf5] hover:bg-indigo-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105" title="Upload Site Logo">
                        <Upload className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-2 font-sans">
                      Supported Files: <span className="font-bold text-slate-700">.png, .jpg, .jpeg, .svg</span>
                    </p>
                  </div>

                  {/* Right Box: Favicon */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2 font-sans">
                      Site Favicon / App Icon
                    </label>
                    <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-6 min-h-[180px] shadow-sm">
                      {faviconPreview ? (
                        <img src={faviconPreview} alt="Favicon" className="max-h-16 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#ff0044] to-[#fe780b] flex items-center justify-center text-white font-righteous font-bold text-xl shadow-lg">
                          E
                        </div>
                      )}

                      {faviconPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setFaviconPreview(null);
                            toast.success('Site favicon removed.');
                          }}
                          className="absolute left-4 bottom-4 bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                          title="Remove Favicon"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      )}

                      <label className="absolute right-4 bottom-4 bg-[#5b5bf5] hover:bg-indigo-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105" title="Upload Favicon">
                        <Upload className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.ico,.svg"
                          onChange={handleFaviconChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-2 font-sans">
                      Supported Files: <span className="font-bold text-slate-700">.png, .jpg, .jpeg, .ico, .svg</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: General System Configuration Inputs */}
              <div className="space-y-4 pt-2">
                <h2 className="text-sm font-bold text-slate-800 font-sans border-b border-slate-100 pb-2">
                  System Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Site Title * */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                      Site Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                    />
                  </div>

                  {/* Registration Bonus */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                      Registration Bonus (USDT)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={registrationBonus}
                        onChange={(e) => setRegistrationBonus(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-3.5 pr-14 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans shadow-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                        USDT
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      Submit <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
