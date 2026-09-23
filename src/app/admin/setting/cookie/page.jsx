'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import RichTextEditor from '../../../../components/RichTextEditor';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminGdprCookiePage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [shortDescription, setShortDescription] = useState(
    'We may use cookies or any other tracking technologies when you visit our website, including any other media form, mobile website, or mobile application related or connected to help customize the Site and improve your experience.'
  );

  const [fullDescription, setFullDescription] = useState(`
What information do we collect?
We gather data from you when you register on our site, submit a request, buy any services, react to an overview, or round out a structure. At the point when requesting any assistance or enrolling on our site, as suitable, you might be approached to enter your: name, email address, or telephone number. You may, nonetheless, visit our site anonymously.

How do we protect your information?
All provided delicate data is sent through encrypted protocols.

Do we disclose any information to outside parties?
We don't sell, exchange, or in any case move to outside gatherings your data.
  `.trim());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCookieSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/cookie-policy');
      if (res.data && res.data.success && res.data.settings) {
        const s = res.data.settings;
        setIsEnabled(Boolean(s.isEnabled));
        if (s.shortDescription !== undefined) setShortDescription(s.shortDescription);
        if (s.fullDescription !== undefined) setFullDescription(s.fullDescription);
      }
    } catch (err) {
      console.error('Failed to load cookie settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCookieSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shortDescription.trim()) {
      toast.error('Short description is required.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/admin/cookie-policy', {
        isEnabled,
        shortDescription,
        fullDescription,
      });

      if (res.data && res.data.success) {
        toast.success(res.data.message || 'GDPR Cookie settings updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to update cookie policy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
          GDPR Cookie
        </h1>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2 text-xs">
            <span>Loading cookie settings</span>
            <Loader2 className="w-5 h-5 animate-spin text-[#5b5bf5]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            {/* Status Toggle Switch Bar */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 font-sans">
                Status
              </label>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={`w-64 h-11 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  isEnabled
                    ? 'bg-[#22c55e] hover:bg-emerald-600 text-white'
                    : 'bg-[#ef4444] hover:bg-red-600 text-white'
                }`}
              >
                {isEnabled ? 'Enable' : 'Disabled'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Short Description Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Short Description Banner <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={shortDescription}
                  onChange={setShortDescription}
                  placeholder="Short cookie policy message..."
                  minHeight="90px"
                />
              </div>

              {/* Full Description Rich Text Editor Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                  Full Policy & Terms Description
                </label>
                <RichTextEditor
                  value={fullDescription}
                  onChange={setFullDescription}
                  placeholder="Detailed cookie policy and user terms..."
                  minHeight="320px"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
