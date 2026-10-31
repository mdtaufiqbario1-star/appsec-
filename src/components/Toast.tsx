import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-900/95 border border-red-900/70 text-slate-100 shadow-2xl backdrop-blur-md max-w-sm w-[90%] transition-all animate-in fade-in slide-in-from-top-2">
      <div className="shrink-0 text-red-500">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-red-400" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-red-400" />}
      </div>
      <p className="text-xs sm:text-sm font-medium flex-1 text-slate-200">{toast.text}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
