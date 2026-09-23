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
