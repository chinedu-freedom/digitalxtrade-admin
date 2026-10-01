'use client';

import React from 'react';

export default function WhatsAppWidget({ phoneNumber = '447345115732', message = 'Message us' }) {
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center select-none font-sans">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 transition-transform duration-300 hover:scale-105 focus:outline-none group"
        aria-label="Message us on WhatsApp"
      >
        {/* WhatsApp Green Circle Button */}
        <div className="w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative shrink-0">
          <svg
            className="w-8 h-8 fill-current"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 2A13 13 0 0 0 4.7 20.9L3 27l6.3-1.6A13 13 0 1 0 16 2zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-4 1 1.1-3.9-.3-.4A10.6 10.6 0 1 1 16 25.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a9 9 0 0 1-2.6-1.6 9.9 9.9 0 0 1-1.8-2.3c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.4.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.7.1-1 .5a4.3 4.3 0 0 0-1.3 3.2 7.5 7.5 0 0 0 1.6 4 17.2 17.2 0 0 0 6.6 5.8c2.4 1 2.9.8 3.4.8a5.8 5.8 0 0 0 3.8-2.6 4.7 4.7 0 0 0 .3-2.6c-.1-.1-.3-.2-.6-.4z"/>
          </svg>
        </div>

        {/* White Speech Bubble Pill */}
        <div className="relative bg-white text-slate-900 text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg border border-slate-100/80 flex items-center justify-center whitespace-nowrap">
          {/* Triangular Tail pointing to icon */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-white" />
          <span>{message}</span>
        </div>
      </a>
    </div>
  );
}
