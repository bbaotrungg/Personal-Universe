import type { FC } from 'react';
import { Headphones, Coffee, Gamepad2, Camera, Code2, BookOpen, Plus, Pencil } from 'lucide-react';
import type { InterestItem } from '../../types';

interface InterestsSectionProps {
  interests: InterestItem[];
  isOwner?: boolean;
  onEditInterest?: (item: InterestItem) => void;
  onAddInterest?: () => void;
}

export const InterestsSection: FC<InterestsSectionProps> = ({
  interests,
  isOwner = false,
  onEditInterest,
  onAddInterest,
}) => {
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Headphones': return <Headphones size={20} className="text-periwinkle" />;
      case 'Coffee': return <Coffee size={20} className="text-clay" />;
      case 'Gamepad2': return <Gamepad2 size={20} className="text-solar-dark" />;
      case 'Camera': return <Camera size={20} className="text-sage" />;
      case 'Code2': return <Code2 size={20} className="text-clay" />;
      case 'BookOpen': return <BookOpen size={20} className="text-sage" />;
      default: return <Coffee size={20} className="text-clay" />;
    }
  };

  return (
    <section id="so-thich" className="space-y-5 pt-8 border-t border-ink-border/50 dark:border-paper-darkBorder">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage-light dark:bg-sage/20 text-sage-dark dark:text-emerald-300 text-[11px] font-mono font-medium mb-1.5">
            <span>02 • Sở thích</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-gray-100">
            Những Điều Thích Làm
          </h2>
          <p className="font-sans text-xs sm:text-sm text-ink-muted dark:text-gray-400 mt-1 max-w-xl">
            Những thú vui và thói quen sau những giờ học tập và làm việc mệt mỏiii.
          </p>
        </div>

        {isOwner && onAddInterest && (
          <button
            onClick={onAddInterest}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage text-white text-xs font-mono font-medium shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Thêm sở thích</span>
          </button>
        )}
      </div>

      {/* Interests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interests.map((interest) => (
          <div
            key={interest.id}
            className="p-5 rounded-3xl bg-white dark:bg-paper-darkSurface border border-ink-border/80 dark:border-paper-darkBorder shadow-soft hover:shadow-polaroid transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-2xl bg-paper-200/80 dark:bg-stone-800">
                  {renderIcon(interest.iconName)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-ink-subtle px-2 py-0.5 rounded-full bg-paper-100 dark:bg-stone-800">
                    {interest.category}
                  </span>
                  {isOwner && onEditInterest && (
                    <button
                      onClick={() => onEditInterest(interest)}
                      className="p-1 rounded-lg bg-paper-200 dark:bg-stone-800 hover:bg-clay hover:text-white text-ink-muted dark:text-gray-300 transition-colors"
                      title="Sửa sở thích này"
                      aria-label="Sửa sở thích"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-gray-100 mb-1.5">
                {interest.title}
              </h3>

              <p className="font-sans text-xs sm:text-sm text-ink-muted dark:text-gray-300 leading-relaxed mb-4">
                {interest.description}
              </p>
            </div>

            {/* Tags & Gear */}
            <div className="space-y-2 pt-3 border-t border-ink-border/30 dark:border-stone-800">
              <div className="flex flex-wrap gap-1.5">
                {interest.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-sans px-2.5 py-1 rounded-xl bg-paper-100 dark:bg-stone-800 text-ink-muted dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {interest.gearOrFavorites && interest.gearOrFavorites.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {interest.gearOrFavorites.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-solar-light/80 dark:bg-solar/15 text-solar-dark dark:text-amber-300"
                    >
                      ✦ {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
