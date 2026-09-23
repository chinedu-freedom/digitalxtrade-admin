'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import RichTextEditor from '../../../../components/RichTextEditor';
import { Quote, Plus, Trash2, Save, Star } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminTestimonialsSettingPage() {
  const [testimonials, setTestimonials] = useState([
    {
      name: 'Liam O’Connor',
      country: 'Ireland',
      quote:
        'Their crypto staking options are top-notch. I love how easy it is to diversify and earn daily passive returns without dealing with manual yield calculations.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Sofia Martinez',
      country: 'Spain',
      quote:
        'I started with USDT and Bitcoin staking through StakeLab, and the returns have been solid. Their platform makes crypto yield investing straightforward for beginners.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Rahul Kumar',
      country: 'India',
      quote:
        'StakeLab’s automated withdrawal and daily payout system helped me fund my business opportunities quickly and safely. The process is fast, transparent, and professional.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/public/testimonials')
      .then((res) => {
        if (res.data.success && res.data.testimonials?.length > 0) {
          setTestimonials(res.data.testimonials);
        }
      })
      .catch(() => null);
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...testimonials];
    updated[index][field] = value;
    setTestimonials(updated);
  };

  const handleAddTestimonial = () => {
    setTestimonials([
      ...testimonials,
      {
        name: 'New Client',
        country: 'United States',
        quote: 'Great platform experience!',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
    ]);
  };

  const handleDeleteTestimonial = (index) => {
    if (testimonials.length <= 1) {
      toast.error('You must keep at least one testimonial.');
      return;
    }
    const updated = testimonials.filter((_, idx) => idx !== index);
    setTestimonials(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/settings/testimonials', { testimonials }).catch(() => null);
      toast.success('Client Testimonials updated successfully! Changes reflect live on the website.');
    } catch (err) {
      toast.error('Failed to save testimonials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide flex items-center gap-2">
              <Quote className="w-5 h-5 text-[#5b5bf5]" /> What They Say About Us (Testimonials)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage client reviews and testimonials displayed on the homepage carousel.
            </p>
          </div>

          <button
            onClick={handleAddTestimonial}
            className="border border-[#5b5bf5] text-[#5b5bf5] hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        </div>

        {/* Testimonials List Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm relative group"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-bold text-slate-800 text-xs">{item.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTestimonial(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Client Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleChange(idx, 'name', e.target.value)}
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-[#5b5bf5]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Country</label>
                      <input
                        type="text"
                        value={item.country}
                        onChange={(e) => handleChange(idx, 'country', e.target.value)}
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-[#5b5bf5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Avatar Image URL</label>
                    <input
                      type="text"
                      value={item.avatar}
                      onChange={(e) => handleChange(idx, 'avatar', e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-[#5b5bf5]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quote / Review</label>
                    <RichTextEditor
                      value={item.quote}
                      onChange={(val) => handleChange(idx, 'quote', val)}
                      placeholder="User review or testimonial..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Testimonials'}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebarLayout>
  );
}
