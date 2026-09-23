'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import { Upload, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import RichTextEditor from '../../../../components/RichTextEditor';

export default function AdminMaintenanceModePage() {
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [imagePreview, setImagePreview] = useState('/images/maintenance.svg');
  const [headline, setHeadline] = useState('');
  const [descriptionText, setDescriptionText] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMaintenanceSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/maintenance-mode');
      if (res.data && res.data.success && res.data.settings) {
        const s = res.data.settings;
        setIsMaintenanceActive(Boolean(s.isMaintenance));
        if (s.headline !== undefined) setHeadline(s.headline);
        if (s.descriptionText !== undefined) setDescriptionText(s.descriptionText);
        if (s.imageUrl !== undefined) setImagePreview(s.imageUrl);
      }
    } catch (err) {
      console.error('Failed to load maintenance settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceSettings();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        toast.success('Maintenance illustration uploaded.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMaintenanceActive) {
      if (!headline.trim() || !descriptionText.trim()) {
        toast.error('Description text and heading are required when maintenance mode is active.');
        return;
      }
    }

    try {
      setSaving(true);
      const res = await api.post('/admin/maintenance-mode', {
        isMaintenance: isMaintenanceActive,
        headline,
        descriptionText,
        imageUrl: imagePreview,
      });

      if (res.data && res.data.success) {
        toast.success(
          res.data.message ||
            `Maintenance mode ${isMaintenanceActive ? 'ACTIVATED' : 'DISABLED'} successfully!`
        );
      }
    } catch (err) {
      toast.error('Failed to update maintenance settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = () => {
    setIsMaintenanceActive(!isMaintenanceActive);
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
          Maintenance Mode
        </h1>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-semibold flex items-center justify-center gap-2 text-xs">
            <span>Loading maintenance settings</span>
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
                onClick={handleToggleStatus}
                className={`w-64 h-11 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  isMaintenanceActive
                    ? 'bg-[#22c55e] hover:bg-emerald-600 text-white'
                    : 'bg-[#ef4444] hover:bg-red-600 text-white'
                }`}
              >
                {isMaintenanceActive ? 'Enabled (Maintenance Active)' : 'Disabled (Site Online)'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Column: Image Upload Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 font-sans">
                    Image
                  </label>
                  <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-4 min-h-[260px]">
                    {/* Uploaded Image or SVG Placeholder */}
                    {imagePreview && imagePreview.startsWith('data:') ? (
                      <img src={imagePreview} alt="Maintenance Illustration" className="max-h-56 object-contain" />
                    ) : (
                      <div className="w-full max-w-md h-56 flex flex-col items-center justify-center text-center">
                        <svg
                          className="w-full h-full text-indigo-500 max-h-48"
                          viewBox="0 0 400 240"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="400" height="240" rx="12" fill="#F3F4F6" />
                          <path d="M120 180 L180 80 L240 180 Z" fill="#3B82F6" opacity="0.8" />
                          <circle cx="280" cy="120" r="30" fill="#6366F1" opacity="0.7" />
                          <rect x="60" y="140" width="280" height="12" rx="6" fill="#10B981" />
                          <path d="M150 120 L210 120 L210 160 L150 160 Z" fill="#F59E0B" />
                        </svg>
                      </div>
                    )}

                    {/* Round Upload Floating Button */}
                    <label className="absolute right-4 bottom-4 bg-[#5b5bf5] hover:bg-indigo-600 text-white p-3 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105">
                      <Upload className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-2 font-sans">
                    Supported Files: <span className="font-bold text-slate-700">.png, .jpg, .jpeg</span>. Image will be resized into <span className="font-bold text-slate-700">660x325px</span>
                  </p>
                </div>

                {/* Right Column: Headline & Rich Description Text Editor */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                      Headline Title
                    </label>
                    <RichTextEditor
                      value={headline}
                      onChange={setHeadline}
                      placeholder="e.g. THE SITE IS UNDER MAINTENANCE"
                      minHeight="80px"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">
                      Description & Message Content
                    </label>
                    <RichTextEditor
                      value={descriptionText}
                      onChange={setDescriptionText}
                      placeholder="Write your maintenance announcement message here..."
                      minHeight="220px"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-lg text-xs tracking-wider transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
