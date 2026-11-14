import type { FC, ReactNode } from 'react';
import { User, Compass, Star, Sparkles, Image, MessageCircle } from 'lucide-react';
import type { SectionId } from '../../types';

interface NavigationDockProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
}

interface NavItem {
  id: SectionId;
  label: string;
  icon: ReactNode;
}

export const NavigationDock: FC<NavigationDockProps> = ({ activeSection, onNavigate }) => {
  const items: NavItem[] = [
    { id: 'gioi-thieu', label: 'Giới thiệu', icon: <User size={17} /> },
    { id: 'so-thich', label: 'Sở thích', icon: <Compass size={17} /> },
    { id: 'yeu-thich', label: 'Yêu thích', icon: <Star size={17} /> },
    { id: 'tinh-cach', label: 'Tính cách', icon: <Sparkles size={17} /> },
    { id: 'hinh-anh', label: 'Hình ảnh', icon: <Image size={17} /> },
    { id: 'lien-he', label: 'Liên hệ', icon: <MessageCircle size={17} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-safe">
      <div className="max-w-md md:max-w-lg mx-auto px-3 pb-3 pt-1 pointer-events-auto">
        <nav
          className="flex items-center justify-between gap-1 p-1.5 rounded-2xl bg-paper-50/95 dark:bg-paper-darkSurface/95 backdrop-blur-xl border border-ink-border/80 dark:border-paper-darkBorder shadow-polaroid-lg"
          aria-label="Điều hướng các mục"
        >
          {items.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1.5 sm:px-3 rounded-xl transition-all min-w-[48px] min-h-[46px] select-none ${
                  isActive
                    ? 'text-clay dark:text-clay-light font-semibold scale-105'
                    : 'text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-gray-200'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Chuyển đến phần ${item.label}`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-clay/10 dark:bg-clay/20 rounded-xl border border-clay/20 -z-10 animate-fade-in" />
                )}

                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-[10px] font-sans tracking-tight mt-0.5 whitespace-nowrap">
                  {item.label}
                </span>

                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-clay dark:bg-clay-light" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
