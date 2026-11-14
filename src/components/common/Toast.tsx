import type { FC } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border text-xs font-sans animate-fade-in ${
            t.type === 'success'
              ? 'bg-stone-900 text-white border-sage/40 dark:bg-stone-800'
              : t.type === 'error'
              ? 'bg-red-950 text-white border-red-500/50'
              : 'bg-stone-900 text-white border-ink-border'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle2 size={16} className="text-sage shrink-0" />}
            {t.type === 'error' && <AlertCircle size={16} className="text-red-400 shrink-0" />}
            {t.type === 'info' && <Info size={16} className="text-periwinkle shrink-0" />}
            <span className="leading-snug">{t.message}</span>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Đóng thông báo"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
