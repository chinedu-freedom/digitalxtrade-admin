'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#00529b] text-white py-14 px-6 md:px-12 font-sans border-t border-[#00427c]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Links Row */}
        <div className="flex flex-wrap items-center gap-3 text-sm md:text-base font-bold">
          <Link href="/admin/login" className="hover:underline transition-all">Admin Control Portal</Link>
          <span className="text-white/60 font-light">|</span>
          <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="hover:underline transition-all">Client Website</a>
        </div>

        {/* Registered Office */}
        <div className="text-xs md:text-sm text-white/90 font-medium">
          digitalxtrade.com - Registered Office 15 Kilravock Street, Kensington, London, W10 4HX
        </div>

        {/* Regulatory Disclosure Text */}
        <div className="text-xs md:text-sm text-white/80 leading-relaxed font-normal space-y-4 max-w-6xl">
          <p>
            digitalxtrade.com is a trademark licensed for use by digitalxtrade.com. DigitalXTrade Admin Portal - Protected by Enterprise Security Systems.
          </p>
        </div>
      </div>
    </footer>
  );
}
