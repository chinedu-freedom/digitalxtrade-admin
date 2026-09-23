'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '../../../../../components/AdminSidebarLayout';
import RichTextEditor from '../../../../../components/RichTextEditor';
import { ArrowLeft, Plus, X, Trash2, Reply, Paperclip, Loader2, Eye, Download, FileText, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../../lib/api';

export default function AdminTicketViewPage() {
  const routeParams = useParams();
  const ticketId = routeParams?.id;

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ticketStatus, setTicketStatus] = useState('OPEN');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox Modal state
  const [activeAttachment, setActiveAttachment] = useState(null);

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const fetchTicketDetails = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const res = await api.get(`/admin/tickets/${ticketId}`);
      if (res.data.success) {
        setTicket(res.data.ticket);
        setMessages(res.data.ticket.messages || []);
        setTicketStatus(res.data.ticket.status || 'OPEN');
      }
    } catch (err) {
      console.error('Failed to fetch admin ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  // Handle adding an attachment input row
  const handleAddAttachment = () => {
    if (attachments.length >= 5) {
      toast.error('Maximum 5 files can be uploaded.');
      return;
    }
    setAttachments([...attachments, { id: Date.now(), name: 'No file chosen', file: null, type: '', url: '' }]);
  };

  // Handle removing attachment input row
  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  // Handle file change
  const handleFileChange = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setAttachments(
        attachments.map((a) =>
          a.id === id
            ? { ...a, file, name: file.name, type: file.type || 'application/octet-stream', url: dataUrl }
            : a
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSelectReplyTarget = (msg) => {
    setReplyTo({
      id: msg.id,
      sender_name: msg.sender_name,
      text: msg.message,
    });
    if (typeof window !== 'undefined') {
      const el = document.getElementById('admin-reply-textarea');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      toast.success('Message deleted successfully!');
      await api.delete(`/admin/support/messages/${msgId}`);
    } catch (err) {
      console.error('Delete admin message error:', err);
    }
  };

  // Handle Submit Reply
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message.');
      return;
    }

    const attachmentsPayload = attachments
      .filter((a) => a.url)
      .map((a) => ({ name: a.name, type: a.type, url: a.url }));

    try {
      setSubmitting(true);
      const res = await api.post(`/admin/tickets/${ticketId}/reply`, {
        message: replyMessage,
        attachments: attachmentsPayload,
        reply_to_id: replyTo?.id,
        reply_to_name: replyTo?.sender_name,
        reply_to_text: replyTo?.text,
      });

      if (res.data.success) {
        toast.success('Support ticket reply submitted successfully!');
        setReplyMessage('');
        setReplyTo(null);
        setAttachments([]);
        setTicketStatus('REPLIED');
        fetchTicketDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const isImageAttachment = (att) => {
    if (!att) return false;
    const type = att.type || '';
    const url = att.url || (typeof att === 'string' ? att : '');
    return (
      type.startsWith('image/') ||
      url.startsWith('data:image') ||
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)
    );
  };

  // Confirm Close Ticket
  const handleConfirmCloseTicket = async () => {
    try {
      const res = await api.post(`/admin/tickets/${ticketId}/close`);
      if (res.data.success) {
        setTicketStatus('CLOSED');
        setCloseModalOpen(false);
        setShowChatHistory(false);
        toast.success('Support ticket closed successfully.');
        fetchTicketDetails();
      }
    } catch (err) {
      console.error('Close ticket error:', err);
      toast.error(err.response?.data?.message || 'Failed to close ticket');
    }
  };

  // Confirm Reopen Ticket
  const handleConfirmReopenTicket = async () => {
    try {
      const res = await api.post(`/admin/tickets/${ticketId}/reopen`);
      if (res.data.success) {
        setTicketStatus('OPEN');
        setReopenModalOpen(false);
        setShowChatHistory(true);
        toast.success('Support ticket reopened successfully.');
        fetchTicketDetails();
      }
    } catch (err) {
      console.error('Reopen ticket error:', err);
      toast.error(err.response?.data?.message || 'Failed to reopen ticket');
    }
  };

  // Confirm Delete Message
  const handleConfirmDeleteMessage = () => {
    if (selectedMessageId) {
      setMessages(messages.filter((m) => m.id !== selectedMessageId));
      toast.error('Message deleted successfully.');
    }
    setDeleteModalOpen(false);
    setSelectedMessageId(null);
  };

  const isClosed = ticketStatus === 'CLOSED' || ticketStatus === 'Closed';

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Top Header Bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-wide">
            Reply Ticket
          </h1>

          <Link
            href="/admin/tickets/pending"
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-1.5 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        {/* Main Ticket Reply Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Ticket Title & Status Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                  ticketStatus === 'OPEN' || ticketStatus === 'Open'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                    : ticketStatus === 'REPLIED' || ticketStatus === 'Answered'
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-300'
                    : 'bg-red-50 text-red-600 border-red-300'
                }`}
              >
                {ticketStatus}
              </span>
              <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                Ticket {ticket?.ticket_id || `#${ticketId}`}
              </span>
              <h2 className="text-sm font-bold text-slate-800 font-sans">
                <span className="text-slate-400 text-xs font-semibold mr-1">Subject:</span>
                {ticket ? ticket.subject : 'Loading ticket...'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isClosed ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowChatHistory(!showChatHistory)}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#5b5bf5]" />
                    <span>{showChatHistory ? 'Hide Chat' : 'View Chat'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReopenModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reopen Ticket
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(true)}
                  className="bg-[#dc2626] hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Close Ticket
                </button>
              )}
            </div>
          </div>

          {/* Compact Closed Summary Card (Shown when Closed and Chat History Hidden) */}
          {isClosed && !showChatHistory && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-inner">
              <div className="text-xs text-slate-600 font-sans leading-relaxed">
                This support ticket was closed. You can view past messages or reopen the ticket below to continue.
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowChatHistory(true)}
                  className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-2 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#5b5bf5]" /> View Chat History
                </button>
                <button
                  type="button"
                  onClick={() => setReopenModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Reopen Ticket
                </button>
              </div>
            </div>
          )}

          {/* Reply Form (Shown ONLY when ticket is OPEN) */}
          {!isClosed && (
            <form onSubmit={handleReplySubmit} className="space-y-4">
              {/* Active Replying Target Banner */}
              {replyTo && (
                <div className="bg-indigo-50 border-l-4 border-[#5b5bf5] p-3 rounded-lg flex items-center justify-between text-xs text-slate-700 shadow-sm">
                  <div>
                    <span className="font-bold text-[#5b5bf5] text-[11px] uppercase tracking-wider block">
                      ↵ Replying to {replyTo.sender_name}
                    </span>
                    <span className="text-slate-600 italic line-clamp-1">
                      "{replyTo.text}"
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded font-bold transition-all"
                    title="Cancel reply"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={replyMessage}
                  onChange={setReplyMessage}
                  placeholder={replyTo ? `Write reply to ${replyTo.sender_name}...` : "Enter reply here"}
                  minHeight="180px"
                />
              </div>

              {/* Dynamic Attachment Inputs with Live Thumbnail Preview */}
              {attachments.length > 0 && (
                <div className="space-y-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-3">
                      {/* Live Thumbnail Preview if Image */}
                      {att.url && att.type?.startsWith('image/') && (
                        <img
                          src={att.url}
                          alt="Preview"
                          className="w-9 h-9 object-cover rounded border border-slate-200 shrink-0"
                        />
                      )}

                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white max-w-md w-full shadow-sm">
                        <label className="bg-slate-100 border-r border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200 shrink-0">
                          Choose file
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(att.id, e.target.files[0])}
                          />
                        </label>
                        <span className="px-3 text-xs text-slate-500 truncate">
                          {att.name || (att.file ? att.file.name : 'No file chosen')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all shrink-0 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Attachment Button & Notice */}
              <div>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="bg-[#091630] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" /> Add Attachment
                </button>
                <p className="text-[11px] text-[#5b5bf5] font-semibold mt-2">
                  Max 5 files can be uploaded | Maximum upload size is 256MB | Allowed File Extensions: .jpg, .jpeg, .png, .pdf, .doc, .docx
                </p>
              </div>

              {/* Submit Reply Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting
                    </>
                  ) : (
                    <>
                      <Reply className="w-4 h-4" /> Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Integrated Chat Stream Box (Visible if Open OR if View Chat is Toggled) */}
          {(!isClosed || showChatHistory) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto font-sans">
              {messages.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">No messages in this ticket thread yet.</div>
              ) : (
                messages.map((msg) => {
                  const isAdminMsg = msg.sender_type === 'ADMIN';
                  const formattedDate = msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) +
                      ' · ' +
                      new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : '';

                  let parsedAttachments = [];
                  if (msg.attachments) {
                    try {
                      parsedAttachments = typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : msg.attachments;
                    } catch (e) {
                      console.error('Failed to parse message attachments:', e);
                    }
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      {/* Sender Label & Action */}
                      <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                        <span className="font-bold text-slate-800 font-sans">{msg.sender_name}</span>
                        {isAdminMsg ? (
                          <span className="text-[9px] bg-indigo-100 text-[#5b5bf5] border border-indigo-200 px-1.5 py-0.2 rounded uppercase font-bold">
                            Support
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded uppercase font-bold">
                            User
                          </span>
                        )}
                        <span>· {formattedDate}</span>
                        <button
                          type="button"
                          onClick={() => handleSelectReplyTarget(msg)}
                          className="text-[#5b5bf5] hover:underline font-bold ml-1 flex items-center gap-0.5 transition-colors cursor-pointer"
                          title="Reply to this message"
                        >
                          <Reply className="w-3 h-3" />
                          <span className="text-[10px]">Reply</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-slate-400 hover:text-red-500 font-bold ml-1 flex items-center gap-0.5 transition-colors cursor-pointer p-0.5"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Chat Bubble */}
                      <div
                        className={`relative rounded-2xl p-4 text-xs font-sans leading-relaxed max-w-[85%] sm:max-w-[75%] shadow-sm transition-all ${
                          replyTo?.id === msg.id ? 'ring-2 ring-[#5b5bf5]' : ''
                        } ${
                          isAdminMsg
                            ? 'bg-[#5b5bf5] text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                        }`}
                      >
                        {/* Quoted Parent Reply (if replying to an earlier message) */}
                        {msg.reply_to_name && (
                          <div
                            className={`mb-2.5 p-2.5 rounded-xl border-l-4 text-[11px] space-y-0.5 ${
                              isAdminMsg
                                ? 'bg-black/20 border-white/60 text-slate-100'
                                : 'bg-slate-100 border-[#5b5bf5] text-slate-700'
                            }`}
                          >
                            <span
                              className={`font-bold tracking-wide uppercase text-[10px] block ${
                                isAdminMsg ? 'text-indigo-200' : 'text-[#5b5bf5]'
                              }`}
                            >
                              ↵ Replying to {msg.reply_to_name}
                            </span>
                            <span className="italic line-clamp-2">{msg.reply_to_text}</span>
                          </div>
                        )}

                        {typeof msg.message === 'string' && (msg.message.includes('<p>') || msg.message.includes('<div>') || msg.message.includes('<b>') || msg.message.includes('<i>') || msg.message.includes('<u>') || msg.message.includes('<s>') || msg.message.includes('<ol>') || msg.message.includes('<ul>')) ? (
                          <div className="whitespace-pre-wrap font-sans text-xs prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: msg.message }} />
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        )}

                        {/* Inline Attachments Rendering inside Chat Bubble */}
                        {parsedAttachments && parsedAttachments.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/40 flex flex-wrap gap-2">
                            {parsedAttachments.map((att, attIdx) => {
                              const attUrl = typeof att === 'string' ? att : att.url;
                              const attName = typeof att === 'object' && att.name ? att.name : `Attachment ${attIdx + 1}`;
                              const isImg = isImageAttachment(att);

                              if (isImg) {
                                return (
                                  <div
                                    key={attIdx}
                                    onClick={() => setActiveAttachment({ url: attUrl, name: attName, isImg: true })}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/50 max-w-[160px] max-h-[120px] shadow-sm hover:opacity-95 transition-all bg-black/5"
                                  >
                                    <img
                                      src={attUrl}
                                      alt={attName}
                                      className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                      <Eye className="w-4 h-4" /> View
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <button
                                  key={attIdx}
                                  type="button"
                                  onClick={() => setActiveAttachment({ url: attUrl, name: attName, isImg: false })}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all max-w-full cursor-pointer ${
                                    isAdminMsg
                                      ? 'bg-black/20 hover:bg-black/30 text-white border border-white/20'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate max-w-[140px] font-mono text-[11px]">{attName}</span>
                                  <Eye className="w-3.5 h-3.5 shrink-0 text-indigo-500 ml-1" />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Attachment Lightbox Modal */}
        {activeAttachment && (
          <div
            onClick={() => setActiveAttachment(null)}
            className="fixed inset-0 min-h-screen w-full bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Paperclip className="w-4 h-4 text-[#5b5bf5]" />
                  <span className="truncate max-w-md">{activeAttachment.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={activeAttachment.url}
                    download={activeAttachment.name}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#5b5bf5] hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Open / Download
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveAttachment(null)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded font-bold transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Viewer Body */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-2 min-h-[300px]">
                {activeAttachment.isImg ? (
                  <img
                    src={activeAttachment.url}
                    alt={activeAttachment.name}
                    className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-200"
                  />
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <FileText className="w-16 h-16 text-[#5b5bf5] mx-auto animate-pulse" />
                    <p className="text-sm font-semibold text-slate-700">{activeAttachment.name}</p>
                    <a
                      href={activeAttachment.url}
                      download={activeAttachment.name}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs"
                    >
                      <Download className="w-4 h-4" /> Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Close Support Ticket Confirmation Modal */}
        {closeModalOpen && (
          <div
            onClick={() => setCloseModalOpen(false)}
            className="fixed inset-0 min-h-screen w-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 font-sans">
                  Close Support Ticket!
                </h3>
                <button
                  onClick={() => setCloseModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 font-sans">
                Are you want to close this support ticket?
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(false)}
                  className="bg-[#0c1c38] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCloseTicket}
                  className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-md"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Message Confirmation Modal */}
        {deleteModalOpen && (
          <div
            onClick={() => setDeleteModalOpen(false)}
            className="fixed inset-0 min-h-screen w-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 font-sans">
                  Delete Reply!
                </h3>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 font-sans">
                Are you sure you want to delete this reply message?
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="bg-[#0c1c38] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteMessage}
                  className="bg-[#5b5bf5] hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-md"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reopen Support Ticket Confirmation Modal */}
        {reopenModalOpen && (
          <div
            onClick={() => setReopenModalOpen(false)}
            className="fixed inset-0 min-h-screen w-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 font-sans">
                  Reopen Support Ticket!
                </h3>
                <button
                  onClick={() => setReopenModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 font-sans">
                Are you sure you want to reopen this support ticket?
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReopenModalOpen(false)}
                  className="bg-[#0c1c38] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReopenTicket}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-md"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
