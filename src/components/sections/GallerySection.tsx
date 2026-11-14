import { useState, type FC } from 'react';
import { Sparkles, MapPin, Calendar, Maximize2, Plus, Pencil } from 'lucide-react';
import type { MemoryItem } from '../../types';

interface GallerySectionProps {
  memories: MemoryItem[];
  onSelectMemory: (mem: MemoryItem) => void;
  isOwner?: boolean;
  onEditMemory?: (item: MemoryItem) => void;
  onAddMemory?: () => void;
}

export const GallerySection: FC<GallerySectionProps> = ({
  memories,
  onSelectMemory,
  isOwner = false,
  onEditMemory,
  onAddMemory,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Tất cả');

  const categories = ['Tất cả', 'Du lịch', 'Đời thường', 'Ẩm thực', 'Góc riêng', 'Ảnh film'];

  const filtered = selectedFilter === 'Tất cả'
    ? memories
    : memories.filter((m) => m.category === selectedFilter);

  const getTapeClass = (color?: string) => {
    switch (color) {
      case 'coral': return 'washi-tape washi-tape-coral';
      case 'sage': return 'washi-tape washi-tape-sage';
      case 'periwinkle': return 'washi-tape washi-tape-periwinkle';
      default: return 'washi-tape';
    }
  };

  return (
    <section id="hinh-anh" className="space-y-5 pt-8 border-t border-ink-border/50 dark:border-paper-darkBorder">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-clay-light dark:bg-clay/20 text-clay-dark dark:text-clay-light text-[11px] font-mono font-medium mb-1.5">
            <span>05 • Hình ảnh</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-gray-100">
            Khoảnh Khắc Đời Thường
          </h2>
          <p className="font-sans text-xs sm:text-sm text-ink-muted dark:text-gray-400 mt-1 max-w-xl">
            Một vài bức ảnh chụp lại mà tôi cho thú vị, bởi vì tôi thích thế, làm sao.
          </p>
        </div>

        {isOwner && onAddMemory && (
          <button
            onClick={onAddMemory}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-clay text-white text-xs font-mono font-medium shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Thêm ảnh Polaroid</span>
          </button>
        )}
      </div>

      {/* Filter Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full max-w-full min-w-0">
        {categories.map((cat) => {
          const isActive = selectedFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-clay text-white shadow-sm scale-105'
                  : 'bg-white dark:bg-paper-darkSurface border border-ink-border/70 dark:border-paper-darkBorder text-ink-muted dark:text-gray-400 hover:text-ink'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Polaroid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
        {filtered.map((memory) => (
          <div
            key={memory.id}
            onClick={() => onSelectMemory(memory)}
            className={`group relative p-3 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-polaroid hover:shadow-polaroid-lg transition-all duration-300 cursor-pointer hover:-translate-y-1.5 ${
              memory.rotation || ''
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectMemory(memory);
              }
            }}
            aria-label={`Xem ảnh: ${memory.title}`}
          >
            {/* Washi Tape Accent */}
            <div
              className={`${getTapeClass(memory.tapeColor)} -top-2.5 left-1/2 -translate-x-1/2 w-20 sm:w-24 group-hover:scale-105 transition-transform`}
            />

            {/* Photo Container */}
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-stone-100 dark:bg-stone-950">
              <img
                src={memory.imageUrl}
                alt={memory.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-2 rounded-full bg-white/90 text-ink shadow-md backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
                  <Maximize2 size={16} />
                </span>
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/55 text-white backdrop-blur-sm text-[10px] font-sans">
                {memory.category}
              </div>
              {isOwner && onEditMemory && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMemory(memory);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-ink dark:text-white shadow hover:bg-clay hover:text-white transition-all z-20"
                  title="Sửa ảnh này"
                  aria-label="Sửa ảnh"
                >
                  <Pencil size={12} />
                </button>
              )}
            </div>

            {/* Caption */}
            <div className="pt-3 pb-1 px-1">
              <div className="font-serif font-semibold text-sm sm:text-base text-ink dark:text-gray-100 truncate">
                {memory.title}
              </div>
              <p className="font-serif italic text-xs text-ink-muted dark:text-gray-400 mt-1 line-clamp-1">
                "{memory.caption}"
              </p>
              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-mono text-ink-subtle dark:text-gray-500">
                <span className="flex items-center gap-1 truncate max-w-[130px]">
                  <MapPin size={11} className="text-clay shrink-0" />
                  <span className="truncate">{memory.location}</span>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar size={11} className="text-sage" />
                  {memory.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <p className="text-xs font-mono text-ink-subtle dark:text-gray-500 flex items-center justify-center gap-1.5">
          <Sparkles size={13} className="text-clay" />
          <span>Bấm vào ảnh để phóng to và đọc mô tả suy nghĩ của tôi về mỗi ảnh nè (như locket nhể kk)</span>
        </p>
      </div>
    </section>
  );
};
