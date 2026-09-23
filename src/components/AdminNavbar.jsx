'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Layers, LayoutDashboard, ArrowDownLeft, ArrowUpRight, Coins, Mail, LogOut, Shield } from 'lucide-react';

export default function AdminNavbar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Deposits', path: '/admin/deposits', icon: ArrowDownLeft },
    { label: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpRight },
    { label: 'Investment Plans', path: '/admin/staking-plans', icon: Coins },
    { label: 'Email Config', path: '/admin/settings/email', icon: Mail },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center space-x-3">
          <img
            src="/logo.jpeg"
            alt="DigitalXTrade Logo"
            className="w-10 h-10 aspect-square object-cover shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white">
              DIGITAL<span className="text-[#0088cc]">X</span>TRADE Admin
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Control Panel</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-xs text-slate-400 font-mono">{admin?.email || 'admin@everstake.cx'}</span>
          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-slate-700"
            title="Admin Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
