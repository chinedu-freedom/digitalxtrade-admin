'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../lib/api';
import {
  LayoutDashboard,
  DollarSign,
  Coins,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Headphones,
  LifeBuoy,
  FileText,
  Share2,
  Settings,
  MoreHorizontal,
  FileCheck,
  Search,
  Globe,
  Bell,
  Wrench,
  UserCheck,
  LogOut,
  Gift,
  ClipboardList,
  CalendarCheck,
  Disc,
  Key,
  ShieldCheck,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

let cachedAdminBrandInfo = null;

const renderFormattedBrandName = (name) => {
  return (
    <span className="text-xl font-extrabold text-white tracking-tight uppercase">
      DIGITAL<span className="text-[#0088cc]">X</span>TRADE
    </span>
  );
};


export default function AdminSidebarLayout({ children }) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState({ unreadCount: 0, tickets: [], deposits: [], withdrawals: [], signups: [], logins: [], stakes: [] });
  const [readNotifIds, setReadNotifIds] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('admin_read_notif_ids') || '[]');
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const handleMarkNotifRead = (id) => {
    if (!id) return;
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('admin_read_notif_ids', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleMarkAllNotifsRead = () => {
    const allIds = [
      ...(notifications.tickets || []).map((t) => t.id),
      ...(notifications.deposits || []).map((d) => d.id),
      ...(notifications.withdrawals || []).map((w) => w.id),
      ...(notifications.signups || []).map((u) => u.id),
      ...(notifications.logins || []).map((l) => l.id),
      ...(notifications.stakes || []).map((s) => s.id),
    ].filter(Boolean);

    setReadNotifIds((prev) => {
      const next = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem('admin_read_notif_ids', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const filterUnread = (items) => (items || []).filter((item) => !readNotifIds.includes(item.id));

  const unreadTickets = filterUnread(notifications.tickets);
  const unreadDeposits = filterUnread(notifications.deposits);
  const unreadWithdrawals = filterUnread(notifications.withdrawals);
  const unreadSignups = filterUnread(notifications.signups);
  const unreadLogins = filterUnread(notifications.logins);
  const unreadStakes = filterUnread(notifications.stakes);

  const activeUnreadCount = unreadTickets.length + unreadDeposits.length + unreadWithdrawals.length + unreadSignups.length + unreadLogins.length + unreadStakes.length;
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  const [counts, setCounts] = useState({
    emailUnverified: '0',
    pendingDeposits: '0',
    pendingWithdrawals: '0',
    pendingTickets: '0',
  });

  const [brandInfo, setBrandInfo] = useState(() => {
    return cachedAdminBrandInfo || { logoUrl: '/logo.jpeg', siteName: 'DigitalXTrade', loaded: !!cachedAdminBrandInfo };
  });

  useEffect(() => {
    if (cachedAdminBrandInfo) {
      setBrandInfo(cachedAdminBrandInfo);
      return;
    }

    api
      .get('/public/logo-favicon')
      .then((res) => {
        if (res.data && res.data.success && res.data.settings) {
          const info = {
            logoUrl: res.data.settings.logoUrl || null,
            siteName: res.data.settings.siteName || res.data.settings.siteTitle || 'EverStake',
            loaded: true,
          };
          cachedAdminBrandInfo = info;
          setBrandInfo(info);
        } else {
          setBrandInfo((prev) => ({ ...prev, loaded: true }));
        }
      })
      .catch(() => setBrandInfo((prev) => ({ ...prev, loaded: true })));

    const handleLogoUpdate = (e) => {
      if (e.detail) {
        const info = { ...brandInfo, logoUrl: e.detail, loaded: true };
        cachedAdminBrandInfo = info;
        setBrandInfo(info);
      }
    };
    window.addEventListener('site-logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('site-logo-updated', handleLogoUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/admin/notifications');
        if (res.data && res.data.success) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin notifications:', err);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/admin/global-search?query=${encodeURIComponent(searchQuery)}`);
        if (res.data && res.data.success) {
          setSearchResults(res.data.results);
          setSearchDropdownOpen(true);
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data && res.data.success && res.data.stats) {
          const s = res.data.stats;
          setCounts({
            emailUnverified: String(s.emailUnverified ?? 0),
            pendingDeposits: String(s.pendingDeposits ?? 0),
            pendingWithdrawals: String(s.pendingWithdrawals ?? 0),
            pendingTickets: String(s.pendingTickets ?? 0),
          });
        }
      } catch (err) {
        // Quiet fallback
      }
    };
    fetchCounts();
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    {
      label: 'Manage Investments',
      icon: Coins,
      matchPaths: ['/admin/staking-plans', '/admin/investments', '/admin/plan'],
      submenu: [
        { label: 'Investment Plans', path: '/admin/staking-plans' },
        { label: 'Expiring Investments', path: '/admin/investments/expiring' },
        { label: 'All Investment Logs', path: '/admin/reports/staking' },
      ],
    },
    {
      label: 'Manage Users',
      icon: Users,
      badge: '!',
      matchPaths: ['/admin/users'],
      submenu: [
        { label: 'Active Users', path: '/admin/users/active' },
        { label: 'Banned Users', path: '/admin/users/banned' },
        { label: 'Email Unverified', path: '/admin/users/email-unverified', countBadge: counts.emailUnverified },
        { label: 'All Users', path: '/admin/users' },
        { label: 'Send Notification', path: '/admin/users/send-notification' },
      ],
    },
    {
      label: 'Deposits',
      icon: ArrowDownLeft,
      badge: '!',
      matchPaths: ['/admin/deposits', '/admin/deposit'],
      submenu: [
        { label: 'Pending Deposits', path: '/admin/deposits/pending', countBadge: counts.pendingDeposits },
        { label: 'Approved Deposits', path: '/admin/deposits/approved' },
        { label: 'Rejected Deposits', path: '/admin/deposits/rejected' },
        { label: 'All Deposits', path: '/admin/deposits' },
      ],
    },
    {
      label: 'Withdrawals',
      icon: ArrowUpRight,
      badge: '!',
      matchPaths: ['/admin/withdrawals', '/admin/withdraw'],
      submenu: [
        { label: 'Pending Withdrawals', path: '/admin/withdrawals/pending', countBadge: counts.pendingWithdrawals },
        { label: 'Approved Withdrawals', path: '/admin/withdrawals/approved' },
        { label: 'Rejected Withdrawals', path: '/admin/withdrawals/rejected' },
        { label: 'All Withdrawals', path: '/admin/withdrawals' },
      ],
    },
    {
      label: 'Support Ticket',
      icon: LifeBuoy,
      badge: '!',
      matchPaths: ['/admin/tickets', '/admin/ticket'],
      submenu: [
        { label: 'Pending Ticket', path: '/admin/tickets/pending', countBadge: counts.pendingTickets },
        { label: 'Closed Ticket', path: '/admin/tickets/closed' },
        { label: 'Answered Ticket', path: '/admin/tickets/answered' },
        { label: 'All Ticket', path: '/admin/tickets' },
      ],
    },
    {
      label: 'Report',
      icon: FileText,
      matchPaths: ['/admin/reports', '/admin/report'],
      submenu: [
        { label: 'Transaction History', path: '/admin/reports/transactions' },
        { label: 'Staking History', path: '/admin/reports/staking' },
        { label: 'Login History', path: '/admin/reports/logins' },
      ],
    },
    {
      label: 'Gift Bonus',
      icon: Gift,
      matchPaths: ['/admin/gift-bonus'],
      submenu: [
        { label: 'Gift Bonus Codes', path: '/admin/gift-bonus/bonus' },
        { label: 'Usage History', path: '/admin/gift-bonus/uses-list' },
      ],
    },
    { label: 'Manage Referral', path: '/admin/referral', icon: Share2 },
    { label: 'System Setting', path: '/admin/settings', icon: Settings },
    { label: 'Logout', action: 'logout', icon: LogOut },
  ];

  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Auto-expand parent section for current route on page load & navigation
  useEffect(() => {
    const activeItem = navItems.find((item) => {
      if (!item.submenu) return false;
      if (item.matchPaths && item.matchPaths.some((mp) => pathname.startsWith(mp))) return true;
      return item.submenu.some((sub) => pathname === sub.path || pathname.startsWith(sub.path));
    });

    if (activeItem) {
      setOpenSubmenu(activeItem.label);
    }
  }, [pathname]);

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f3f5f9] text-slate-800 font-sans flex">
      {/* Left Sidebar Drawer (Full Height Top-to-Bottom) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#091630] border-r border-[#142343] text-slate-300 transform transition-transform duration-300 ease-in-out flex flex-col h-full shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-6 flex items-center border-b border-[#142343] shrink-0 min-h-[64px]">
          <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
            {brandInfo.loaded && (
              <>
                <img
                  src={brandInfo.logoUrl || '/logo.jpeg'}
                  alt={brandInfo.siteName || 'Logo'}
                  className="w-9 h-9 aspect-square object-cover shrink-0"
                />
                {brandInfo.siteName && renderFormattedBrandName(brandInfo.siteName)}
              </>
            )}
          </Link>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Sidebar Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              const hasSubmenu = Boolean(item.submenu);
              const isSubOpen = openSubmenu === item.label;

              if (hasSubmenu) {
                const isParentActive =
                  (item.matchPaths && item.matchPaths.some((mp) => pathname.startsWith(mp))) ||
                  (item.submenu && item.submenu.some((sub) => pathname === sub.path || pathname.startsWith(sub.path)));
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                        isParentActive
                          ? 'text-white font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-[#122347]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="w-5 h-5 rounded-md bg-[#ffaa00] text-slate-900 font-black text-[11px] flex items-center justify-center shadow-sm ml-auto">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-2 ${
                          isSubOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Submenu Dropdown Items */}
                    {isSubOpen && (
                      <div className="pl-6 pr-2 space-y-1 py-1">
                        {item.submenu.map((sub) => {
                          const isSubActive = pathname === sub.path;
                          return (
                            <Link
                              key={sub.path}
                              href={sub.path}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center justify-between py-2 px-3.5 rounded-lg text-xs font-medium transition-all ${
                                isSubActive
                                  ? 'bg-[#5b5bf5] text-white font-bold shadow-md'
                                  : 'text-slate-400 hover:text-white hover:bg-[#122347]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                <span>{sub.label}</span>
                              </div>
                              {sub.countBadge && (
                                <span className="bg-[#38bdf8] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                                  {sub.countBadge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.action === 'logout') {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all text-red-400 hover:text-white hover:bg-red-500/20 cursor-pointer text-left"
                  >
                    <Icon className="w-4 h-4 text-red-400" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-[#5b5bf5] text-white shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#122347]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Footer Label */}
        <div className="p-4 border-t border-[#142343] text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            DIGITALXTRADE V1.0.0
          </span>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
        />
      )}

      {/* Right Main Column (Header + Canvas) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Navbar */}
        <header className="h-16 bg-[#091630] text-white border-b border-[#142343] shrink-0 z-20 px-4 sm:px-6 flex items-center justify-between shadow-md">
          {/* Left Side: Mobile Menu Button, Mobile Brand Logo & Search Bar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-md focus:outline-none"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Admin Brand Logo on Small Screens */}
            <Link href="/admin/dashboard" className="lg:hidden flex items-center space-x-2">
              <img
                src="/logo.jpeg"
                alt="DigitalXTrade Logo"
                className="w-7 h-7 aspect-square object-cover shrink-0"
              />
              <span className="text-lg font-extrabold text-white tracking-wide">
                DIGITAL<span className="text-[#0088cc]">X</span>TRADE
              </span>
            </Link>

          </div>

          {/* Right Side: Header Quick Icons & Admin User Profile */}
          <div className="flex items-center space-x-4">
            {/* Admin Profile Pill Dropdown - Shows ONLY image icon without border on small screens */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2.5 p-1 sm:p-0 sm:bg-[#122347] sm:hover:bg-[#1a305e] sm:px-3 sm:py-1.5 sm:rounded-full sm:border sm:border-[#1e3463] cursor-pointer transition-all focus:outline-none select-none"
              >
                <div className="sm:w-7 sm:h-7 sm:rounded-full sm:bg-[#1e3463] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-6 h-6 sm:w-4 sm:h-4 text-slate-200" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    DigitalXTrade Admin
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    admin@digitalxtrade.com
                  </div>
                </div>
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Panel (Only Password Change & Logout) */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a1835] border border-[#1e3463] rounded-xl shadow-2xl overflow-hidden z-50 py-1.5 font-sans">
                  <Link
                    href="/admin/password"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-[#142852] hover:text-white flex items-center gap-3 transition-colors"
                  >
                    <Key className="w-4 h-4 text-slate-300" />
                    <span>Password Change</span>
                  </Link>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-[#ff0044]/15 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-slate-300" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area (White Canvas Scrolls Independently with Hidden Scrollbar) */}
        <main className="flex-1 bg-[#f3f5f9] p-4 sm:p-6 lg:p-8 h-full overflow-y-auto no-scrollbar text-slate-800">
          {children}
        </main>
      </div>
    </div>
  );
}
