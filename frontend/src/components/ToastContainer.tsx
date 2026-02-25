import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-card border backdrop-blur-sm animate-in slide-in-from-right-5 duration-300 ${
            toast.variant === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : toast.variant === 'error'
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-gold/10 border-gold/30 text-gold'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.variant === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.variant === 'error' && <XCircle className="w-5 h-5" />}
            {toast.variant === 'info' && <Info className="w-5 h-5" />}
          </div>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
