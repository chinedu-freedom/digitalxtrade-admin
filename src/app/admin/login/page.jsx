'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import HeaderNav from '../../../components/HeaderNav';
import Footer from '../../../components/Footer';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(username, password, true);
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 font-sans text-slate-800 relative flex flex-col justify-between">
      <HeaderNav />

      {/* BACKGROUND & FLOATING CARD SECTION */}
      <section className="relative w-full py-16 md:py-24 px-4 flex items-center justify-center min-h-[calc(100vh-200px)] bg-slate-900 overflow-hidden">
        {/* Background Trader Image */}
        <Image
          src="/images/hero-bg-trader.jpg"
          alt="Admin login background"
          fill
          priority
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

        {/* WHITE FLOATING LOGIN CARD */}
        <div className="relative z-10 w-full max-w-[500px] bg-white rounded-lg shadow-2xl p-8 md:p-12 border border-slate-100 my-auto text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.jpeg"
              alt="DigitalXTrade Logo"
              className="w-16 h-16 aspect-square object-cover shadow-sm"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#00529b] mb-8 tracking-tight">
            Admin login
          </h1>

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <input
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-4 py-3.5 text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0072ce] focus:ring-1 focus:ring-[#0072ce] transition-all"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-4 py-3.5 text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0072ce] focus:ring-1 focus:ring-[#0072ce] transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0085d0] hover:bg-[#0072ce] text-white font-bold py-3.5 rounded text-sm md:text-base tracking-wider uppercase transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1">
                      <animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13"/>
                      <animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13"/>
                      <animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="1;13"/>
                      <animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="1;13"/>
                    </rect>
                    <rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1">
                      <animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="1;13"/>
                      <animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13"/>
                      <animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13"/>
                      <animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="1;13"/>
                    </rect>
                    <rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1">
                      <animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1"/>
                      <animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1"/>
                      <animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="13;1"/>
                      <animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="13;1"/>
                    </rect>
                  </svg>
                ) : (
                  'LOGIN'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <Link
              href="/admin/forgot-password"
              className="text-[#0072ce] hover:underline font-bold text-sm md:text-base transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
