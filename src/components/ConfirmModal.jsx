'use client';

import { createPortal } from 'react-dom';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  loading = false,
}) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scaleUp"
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-7 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div
            className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isDanger
                ? 'bg-red-50 text-[#ff0044] border border-red-100'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}
          >
            {isDanger ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-slate-800 font-sans mb-2">
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-sans leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs font-sans transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
            className={`flex-1 py-2.5 text-white font-bold rounded-xl text-xs font-sans transition-all cursor-pointer shadow-md disabled:opacity-50 ${
              isDanger
                ? 'bg-[#ff0044] hover:bg-[#e0003c] shadow-red-500/20'
                : 'bg-[#5b5bf5] hover:bg-indigo-600 shadow-indigo-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
