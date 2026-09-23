'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import {
  Settings,
  Image,
  Sliders,
  Bell,
  CreditCard,
  Building2,
  Globe,
  Layout,
  FileText,
  UserCheck,
  Share2,
  Languages,
  Puzzle,
  Clock,
  Shield,
  Bot,
  Cookie,
  Code2,
  Network,
  Search,
} from 'lucide-react';

const systemSettingCards = [
  {
    title: 'General Setting',
    description: 'Configure site title, logo, favicon branding and registration bonus.',
    icon: Settings,
    link: '/admin/setting/general',
  },
  {
    title: 'Maintenance Mode',
    description: 'Enable or disable the maintenance mode of the system when required.',
    icon: Bot,
    link: '/admin/setting/maintenance',
  },
  {
    title: 'GDPR Cookie',
    description: 'Set GDPR Cookie policy if required. It will ask visitor of the system to accept if enabled.',
    icon: Cookie,
    link: '/admin/setting/cookie',
  },
  {
    title: 'Change Password',
    description: 'Update and change the administrator login password.',
    icon: Shield,
    link: '/admin/setting/change-password',
  },
  {
    title: 'Verification Password',
    description: 'Update the security verification password used for approving sensitive admin operations.',
    icon: Network,
    link: '/admin/setting/verification-password',
  },
  {
    title: 'System Feature Modules',
    description: 'Enable or disable Gamification features (Tasks, Spin Wheel, Daily Check-In, Gift Bonus).',
    icon: Sliders,
    link: '/admin/setting/system-features',
  },
  {
    title: 'Contact & Support Links',
    description: 'Configure official Telegram, WhatsApp, and community support links.',
    icon: Share2,
    link: '/admin/setting/contact-support',
  },
  {
    title: 'Deposit & Withdrawal Settings',
    description: 'Configure deposit and payout limits, charges, and recharge/withdraw notices.',
    icon: CreditCard,
    link: '/admin/setting/deposit-withdrawal',
  },
  {
    title: 'How It Works Section',
    description: 'Configure the process steps displayed on the homepage How It Works section.',
    icon: Layout,
    link: '/admin/setting/how-it-works',
  },
  {
    title: 'Client Testimonials',
    description: 'Manage user reviews and testimonials displayed in the homepage carousel.',
    icon: FileText,
    link: '/admin/setting/testimonials',
  },
  {
    title: 'Latest Announcements',
    description: 'Create and edit announcement posts displayed on the homepage news section.',
    icon: Bell,
    link: '/admin/setting/announcements',
  },
  {
    title: 'Exchange Partners',
    description: 'Configure supported cryptocurrency exchange partners (Binance, Bybit, MEXC, HTX, etc.).',
    icon: Globe,
    link: '/admin/setting/partners',
  },
  {
    title: 'Why Choose Us Section',
    description: 'Configure advantages, icons, and features displayed in the Why Choose StakeLab section.',
    icon: Sliders,
    link: '/admin/setting/why-choose-us',
  },
];

export default function AdminSystemSettingPage() {
  const [search, setSearch] = useState('');

  const filteredCards = systemSettingCards.filter((card) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return card.title.toLowerCase().includes(q) || card.description.toLowerCase().includes(q);
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Title */}
        <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
          System Settings
        </h1>

        {/* Top Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans placeholder-slate-400"
            />
          </div>
        </div>

        {/* System Setting Control Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-semibold">
              No matching settings found
            </div>
          ) : (
            filteredCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <Link
                  key={idx}
                  href={card.link}
                  className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4 hover:border-[#5b5bf5] hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                >
                  {/* Purple Icon Box */}
                  <div className="bg-[#5b5bf5] text-white p-3.5 rounded-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <IconComp className="w-6 h-6 text-white" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 z-10">
                    <h3 className="font-bold text-slate-800 text-sm font-sans group-hover:text-[#5b5bf5] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                      {card.description}
                    </p>
                  </div>

                  {/* Decorative Background Watermark Icon */}
                  <div className="absolute right-2 bottom-1 opacity-[0.04] text-slate-900 group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <IconComp className="w-20 h-20" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
