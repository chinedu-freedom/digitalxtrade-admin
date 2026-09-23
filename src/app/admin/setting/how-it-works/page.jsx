'use client';

import { useState, useEffect } from 'react';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import RichTextEditor from '../../../../components/RichTextEditor';
import { Layers, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export default function AdminHowItWorksSettingPage() {
  const [steps, setSteps] = useState([
    {
      num: '1',
      title: 'Sign Up Account',
      desc: 'First, you need to sign up for our system.',
      icon: '/images/step1.png',
    },
    {
      num: '2',
      title: 'Deposit',
      desc: 'Then deposit to your wallet.',
      icon: '/images/step2.png',
    },
    {
      num: '3',
      title: 'Stake',
      desc: 'Purchase plan and stake money as per your plan.',
      icon: '/images/step3.png',
    },
    {
      num: '4',
      title: 'Withdraw Money',
      desc: 'Finally, you can withdraw your money.',
      icon: '/images/step4.png',
    },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/public/how-it-works')
      .then((res) => {
        if (res.data.success && res.data.steps?.length > 0) {
          setSteps(res.data.steps);
        }
      })
      .catch(() => null);
  }, []);

  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleAddStep = () => {
    const nextNum = (steps.length + 1).toString();
    setSteps([
      ...steps,
      {
        num: nextNum,
        title: `Step ${nextNum}`,
        desc: 'Description for step...',
        icon: `/images/step${nextNum > 4 ? 4 : nextNum}.png`,
      },
    ]);
  };

  const handleDeleteStep = (index) => {
    if (steps.length <= 1) {
      toast.error('You must keep at least one step.');
      return;
    }
    const updated = steps.filter((_, idx) => idx !== index);
    setSteps(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/settings/how-it-works', { steps }).catch(() => null);
      toast.success('How It Works steps updated successfully! Changes reflect live on the website.');
    } catch (err) {
      toast.error('Failed to save settings.');
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
              <Layers className="w-5 h-5 text-[#5b5bf5]" /> How It Works Section Setting
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure the process steps displayed on the homepage How It Works section.
            </p>
          </div>

          <button
            onClick={handleAddStep}
            className="border border-[#5b5bf5] text-[#5b5bf5] hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>

        {/* Steps Management Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm relative group"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="w-7 h-7 rounded-lg bg-[#5b5bf5] text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    {step.num || idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteStep(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Step Number Label</label>
                    <input
                      type="text"
                      value={step.num}
                      onChange={(e) => handleStepChange(idx, 'num', e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-[#5b5bf5]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Title</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-slate-800 focus:outline-none focus:border-[#5b5bf5]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Description</label>
                    <RichTextEditor
                      value={step.desc}
                      onChange={(val) => handleStepChange(idx, 'desc', val)}
                      placeholder="Step description..."
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
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebarLayout>
  );
}
