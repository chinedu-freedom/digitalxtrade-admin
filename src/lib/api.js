import axios from 'axios';

// Comprehensive Mock API client for UI-only presentation
export const api = {
  get: async (url, config) => {
    // Logo & Favicon Branding
    if (url.includes('/public/logo-favicon')) {
      return {
        data: {
          success: true,
          settings: {
            logoUrl: '/logo.jpeg',
            siteName: 'DigitalXTrade',
            siteTitle: 'DigitalXTrade Admin Portal'
          }
        }
      };
    }

    // Admin Dashboard Stats & Counts
    if (url.includes('/admin/stats')) {
      return {
        data: {
          success: true,
          stats: {
            totalUsers: 1248,
            activeUsers: 1102,
            todayUsers: 24,
            emailUnverified: 15,
            totalDeposited: 345000.50,
            todaysDeposit: 12500.00,
            pendingDeposits: 3,
            pendingDepositsSum: 4800.00,
            approvedDepositsCount: 420,
            rejectedDeposits: 12,
            totalWithdrawn: 198000.00,
            todaysWithdrawal: 4200.00,
            pendingWithdrawals: 2,
            pendingWithdrawalsSum: 3100.00,
            approvedWithdrawalsCount: 310,
            rejectedWithdrawals: 8,
            pendingTickets: 4,
            totalSystemEarnings: 637813.75,
            totalMembersFundsAdded: 590689.39,
            totalUsersBalance: 533570822.62,
            currentDeposits: 307684025.95,
            totalReferralCommissions: 7771910.56,
            cryptoBreakdown: [
              {
                symbol: 'BTC',
                name: 'Bitcoin',
                color: 'text-amber-500 bg-amber-50 border-amber-200',
                badgeBg: 'bg-amber-500',
                icon: '₿',
                systemEarnings: 0.00,
                membersFundsAdded: 0.00,
                usersBalance: 0.00,
                totalDeposits: 0.00,
                currentDeposits: 0.00,
                referralCommissions: 0.00,
                totalWithdrawals: 0.00,
                pendingWithdrawals: 0.00,
              },
              {
                symbol: 'USDT',
                name: 'Tether TRC20',
                color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
                badgeBg: 'bg-emerald-500',
                icon: '₮',
                systemEarnings: -224979.56,
                membersFundsAdded: 336475.50,
                usersBalance: 533154082.11,
                totalDeposits: 382132953.54,
                currentDeposits: 307663320.81,
                referralCommissions: 7765110.55,
                totalWithdrawals: 561455.06,
                pendingWithdrawals: 13741.50,
              },
              {
                symbol: 'ETH',
                name: 'Ethereum',
                color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
                badgeBg: 'bg-indigo-500',
                icon: 'Ξ',
                systemEarnings: -412834.19,
                membersFundsAdded: 254213.89,
                usersBalance: 416740.50,
                totalDeposits: 169419.36,
                currentDeposits: 20705.14,
                referralCommissions: 6800.01,
                totalWithdrawals: 667048.08,
                pendingWithdrawals: 1000.00,
              },
              {
                symbol: 'LTC',
                name: 'Litecoin',
                color: 'text-slate-500 bg-slate-50 border-slate-200',
                badgeBg: 'bg-slate-500',
                icon: 'Ł',
                systemEarnings: 0.00,
                membersFundsAdded: 0.00,
                usersBalance: 0.00,
                totalDeposits: 0.00,
                currentDeposits: 0.00,
                referralCommissions: 0.00,
                totalWithdrawals: 0.00,
                pendingWithdrawals: 0.00,
              },
            ]
          }
        }
      };
    }

    // Admin Notifications
    if (url.includes('/admin/notifications')) {
      return {
        data: {
          success: true,
          unreadCount: 3,
          tickets: [
            { id: 't1', ticket_id: '8912', subject: 'Deposit delayed for TRC20', status: 'Pending', user: { username: 'alex_j' } },
            { id: 't2', ticket_id: '8913', subject: 'KYC Verification Inquiry', status: 'Pending', user: { username: 'sarah_m' } },
          ],
          deposits: [
            { id: 'd1', amount: '1500.00', user: { username: 'alex_j' } },
          ],
          withdrawals: [
            { id: 'w1', amount: '800.00', user: { username: 'emily_d' } },
          ],
          signups: [
            { id: 'u1', username: 'johndoe', email: 'john@example.com' },
          ],
          logins: [],
          stakes: [
            { id: 's1', amount: '500.00', plan: { title: 'Pro Yield' }, user: { username: 'alex_j' } },
          ]
        }
      };
    }

    // Expiring Investments / Deposits
    if (url.includes('/admin/investments/expiring') || url.includes('/admin/expiring-deposits')) {
      return {
        data: {
          success: true,
          items: [
            { id: 'exp_1', username: 'Hisasiwile', userId: 'usr_101', plan: 'FOUNDATION PLAN (30)', amount: 4999.00, currency: 'USDT', currencySymbol: '₮', expiresText: '8 hours', expiresSeconds: 28800 },
            { id: 'exp_2', username: 'Nana59', userId: 'usr_102', plan: 'FOUNDATION PLAN (30)', amount: 987.00, currency: 'ETH', currencySymbol: 'Ξ', expiresText: '11 hours', expiresSeconds: 39600 },
            { id: 'exp_3', username: 'Hisasiwile', userId: 'usr_101', plan: 'FOUNDATION PLAN (30)', amount: 4999.00, currency: 'USDT', currencySymbol: '₮', expiresText: '19 hours', expiresSeconds: 68400 },
            { id: 'exp_4', username: 'Jerry', userId: 'usr_103', plan: 'FOUNDATION PLAN (30)', amount: 69.00, currency: 'USDT', currencySymbol: '₮', expiresText: '20 hours', expiresSeconds: 72000 },
            { id: 'exp_5', username: 'Nokubonga85', userId: 'usr_104', plan: 'FOUNDATION PLAN (30)', amount: 40.00, currency: 'ETH', currencySymbol: 'Ξ', expiresText: '1 day 4 hours', expiresSeconds: 100800 },
            { id: 'exp_6', username: 'Tiana77', userId: 'usr_105', plan: 'STABILITY PLAN (30)', amount: 10048.00, currency: 'ETH', currencySymbol: 'Ξ', expiresText: '1 day 8 hours', expiresSeconds: 115200 },
            { id: 'exp_7', username: 'Shia690', userId: 'usr_106', plan: 'ACCELERATION PLAN (30)', amount: 8010.00, currency: 'USDT', currencySymbol: '₮', expiresText: '2 days 11 hours', expiresSeconds: 212400 },
            { id: 'exp_8', username: 'Nomonde', userId: 'usr_107', plan: 'FOUNDATION PLAN (30)', amount: 40.00, currency: 'USDT', currencySymbol: '₮', expiresText: '2 days 16 hours', expiresSeconds: 230400 },
            { id: 'exp_9', username: 'Hisasiwile', userId: 'usr_101', plan: 'WEALTH PLAN (30)', amount: 7635700.00, currency: 'USDT', currencySymbol: '₮', expiresText: '3 days 11 hours', expiresSeconds: 298800 },
            { id: 'exp_10', username: 'Phindile84', userId: 'usr_108', plan: 'FOUNDATION PLAN (30)', amount: 48.00, currency: 'ETH', currencySymbol: 'Ξ', expiresText: '6 days', expiresSeconds: 518400 },
          ]
        }
      };
    }

    // Users List
    if (url.includes('/admin/users') || url.includes('/users')) {
      return {
        data: {
          success: true,
          users: [
            { id: 1, name: 'Alex Johnson', username: 'alex_j', email: 'alex@example.com', mobile: '+1234567890', country: 'United States', balance: 14500.50, status: 'active', joinedAt: '2026-01-15' },
            { id: 2, name: 'Sarah Miller', username: 'sarah_m', email: 'sarah@example.com', mobile: '+1987654321', country: 'United Kingdom', balance: 8200.00, status: 'active', joinedAt: '2026-02-10' },
            { id: 3, name: 'Michael Brown', username: 'michael_b', email: 'michael@example.com', mobile: '+1122334455', country: 'Canada', balance: 0.00, status: 'banned', joinedAt: '2026-03-01' },
            { id: 4, name: 'Emily Davis', username: 'emily_d', email: 'emily@example.com', mobile: '+1555666777', country: 'Australia', balance: 3450.25, status: 'active', joinedAt: '2026-03-12' },
          ],
          data: [
            { id: 1, name: 'Alex Johnson', username: 'alex_j', email: 'alex@example.com', mobile: '+1234567890', country: 'United States', balance: 14500.50, status: 'active', joinedAt: '2026-01-15' },
            { id: 2, name: 'Sarah Miller', username: 'sarah_m', email: 'sarah@example.com', mobile: '+1987654321', country: 'United Kingdom', balance: 8200.00, status: 'active', joinedAt: '2026-02-10' },
            { id: 3, name: 'Michael Brown', username: 'michael_b', email: 'michael@example.com', mobile: '+1122334455', country: 'Canada', balance: 0.00, status: 'banned', joinedAt: '2026-03-01' },
            { id: 4, name: 'Emily Davis', username: 'emily_d', email: 'emily@example.com', mobile: '+1555666777', country: 'Australia', balance: 3450.25, status: 'active', joinedAt: '2026-03-12' },
          ],
          total: 4,
          page: 1,
        }
      };
    }

    // Deposits
    if (url.includes('/deposits') || url.includes('/deposit')) {
      return {
        data: {
          success: true,
          deposits: [
            { id: 'DEP-9821', user: { username: 'alex_j', email: 'alex@example.com' }, amount: 5000, gateway: 'USDT (TRC20)', status: 'Approved', date: '2026-09-22 14:30', trx: 'TXN98217391' },
            { id: 'DEP-9822', user: { username: 'sarah_m', email: 'sarah@example.com' }, amount: 1200, gateway: 'Bitcoin', status: 'Pending', date: '2026-09-23 09:15', trx: 'TXN98221049' },
          ],
          data: [
            { id: 'DEP-9821', user: { username: 'alex_j', email: 'alex@example.com' }, amount: 5000, gateway: 'USDT (TRC20)', status: 'Approved', date: '2026-09-22 14:30', trx: 'TXN98217391' },
            { id: 'DEP-9822', user: { username: 'sarah_m', email: 'sarah@example.com' }, amount: 1200, gateway: 'Bitcoin', status: 'Pending', date: '2026-09-23 09:15', trx: 'TXN98221049' },
          ]
        }
      };
    }

    // Withdrawals
    if (url.includes('/withdrawals') || url.includes('/withdraw')) {
      return {
        data: {
          success: true,
          withdrawals: [
            { id: 'WD-4410', user: { username: 'emily_d', email: 'emily@example.com' }, amount: 800, method: 'Ethereum', status: 'Pending', date: '2026-09-23 10:05', trx: 'WDN441098' },
            { id: 'WD-4409', user: { username: 'alex_j', email: 'alex@example.com' }, amount: 2500, method: 'USDT', status: 'Approved', date: '2026-09-21 18:20', trx: 'WDN440912' },
          ],
          data: [
            { id: 'WD-4410', user: { username: 'emily_d', email: 'emily@example.com' }, amount: 800, method: 'Ethereum', status: 'Pending', date: '2026-09-23 10:05', trx: 'WDN441098' },
            { id: 'WD-4409', user: { username: 'alex_j', email: 'alex@example.com' }, amount: 2500, method: 'USDT', status: 'Approved', date: '2026-09-21 18:20', trx: 'WDN440912' },
          ]
        }
      };
    }

    // Staking Plans
    if (url.includes('/staking') || url.includes('/plan')) {
      return {
        data: {
          success: true,
          plans: [
            { id: 1, title: 'Starter Staking Pool', name: 'Starter Staking Pool', minDeposit: 100, maxDeposit: 1000, dailyReturn: '1.5%', duration: '30 Days', status: 'Active' },
            { id: 2, title: 'Pro Yield Optimizer', name: 'Pro Yield Optimizer', minDeposit: 1000, maxDeposit: 10000, dailyReturn: '2.8%', duration: '60 Days', status: 'Active' },
          ],
          data: [
            { id: 1, title: 'Starter Staking Pool', name: 'Starter Staking Pool', minDeposit: 100, maxDeposit: 1000, dailyReturn: '1.5%', duration: '30 Days', status: 'Active' },
            { id: 2, title: 'Pro Yield Optimizer', name: 'Pro Yield Optimizer', minDeposit: 1000, maxDeposit: 10000, dailyReturn: '2.8%', duration: '60 Days', status: 'Active' },
          ]
        }
      };
    }

    // Tickets
    if (url.includes('/tickets') || url.includes('/ticket')) {
      return {
        data: {
          success: true,
          tickets: [
            { id: 't1', ticket_id: '8912', subject: 'Deposit delayed for TRC20', status: 'Pending', priority: 'High', date: '2026-09-23 11:20', user: { username: 'alex_j', email: 'alex@example.com' } },
            { id: 't2', ticket_id: '8913', subject: 'KYC Verification Inquiry', status: 'Answered', priority: 'Medium', date: '2026-09-22 16:45', user: { username: 'sarah_m', email: 'sarah@example.com' } },
          ],
          data: [
            { id: 't1', ticket_id: '8912', subject: 'Deposit delayed for TRC20', status: 'Pending', priority: 'High', date: '2026-09-23 11:20', user: { username: 'alex_j', email: 'alex@example.com' } },
            { id: 't2', ticket_id: '8913', subject: 'KYC Verification Inquiry', status: 'Answered', priority: 'Medium', date: '2026-09-22 16:45', user: { username: 'sarah_m', email: 'sarah@example.com' } },
          ]
        }
      };
    }

    // Default Fallback Data Structure
    return {
      data: {
        success: true,
        data: [],
        users: [],
        deposits: [],
        withdrawals: [],
        plans: [],
        tickets: [],
        settings: {},
        stats: {},
        message: 'Mock UI data successfully loaded'
      }
    };
  },
  post: async (url, data) => {
    return { data: { success: true, message: 'Action completed successfully (UI preview)' } };
  },
  put: async (url, data) => {
    return { data: { success: true, message: 'Updated successfully (UI preview)' } };
  },
  delete: async (url) => {
    return { data: { success: true, message: 'Deleted successfully (UI preview)' } };
  }
};

export default api;
