import { useState, type FC } from 'react';
import { Mail, Copy, Check, ExternalLink, Share2, Plus, Pencil } from 'lucide-react';
import {
  FacebookIcon,
  InstagramIcon,
  GithubIcon,
  SpotifyIcon,
  DiscordIcon,
} from '../common/BrandIcons';
import type { SocialLink } from '../../types';

interface SocialSectionProps {
  socialLinks: SocialLink[];
  onOpenQR: () => void;
  isOwner?: boolean;
  onEditSocial?: (item: SocialLink) => void;
  onAddSocial?: () => void;
}

export const SocialSection: FC<SocialSectionProps> = ({
  socialLinks,
  onOpenQR,
  isOwner = false,
  onEditSocial,
  onAddSocial,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (link: SocialLink) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link.username);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const renderSocialIcon = (name: string) => {
    const size = 20;
    switch (name) {
      case 'Facebook': return <FacebookIcon size={size} />;
      case 'Instagram': return <InstagramIcon size={size} />;
      case 'Spotify': return <SpotifyIcon size={size} />;
      case 'Github': return <GithubIcon size={size} />;
      case 'Discord': return <DiscordIcon size={size} />;
      case 'Mail': return <Mail size={size} />;
      default: return <ExternalLink size={size} />;
    }
  };

  return (
    <section id="lien-he" className="space-y-6 pt-8 pb-4 border-t border-ink-border/50 dark:border-paper-darkBorder">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-clay-light dark:bg-clay/20 text-clay-dark dark:text-clay-light text-[11px] font-mono font-medium mb-1.5">
            <span>06 • Liên hệ</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-gray-100">
            Thông Tin Mạng Xã Hội
          </h2>
          <p className="font-sans text-xs sm:text-sm text-ink-muted dark:text-gray-400 mt-1 max-w-xl">
            Nếu muốn nhắn tin, xàm xí, hẹn cà phê hay đi quậy, hãy cứ theo cách bên dưới mà chọn kk
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isOwner && onAddSocial && (
            <button
              onClick={onAddSocial}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-clay text-white text-xs font-mono font-medium shadow-sm hover:brightness-105 active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>Thêm liên kết</span>
            </button>
          )}

          <button
            onClick={onOpenQR}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-paper-200 dark:bg-stone-800 text-ink dark:text-gray-200 text-xs font-sans font-medium border border-ink-border/60 hover:bg-paper-300 transition-all"
            title="Chia sẻ danh thiếp & Mã QR"
          >
            <Share2 size={15} className="text-clay" />
            <span>Chia Sẻ</span>
          </button>
        </div>
      </div>

      {/* Social Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {socialLinks.map((link) => {
          const isCopied = copiedId === link.id;

          return (
            <div
              key={link.id}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-paper-darkSurface border border-ink-border/80 dark:border-paper-darkBorder shadow-soft hover:shadow-polaroid transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-paper-200/80 dark:bg-stone-800 text-clay">
                    {renderSocialIcon(link.iconName)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {link.badge && (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-paper-100 dark:bg-stone-800 text-ink-muted dark:text-gray-300 border border-ink-border/40">
                        {link.badge}
                      </span>
                    )}
                    {isOwner && onEditSocial && (
                      <button
                        onClick={() => onEditSocial(link)}
                        className="p-1 rounded-lg bg-paper-100 dark:bg-stone-800 hover:bg-clay hover:text-white text-ink-muted dark:text-gray-300 transition-colors"
                        title="Sửa liên kết này"
                        aria-label="Sửa liên kết"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-ink dark:text-gray-100">
                  {link.platform}
                </h3>
                <p className="text-xs font-mono text-clay dark:text-clay-light mt-0.5 truncate">
                  {link.username}
                </p>
                <p className="text-xs text-ink-muted dark:text-gray-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                  {link.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-ink-border/30 dark:border-stone-800 flex items-center gap-2">
                <button
                  onClick={() => handleCopy(link)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-paper-100 dark:bg-stone-800 text-xs font-sans text-ink-muted dark:text-gray-300 hover:text-ink hover:bg-paper-200 transition-all"
                  title="Sao chép tên tài khoản"
                >
                  {isCopied ? (
                    <>
                      <Check size={12} className="text-sage" />
                      <span className="text-sage font-medium">Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Sao chép ID</span>
                    </>
                  )}
                </button>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 rounded-xl bg-clay text-white shadow-sm hover:brightness-105 transition-all"
                  aria-label={`Mở trang ${link.platform}`}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
