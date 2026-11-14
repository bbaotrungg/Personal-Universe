import type { FC } from 'react';
import { Heart, ThumbsDown, Check, Sparkles, Smile, Pencil } from 'lucide-react';
import type { PersonalityData } from '../../types';

interface PersonalitySectionProps {
  data: PersonalityData;
  isOwner?: boolean;
  onEdit?: () => void;
}

export const PersonalitySection: FC<PersonalitySectionProps> = ({
  data,
  isOwner = false,
  onEdit,
}) => {
  return (
    <section id="tinh-cach" className="space-y-6 pt-8 border-t border-ink-border/50 dark:border-paper-darkBorder">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-periwinkle-light dark:bg-periwinkle/20 text-periwinkle dark:text-purple-300 text-[11px] font-mono font-medium mb-1.5">
            <span>04 • Một chút về tôi</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-gray-100">
            Tính Cách & Thói Quen
          </h2>
          <p className="font-sans text-xs sm:text-sm text-ink-muted dark:text-gray-400 mt-1 max-w-xl">
            Vài nét tính cách, thói quen thường nhật và những điều lặt vặt, ngớ ngẩn làm nên con người này.
          </p>
        </div>

        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-clay text-white text-xs font-mono font-medium shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Pencil size={13} />
            <span>Chỉnh sửa mục này</span>
          </button>
        )}
      </div>

      {/* Traits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {data.traits.map((trait, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-paper-darkSurface border border-ink-border/70 dark:border-paper-darkBorder shadow-soft flex items-start gap-3.5"
          >
            <span className="text-2xl shrink-0 p-2 rounded-2xl bg-paper-100 dark:bg-stone-800">
              {trait.emoji}
            </span>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-gray-100 mb-1">
                {trait.title}
              </h3>
              <p className="font-sans text-xs text-ink-muted dark:text-gray-300 leading-relaxed">
                {trait.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Habits Grid */}
      <div>
        <h3 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-gray-100 mb-3 flex items-center gap-2">
          <Smile size={18} className="text-solar" />
          <span>Thói Quen Thường Ngày</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {data.habits.map((habit, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-paper-100/90 dark:bg-stone-900 border border-ink-border/60 dark:border-stone-800 flex items-start gap-3"
            >
              <span className="text-xl shrink-0">{habit.emoji}</span>
              <div>
                <h4 className="font-sans font-semibold text-xs sm:text-sm text-ink dark:text-gray-200 mb-0.5">
                  {habit.title}
                </h4>
                <p className="font-sans text-xs text-ink-muted dark:text-gray-400 leading-snug">
                  {habit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Likes vs Dislikes (Side-by-side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Likes */}
        <div className="p-5 rounded-3xl bg-sage-light/50 dark:bg-sage/10 border border-sage/30 shadow-soft">
          <div className="flex items-center gap-2 mb-3 text-sage-dark dark:text-emerald-300 font-serif font-bold text-base">
            <Heart size={18} className="text-sage" />
            <span>Những Điều Cực Thích</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm font-sans text-ink dark:text-gray-200">
            {data.likes.map((like, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check size={14} className="text-sage shrink-0 mt-0.5" />
                <span>{like}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dislikes */}
        <div className="p-5 rounded-3xl bg-clay-light/50 dark:bg-clay/10 border border-clay/30 shadow-soft">
          <div className="flex items-center gap-2 mb-3 text-clay-dark dark:text-clay-light font-serif font-bold text-base">
            <ThumbsDown size={18} className="text-clay" />
            <span>Những Điều Không Thích Lắm</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm font-sans text-ink dark:text-gray-200">
            {data.dislikes.map((dislike, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-clay shrink-0 mt-1.5" />
                <span>{dislike}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Random Fun Facts Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-solar-light/70 dark:bg-stone-800/80 border border-solar/40 dark:border-stone-700 shadow-soft">
        <div className="flex items-center gap-2 mb-3 text-solar-dark dark:text-amber-300 font-serif font-bold text-base">
          <Sparkles size={18} />
          <span>Vài Sự Thật Ngẫu Nhiên (Vớ Vẩn thoi)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.randomFacts.map((fact, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-solar/30 dark:border-stone-800 text-xs text-ink dark:text-gray-300 font-sans flex items-start gap-2"
            >
              <span className="font-mono text-solar-dark font-bold">#{idx + 1}</span>
              <span>{fact}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
