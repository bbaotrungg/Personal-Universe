import { useState, type FC, type FormEvent, useEffect, useRef } from 'react';
import { KeyRound, Lock, Eye, EyeOff, X, AlertCircle, Loader2 } from 'lucide-react';
import { verifyOwnerCode } from '../../services/api';

interface OwnerAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (token: string) => void;
}

export const OwnerAccessModal: FC<OwnerAccessModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAccessCode('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const session = await verifyOwnerCode(accessCode.trim());
      sessionStorage.setItem('owner_token', session.token);
      onAuthenticated(session.token);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Mã truy cập không hợp lệ.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-sm w-full bg-paper-50 dark:bg-paper-darkSurface rounded-3xl p-6 shadow-2xl border border-ink-border dark:border-paper-darkBorder text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-paper-200/80 dark:bg-paper-dark border border-ink-border/60 text-ink dark:text-gray-300 hover:bg-paper-300 transition-all"
          aria-label="Đóng"
        >
          <X size={16} />
        </button>

        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-solar-light dark:bg-solar/20 text-solar-dark dark:text-solar flex items-center justify-center">
          <KeyRound size={24} />
        </div>

        <h3 className="font-serif font-bold text-xl text-ink dark:text-gray-100">
          Xác thực Chủ sở hữu
        </h3>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-1 mb-5">
          Nhập mã truy cập để kích hoạt chế độ chỉnh sửa trực tiếp website.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative text-left">
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              MÃ TRUY CẬP (ACCESS CODE)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-subtle">
                <Lock size={16} />
              </div>
              <input
                ref={inputRef}
                type={showCode ? 'text' : 'password'}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Nhập mã truy cập của bạn..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay font-mono placeholder:font-sans"
                autoComplete="off"
                required
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-subtle hover:text-ink dark:hover:text-white"
                aria-label={showCode ? 'Ẩn mã' : 'Hiện mã'}
              >
                {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-2 text-left">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span className="text-xs text-red-600 dark:text-red-400 font-sans leading-tight">
                {error}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-paper-200 dark:bg-stone-800 text-ink dark:text-gray-200 text-xs font-medium border border-ink-border/60 hover:bg-paper-300 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !accessCode.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-clay text-white text-xs font-medium shadow-clay hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <span>Mở chế độ chỉnh sửa</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
