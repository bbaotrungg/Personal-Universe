import { useEffect, type FC } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Tag } from 'lucide-react';
import type { MemoryItem } from '../../types';

interface LightboxModalProps {
  memory: MemoryItem | null;
  memories: MemoryItem[];
  onClose: () => void;
  onSelectMemory: (mem: MemoryItem) => void;
}

export const LightboxModal: FC<LightboxModalProps> = ({
  memory,
  memories,
  onClose,
  onSelectMemory,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && memory) {
        navigateStep(-1);
      } else if (e.key === 'ArrowRight' && memory) {
        navigateStep(1);
      }
    };

    if (memory) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [memory]);

  if (!memory) return null;

  const currentIndex = memories.findIndex((m) => m.id === memory.id);

  const navigateStep = (step: number) => {
    const nextIdx = (currentIndex + step + memories.length) % memories.length;
    onSelectMemory(memories[nextIdx]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/75 dark:bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh chi tiết"
    >
      {/* Modal Container */}
      <div
        className="relative max-w-2xl w-full max-h-[92dvh] overflow-y-auto bg-paper-50 dark:bg-paper-darkSurface rounded-3xl p-4 sm:p-6 shadow-2xl border border-ink-border dark:border-paper-darkBorder"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-paper-200/90 dark:bg-paper-dark border border-ink-border/60 text-ink dark:text-gray-200 hover:bg-paper-300 transition-all"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Polaroid Frame */}
        <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-2xl shadow-polaroid border border-stone-200/60 dark:border-stone-800">
          <div className="relative rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-950 aspect-[4/3] sm:aspect-[16/10]">
            <img
              src={memory.imageUrl}
              alt={memory.title}
              className="w-full h-full object-cover"
              loading="eager"
            />

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateStep(-1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/65 text-white backdrop-blur-sm transition-all"
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateStep(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/65 text-white backdrop-blur-sm transition-all"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Polaroid Handwritten Caption */}
          <div className="mt-3 text-center">
            <p className="font-serif italic text-ink/90 dark:text-gray-200 text-sm sm:text-base">
              "{memory.caption}"
            </p>
          </div>
        </div>

        {/* Story & Metadata */}
        <div className="mt-4 px-1">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-ink-border/40 dark:border-paper-darkBorder">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-ink dark:text-gray-100">
              {memory.title}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-paper-200 dark:bg-stone-800 text-ink-muted dark:text-gray-300">
              <Tag size={11} />
              {memory.category}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-ink-muted dark:text-gray-400 mt-2 mb-3">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-clay" />
              {memory.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-sage" />
              {memory.date}
            </span>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-ink/80 dark:text-gray-300 font-sans">
            {memory.story}
          </p>

          {/* Counter Hint */}
          <div className="mt-4 pt-3 flex items-center justify-between text-xs font-mono text-ink-subtle dark:text-gray-500 border-t border-ink-border/30 dark:border-stone-800">
            <span>Khoảnh khắc {currentIndex + 1} / {memories.length}</span>
            <span className="hidden sm:inline">Dùng phím ← / → để chuyển ảnh</span>
          </div>
        </div>
      </div>
    </div>
  );
};
