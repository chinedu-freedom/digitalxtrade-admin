'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebarLayout from '../../../../components/AdminSidebarLayout';
import Pagination from '../../../../components/Pagination';
import { Search, Monitor } from 'lucide-react';
import api from '../../../../lib/api';

export default function AdminTicketsFilteredPage({
  title = 'Pending Tickets',
  statusFilter = 'Pending',
}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'Closed' && t.status !== 'CLOSED') return false;
    if (statusFilter === 'Answered' && t.status !== 'REPLIED') return false;
    if (statusFilter === 'Pending' && t.status === 'CLOSED') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const subjectStr = String(t.subject || '').toLowerCase();
      const ticketIdStr = String(t.ticket_id || '').toLowerCase();
      const userName = String(t.user?.full_name || t.user?.username || '').toLowerCase();
      return subjectStr.includes(q) || userName.includes(q) || ticketIdStr.includes(q);
    }
    return true;
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            {title}
          </h1>

          {/* Search Box Control */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here..."
              className="w-56 sm:w-64 h-10 bg-transparent border-0 outline-none px-3.5 text-xs text-slate-800 font-sans"
            />
            <button className="h-10 bg-[#5b5bf5] hover:bg-indigo-600 text-white px-3.5 flex items-center justify-center shrink-0 cursor-pointer">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Tickets Table Container (Matching Exact Reference Screenshot 1) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Vibrant Indigo Table Header */}
              <thead>
                <tr className="bg-[#5b5bf5] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6 text-center">Submitted By</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Priority</th>
                  <th className="py-3.5 px-6">Last Reply</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      No tickets found in this category
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const ticketIdClean = (t.ticket_id || '').replace('#', '');
                    const userName = t.user ? (t.user.full_name || t.user.username || t.user.email) : 'User';
                    const lastReplyDate = t.messages && t.messages.length > 0 && t.messages[0].created_at
                      ? new Date(t.messages[0].created_at).toLocaleString('en-US', { hour12: true })
                      : t.updated_at
                      ? new Date(t.updated_at).toLocaleString('en-US', { hour12: true })
                      : 'Recently';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Subject Column */}
                        <td className="py-4 px-6 font-bold text-[#5b5bf5]">
                          <Link href={`/admin/ticket/view/${ticketIdClean}`} className="hover:underline">
                            [{t.ticket_id}] {t.subject}
                          </Link>
                        </td>

                        {/* Submitted By Column */}
                        <td className="py-4 px-6 text-center font-bold text-[#5b5bf5]">
                          {userName}
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-3 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap inline-flex items-center justify-center ${
                              t.status === 'OPEN'
                                ? 'bg-emerald-50 text-emerald-500 border-emerald-300'
                                : t.status === 'REPLIED'
                                ? 'bg-indigo-50 text-indigo-500 border-indigo-300'
                                : 'bg-red-50 text-red-500 border-red-300'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        {/* Priority Column */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-3 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap inline-flex items-center justify-center ${
                              t.priority === 'High'
                                ? 'text-red-500 border-red-300 bg-red-50/40'
                                : t.priority === 'Medium'
                                ? 'text-amber-500 border-amber-300 bg-amber-50/40'
                                : 'text-emerald-500 border-emerald-300 bg-emerald-50/40'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>

                        {/* Last Reply Column */}
                        <td className="py-4 px-6 text-slate-500 font-medium">{lastReplyDate}</td>

                        {/* Action Column */}
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/admin/ticket/view/${ticketIdClean}`}
                            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Monitor className="w-3.5 h-3.5" /> Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Utility Footer */}
          <Pagination
            currentPage={1}
            totalPages={Math.max(1, Math.ceil(filteredTickets.length / 15))}
            totalResults={filteredTickets.length}
            pageSize={15}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
