'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 h-24 flex items-center justify-between">
        
        {/* Brand Logo - DigitalXTrade Logo + Text */}
        <Link href="/admin/login" className="flex items-center gap-3 group">
          <img
            src="/logo.jpeg"
            alt="DigitalXTrade Logo"
            className="w-10 h-10 aspect-square object-cover shrink-0"
          />
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f3d7c] uppercase">
            DIGITAL<span className="text-[#0088cc]">X</span>TRADE <span className="text-xs font-bold text-[#0088cc] border border-[#0088cc] px-2 py-0.5 rounded tracking-normal">ADMIN</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-10 text-base font-extrabold text-[#0f3d7c]">
          <Link href="/admin/login" className="hover:text-[#0088cc] transition-colors">
            Admin Portal
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const liveUrl = process.env.NEXT_PUBLIC_USER_SITE_URL || 'http://localhost:3000';
                window.open(liveUrl, '_blank');
              }
            }}
            className="hover:text-[#0088cc] transition-colors cursor-pointer"
          >
            Client Website
          </button>
        </nav>

        {/* Right Buttons: ADMIN LOGIN */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/admin/login"
            className="px-6 py-3 rounded bg-[#0088cc] hover:bg-[#0077bb] text-white text-sm font-extrabold tracking-wide uppercase transition-all shadow-md flex items-center gap-2"
          >
            <span>ADMIN LOGIN</span>
            <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4h3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-3" />
              <path d="M4 12h10M10 8l4 4-4 4" />
            </svg>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded bg-gray-100 text-gray-700"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-6 pt-4 pb-6 space-y-4">
          <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-[#0f3d7c]">
            Admin Portal
          </Link>
          <div className="pt-2">
            <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded bg-[#0088cc] text-white font-bold text-center block uppercase">
              ADMIN LOGIN
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
