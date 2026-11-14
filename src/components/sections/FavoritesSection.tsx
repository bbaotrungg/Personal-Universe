import { useState, type FC } from 'react';
import { Star, Music, Film, Gamepad2, Utensils, MapPin, Quote, Plus, Pencil } from 'lucide-react';
import type { FavoriteItem } from '../../types';

interface FavoritesSectionProps {
  favorites: FavoriteItem[];
  isOwner?: boolean;
  onEditFavorite?: (item: FavoriteItem) => void;
  onAddFavorite?: () => void;
}

export const FavoritesSection: FC<FavoritesSectionProps> = ({
  favorites,
  isOwner = false,
  onEditFavorite,
  onAddFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả', icon: <Star size={13} /> },
    { id: 'nhac', label: 'Âm nhạc', icon: <Music size={13} /> },
    { id: 'phim', label: 'Phim ảnh', icon: <Film size={13} /> },
    { id: 'game', label: 'Game', icon: <Gamepad2 size={13} /> },
    { id: 'mon-an', label: 'Món ăn', icon: <Utensils size={13} /> },
    { id: 'chon-quen', label: 'Chốn quen', icon: <MapPin size={13} /> },
  ];

  const filteredItems =
    activeCategory === 'all'
      ? favorites
      : favorites.filter((item) => item.category === activeCategory);

  return (
    <section id="yeu-thich" className="space-y-5 pt-8 border-t border-ink-border/50 dark:border-paper-darkBorder">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-solar-light dark:bg-solar/20 text-solar-dark dark:text-amber-300 text-[11px] font-mono font-medium mb-1.5">
            <span>03 • Yêu thích</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-gray-100">
            Những Thứ Gắn Liền 
          </h2>
          <p className="font-sans text-xs sm:text-sm text-ink-muted dark:text-gray-400 mt-1 max-w-xl">
            Một vài bài hát nghe mãi không chán, phim tâm đắc, game gây nghiện, món khoái khẩu và chốn lui tới quen thuộc.
          </p>
        </div>

        {isOwner && onAddFavorite && (
          <button
            onClick={onAddFavorite}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-clay text-white text-xs font-mono font-medium shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Thêm mục yêu thích</span>
          </button>
        )}
      </div>

      {/* Filter Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full max-w-full min-w-0">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-clay text-white shadow-sm scale-105'
                  : 'bg-white dark:bg-paper-darkSurface border border-ink-border/70 dark:border-paper-darkBorder text-ink-muted dark:text-gray-400 hover:text-ink'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-paper-darkSurface border border-ink-border/80 dark:border-paper-darkBorder shadow-soft hover:shadow-polaroid transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Photo & Badge */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-3.5 bg-stone-100 dark:bg-stone-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-sans">
                  {item.tag}
                </div>
                {isOwner && onEditFavorite && (
                  <button
                    onClick={() => onEditFavorite(item)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-ink dark:text-white shadow hover:bg-clay hover:text-white transition-all z-10"
                    title="Sửa mục này"
                    aria-label="Sửa mục yêu thích"
                  >
                    <Pencil size={12} />
                  </button>
                )}
                {item.badge && (
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-stone-900/90 text-clay dark:text-clay-light text-[10px] font-sans font-semibold shadow-sm">
                    {item.badge}
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-gray-100">
                {item.title}
              </h3>
              <p className="text-xs font-sans text-ink-muted dark:text-gray-400 mt-0.5">
                {item.subtitle}
              </p>

              {/* Personal Review Note */}
              <div className="relative mt-3 p-3 rounded-2xl bg-paper-100/80 dark:bg-stone-900/80 border border-ink-border/40 dark:border-stone-800">
                <Quote size={18} className="text-clay/20 absolute -top-1 left-2" />
                <p className="font-sans text-xs text-ink/85 dark:text-gray-200 leading-relaxed pl-1 italic">
                  "{item.whyILoveIt}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
