'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { toast } from 'sonner';
import GoogleReCaptcha from '../../../components/GoogleReCaptcha';

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset } = useAdminAuth();
  const [email, setEmail] = useState('admin@stakelab.io');
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!captchaToken) {
      setErrors({ captcha: 'Please verify the reCAPTCHA checkbox before proceeding.' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await requestPasswordReset(email);
      if (res && res.success) {
        // toast.success('Password reset OTP has been sent to admin email.'); // Handled in AdminAuthContext hook
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
                  className="w-full h-12 bg-[#0c1424] border-0 outline-none focus:outline-none rounded-md px-4 text-white placeholder-slate-500 font-sans text-sm focus:ring-1 focus:ring-[#ff0044] transition-all shadow-inner"
                />
              </div>

              {/* Official Google reCAPTCHA v2 Component */}
              <div className="pt-1">
                <GoogleReCaptcha
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: '' }));
                  }}
                />
                {errors.captcha && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.captcha}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-stakelab py-3 rounded-md text-white font-righteous text-sm tracking-wider uppercase font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <rect width="6" height="14" x="1" y="4" fill="currentColor">
                      <animate id="SVG9ovaHbIP" fill="freeze" attributeName="opacity" begin="0;SVGa89dAd4w.end-0.25s" dur="0.75s" values="1;.2" />
                    </rect>
                    <rect width="6" height="14" x="9" y="4" fill="currentColor" opacity=".4">
                      <animate fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.15s" dur="0.75s" values="1;.2" />
                    </rect>
                    <rect width="6" height="14" x="17" y="4" fill="currentColor" opacity=".3">
                      <animate id="SVGa89dAd4w" fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.3s" dur="0.75s" values="1;.2" />
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
              <Link href="/admin/login" className="text-[#ff0044] font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Auth Illustration Graphic (50% Equal Split - Local File Cropped) */}
        <div className="hidden lg:block w-1/2 h-full relative overflow-hidden bg-[#07193b]">
          <img
            src="/auth-bg.png"
            alt="StakeLab Admin Illustration"
            className="w-full h-full object-cover object-center scale-135 transform transition-transform duration-700"
          />
        </div>
      </div>
    </div>
  );
}
