import type { FC } from 'react';
import { Send, X, AlertTriangle, Loader2 } from 'lucide-react';

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
}

export const PublishConfirmModal: FC<PublishConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPublishing,
}) => {
  if (!isOpen) return null;

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

        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-sage/20 text-sage-dark dark:text-sage flex items-center justify-center">
          <Send size={24} />
        </div>

        <h3 className="font-serif font-bold text-xl text-ink dark:text-gray-100">
          Xuất bản trang cá nhân?
        </h3>
        <p className="text-xs text-ink-muted dark:text-gray-300 mt-2 mb-4 leading-relaxed">
          Tất cả thay đổi trong bản nháp hiện tại sẽ được áp dụng trực tiếp cho trang web công khai. Bất kỳ ai truy cập qua liên kết hoặc mã QR sẽ thấy phiên bản mới này ngay lập tức.
        </p>

        <div className="p-3 mb-5 rounded-xl bg-solar-light/60 dark:bg-solar/10 border border-solar/40 flex items-center gap-2 text-left">
          <AlertTriangle size={16} className="text-solar-dark shrink-0" />
          <span className="text-[11px] text-ink-muted dark:text-gray-300">
            Bạn luôn có thể tiếp tục chỉnh sửa và xuất bản các phiên bản tiếp theo bất cứ lúc nào.
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPublishing}
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-paper-200 dark:bg-stone-800 text-ink dark:text-gray-200 text-xs font-medium border border-ink-border/60 hover:bg-paper-300 transition-all"
          >
            Để sau
          </button>
          <button
            type="button"
            disabled={isPublishing}
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sage text-white text-xs font-medium shadow-sm hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPublishing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang xuất bản...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Xuất bản ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
