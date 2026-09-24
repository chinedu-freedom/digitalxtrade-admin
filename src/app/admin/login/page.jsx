'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import PageLoader from '../../../components/PageLoader';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAdminAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Check query params for verification or status notice
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Verified successfully! You can now log in.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  // Load remembered username on mount
  useEffect(() => {
    const rememberedUsername =
      localStorage.getItem('rememberedAdminUsername') ||
      localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setKeepMeLoggedIn(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    if (keepMeLoggedIn) {
      localStorage.setItem('rememberedAdminUsername', username);
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedAdminUsername');
      localStorage.removeItem('rememberedUsername');
    }

    try {
      const res = await login(username, password, keepMeLoggedIn);
      if (res && res.success) {
        router.push('/admin/dashboard');
      } else {
        const errMsg = res?.message || res?.error || 'Failed to login. Please try again.';
        setErrors({ form: errMsg });
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to login. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#07193b] text-slate-100 font-sans overflow-hidden">
      {/* Main Container Split: 50% Left Form / 50% Right Carousel Graphic */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Form Container (50% - Centered Vertically & Horizontally) */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 sm:px-12 lg:px-16 py-8 sm:py-12 h-full overflow-y-auto no-scrollbar relative z-10">
          <div className="w-full max-w-md my-auto">
            {/* Header Title */}
            <div className="mb-8 text-left">
              <h1 className="text-3xl font-extrabold text-white mb-2 font-righteous tracking-wide">
                Welcome <span className="text-gradient-stakelab">back</span>
              </h1>
              <p className="text-slate-400 text-sm">
                Login to your account to continue
              </p>
            </div>

            {/* General Form Error Message */}
            {errors.form && (
              <p className="mb-4 text-red-400 text-xs font-medium">{errors.form}</p>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.form) setErrors({});
                  }}
                  placeholder="Username"
                  className="w-full h-12 bg-[#0c1424] border-0 outline-none focus:outline-none rounded-md px-4 text-white placeholder-slate-500 font-sans text-sm focus:ring-1 focus:ring-[#0085d0] transition-all shadow-inner"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.form) setErrors({});
                    }}
                    placeholder="••••••••"
                    className="w-full h-12 bg-[#0c1424] border-0 outline-none focus:outline-none rounded-md px-4 pr-12 text-white placeholder-slate-500 font-sans text-sm focus:ring-1 focus:ring-[#0085d0] transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Checkbox & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepMeLoggedIn}
                    onChange={(e) => setKeepMeLoggedIn(e.target.checked)}
                    id="keepMeLoggedIn"
                    className="w-4 h-4 rounded border-[#1c2844] bg-[#0c1424] text-[#0085d0] focus:ring-0 accent-[#0085d0] cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-medium">Remember me</span>
                </label>

                <Link
                  href="/admin/forgot-password"
                  className="text-xs text-[#0085d0] font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-stakelab py-3 rounded-md text-white font-righteous text-sm tracking-wider uppercase font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
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
                      <animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="13;1"/>
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
                  'Login'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-xs text-slate-400 mt-6">
              Don’t have an account?{' '}
              <Link href="/register" className="text-[#0085d0] font-bold hover:underline">
                Sign up
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

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminLoginContent />
    </Suspense>
  );
}
