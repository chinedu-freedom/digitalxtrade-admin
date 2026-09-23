'use client';

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { toast } from 'sonner';
import GoogleReCaptcha from '../../../components/GoogleReCaptcha';

function AdminVerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, requestPasswordReset } = useAdminAuth();

  const emailParam = searchParams.get('email') || 'admin@stakelab.io';
  const [email] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));

    // Auto-advance to next input digit
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    const fullOtp = otp.join('');

    if (fullOtp.length < 4) {
      newErrors.otp = 'Please enter the complete 4-digit code.';
    }

    if (!captchaToken) {
      newErrors.captcha = 'Please verify the reCAPTCHA checkbox before proceeding.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await verifyOtp(email, fullOtp);
      if (res && res.success) {
        // toast.success('OTP verified successfully!'); // Handled in AdminAuthContext hook
        setTimeout(() => {
          router.push(`/admin/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(fullOtp)}`);
        }, 1000);
      } else {
        setErrors({ otp: res?.message || 'Invalid or expired OTP code.' });
      }
    } catch (err) {
      setErrors({ otp: err.message || 'Invalid code. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    await requestPasswordReset(email);
    // toast.success(...) handled in AdminAuthContext hook
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#07193b] text-slate-100 font-sans overflow-hidden">
      {/* Main Container Split: 50% Left Form / 50% Right Image */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Form Container (50% - Vertically Centered & Hidden Scrollbar) */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 sm:px-12 lg:px-16 py-8 h-full overflow-y-auto no-scrollbar relative z-10">
          <div className="w-full max-w-md text-center my-auto">
            {/* Header Title & Copy */}
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-extrabold text-white font-righteous tracking-wide">
                Verify <span className="text-gradient-stakelab">OTP</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enter the 4-digit code sent to your admin email.
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 4-Digit Input Boxes */}
              <div>
                <div className="flex justify-center gap-3 my-4">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-14 h-14 text-center text-xl font-bold font-righteous bg-[#0c1424] outline-none focus:outline-none rounded-xl text-white transition-all shadow-inner ${
                        errors.otp ? 'border border-red-500/80 focus:ring-2 focus:ring-red-500' : 'border-0 focus:ring-2 focus:ring-[#ff0044]'
                      }`}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.otp}</p>
                )}
              </div>

              {/* Official Google reCAPTCHA v2 Component */}
              <div className="pt-1 flex flex-col items-center">
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
                className="w-full btn-stakelab py-3 rounded-md text-white font-righteous text-sm tracking-wider uppercase font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
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
                  'Verify OTP'
                )}
              </button>
            </form>

            {/* Resend Code Link */}
            <p className="text-center text-xs text-slate-400 mt-6">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                className="text-[#ff0044] font-bold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Resend
              </button>
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

export default function AdminVerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07193b] flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ff0044]"></div>
        </div>
      }
    >
      <AdminVerifyOtpContent />
    </Suspense>
  );
}
