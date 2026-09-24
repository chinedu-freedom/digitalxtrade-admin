'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { toast } from 'react-toastify';

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset } = useAdminAuth();
  const [email, setEmail] = useState('admin@stakelab.io');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    setSubmitting(true);

    try {
      const res = await requestPasswordReset(email);
      if (res && res.success) {
        setTimeout(() => {
          router.push(`/admin/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1000);
      } else {
        setErrors({ form: res?.message || 'Something went wrong. Please try again.' });
      }
    } catch (err) {
      setErrors({ form: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#07193b] text-slate-100 font-sans overflow-hidden">
      {/* Main Container Split: 50% Left Form / 50% Right Image */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Form Container (50% - Vertically Centered & Hidden Scrollbar) */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 sm:px-12 lg:px-16 py-8 h-full overflow-y-auto no-scrollbar relative z-10">
          <div className="w-full max-w-md my-auto">
            {/* Header Title & Copy */}
            <div className="mb-8 text-left space-y-2">
              <h1 className="text-3xl font-extrabold text-white font-righteous tracking-wide">
                Forgot <span className="text-gradient-stakelab">Password?</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enter your admin email to receive a 4-digit verification code.
              </p>
            </div>

            {/* General Form Error */}
            {errors.form && (
              <p className="mb-4 text-red-400 text-xs font-medium">{errors.form}</p>
            )}

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Admin Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.form) setErrors({});
                  }}
                  placeholder="admin@stakelab.io"
                  className="w-full h-12 bg-[#0c1424] border-0 outline-none focus:outline-none rounded-md px-4 text-white placeholder-slate-500 font-sans text-sm focus:ring-1 focus:ring-[#0085d0] transition-all shadow-inner"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-stakelab py-3 rounded-md text-white font-righteous text-sm tracking-wider uppercase font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1">
                      <animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13"/>
                      <animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13"/>
                      <animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="13;1"/>
                      <animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1"/>
                    </rect>
                    <rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1">
                      <animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="13;1"/>
                      <animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13"/>
                      <animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="13;1"/>
                      <animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1"/>
                    </rect>
                    <rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1">
                      <animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1"/>
                      <animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1"/>
                      <animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="13;1"/>
                      <animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="13;1"/>
                    </rect>
                  </svg>
                ) : (
                  'Request OTP'
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <p className="text-center text-xs text-slate-400 mt-6">
              Remembered your password?{' '}
              <Link href="/admin/login" className="text-[#0085d0] font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Auth Brand Panel */}
        <div className="hidden lg:flex w-1/2 h-full items-center justify-center bg-[#030919] relative overflow-hidden p-6 xl:p-10">
          <img
            src="/logo.jpeg"
            alt="DigitalXTrade Logo"
            className="w-full max-w-xl xl:max-w-2xl max-h-[85vh] object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
