import type { FC } from 'react';
import { Save, Eye, EyeOff, Send, Share2, LogOut, Loader2 } from 'lucide-react';

interface OwnerControlBarProps {
  isDraftDirty: boolean;
  isPreviewMode: boolean;
  isSaving: boolean;
  onTogglePreview: () => void;
  onSaveDraft: () => void;
  onOpenPublishModal: () => void;
  onOpenQR: () => void;
  onLogout: () => void;
}

export const OwnerControlBar: FC<OwnerControlBarProps> = ({
  isDraftDirty,
  isPreviewMode,
  isSaving,
  onTogglePreview,
  onSaveDraft,
  onOpenPublishModal,
  onOpenQR,
  onLogout,
}) => {
  return (
    <aside
      aria-label="Thanh điều khiển chủ sở hữu"
      className="sticky top-14 sm:top-16 z-30 w-full bg-clay/95 dark:bg-stone-900/95 backdrop-blur-md text-white border-b border-white/20 shadow-md transition-all duration-300"
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Status Pill & Label */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/25">
            <span className="w-2 h-2 rounded-full bg-solar animate-pulse" />
            <span className="font-mono font-medium text-[11px] sm:text-xs">
              {isPreviewMode ? 'Chế độ Xem trước' : 'Chế độ Chỉnh sửa'}
            </span>
          </div>

          {isDraftDirty && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-solar-light">
              <span className="w-1.5 h-1.5 rounded-full bg-solar" />
              Chưa lưu
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle Preview Button */}
          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isPreviewMode
                ? 'bg-solar text-ink font-semibold shadow-sm'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title={isPreviewMode ? 'Bật chế độ chỉnh sửa' : 'Xem thử giao diện công khai'}
          >
            {isPreviewMode ? (
              <>
                <EyeOff size={14} />
                <span className="hidden sm:inline">Tiếp tục sửa</span>
                <span className="sm:hidden">Sửa</span>
              </>
            ) : (
              <>
                <Eye size={14} />
                <span className="hidden sm:inline">Xem trước</span>
                <span className="sm:hidden">Xem</span>
              </>
            )}
          </button>

          {/* Save Draft Button */}
          <button
            onClick={onSaveDraft}
            disabled={isSaving || !isDraftDirty}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isDraftDirty
                ? 'bg-solar text-ink font-bold shadow-sm hover:brightness-105 active:scale-95'
                : 'bg-white/10 text-white/60 cursor-not-allowed'
            }`}
            title="Lưu các thay đổi vào bản nháp"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="hidden sm:inline">Đang lưu...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Lưu nháp</span>
              </>
            )}
          </button>

          {/* Publish Button */}
          <button
            onClick={onOpenPublishModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage text-white text-xs font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all"
            title="Xuất bản ra trang công khai"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Xuất bản</span>
            <span className="sm:hidden">Xuất bản</span>
          </button>

          {/* Share & QR Modal button */}
          <button
            onClick={onOpenQR}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all"
            title="Xem mã QR & Liên kết chia sẻ"
            aria-label="Chia sẻ & Mã QR"
          >
            <Share2 size={15} />
          </button>

          {/* Exit / Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 rounded-xl bg-black/25 hover:bg-black/40 text-white/90 hover:text-white transition-all text-xs"
            title="Đăng xuất khỏi Owner Mode"
            aria-label="Đăng xuất"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
