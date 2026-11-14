import type { FC } from 'react';
import { Moon, Sun, Share2 } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  name?: string;
  onToggleDark: () => void;
  onOpenQR: () => void;
}

export const Header: FC<HeaderProps> = ({
  isDark,
  name = 'Minh Quân',
  onToggleDark,
  onOpenQR,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper-100/90 dark:bg-paper-dark/90 border-b border-ink-border/50 dark:border-paper-darkBorder transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <a
          href="#gioi-thieu"
          className="group flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-clay/10 dark:bg-clay/20 flex items-center justify-center text-clay font-serif font-bold text-sm border border-clay/30 group-hover:scale-105 transition-all">
            ✦
          </div>
          <div>
            <span className="font-serif font-semibold text-sm sm:text-base tracking-tight text-ink dark:text-gray-100 flex items-center gap-1.5">
              {name}
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            </span>
            <span className="block text-[10px] font-mono text-ink-subtle dark:text-gray-400">
              Góc nhỏ cá nhân • Digital Card
            </span>
          </div>
        </a>

        {/* Right: Controls (Dark mode, Share) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDark}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-paper-200/70 dark:bg-paper-darkSurface text-ink-muted dark:text-gray-300 border border-ink-border/50 dark:border-paper-darkBorder hover:text-ink dark:hover:text-white transition-all text-xs font-mono"
            title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
            aria-label="Đổi giao diện Sáng / Tối"
          >
            {isDark ? (
              <>
                <Sun size={14} className="text-solar" />
                <span className="hidden sm:inline">Sáng</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-periwinkle" />
                <span className="hidden sm:inline">Tối</span>
              </>
            )}
          </button>

          {/* Share Button (mở popup chia sẻ & mã QR) */}
          <button
            onClick={onOpenQR}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-clay text-white shadow-sm hover:brightness-105 active:scale-95 transition-all text-xs font-medium"
            title="Chia sẻ danh thiếp & Mã QR"
            aria-label="Chia sẻ"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
