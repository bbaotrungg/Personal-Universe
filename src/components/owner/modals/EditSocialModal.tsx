import { useState, useEffect, type FC, type FormEvent } from 'react';
import { X, Share2, Trash2 } from 'lucide-react';
import type { SocialLink } from '../../../types';

interface EditSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: SocialLink | null;
  onSave: (saved: SocialLink) => void;
  onDelete?: (id: string) => void;
}

const PLATFORMS: Array<{ name: string; icon: string; defaultColor: string }> = [
  { name: 'Facebook', icon: 'Facebook', defaultColor: '#1877F2' },
  { name: 'Instagram', icon: 'Instagram', defaultColor: '#E4405F' },
  { name: 'GitHub', icon: 'Github', defaultColor: '#24292e' },
  { name: 'Spotify', icon: 'Spotify', defaultColor: '#1DB954' },
  { name: 'LinkedIn', icon: 'Linkedin', defaultColor: '#0A66C2' },
  { name: 'Telegram', icon: 'Send', defaultColor: '#26A5E4' },
  { name: 'TikTok', icon: 'TikTok', defaultColor: '#000000' },
  { name: 'Zalo / Phone', icon: 'MessageCircle', defaultColor: '#0068FF' },
  { name: 'Email', icon: 'Mail', defaultColor: '#EA4335' },
];

export const EditSocialModal: FC<EditSocialModalProps> = ({
  isOpen,
  onClose,
  link,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<SocialLink>({
    id: `soc-${Date.now()}`,
    platform: 'Facebook',
    username: '',
    url: '',
    iconName: 'Facebook',
    badge: '',
    color: '#1877F2',
    description: '',
  });

  useEffect(() => {
    if (link) {
      setFormData(link);
    } else {
      setFormData({
        id: `soc-${Date.now()}`,
        platform: 'Facebook',
        username: '',
        url: '',
        iconName: 'Facebook',
        badge: '',
        color: '#1877F2',
        description: '',
      });
    }
  }, [link, isOpen]);

  if (!isOpen) return null;

  const handlePlatformSelect = (plat: typeof PLATFORMS[0]) => {
    setFormData((prev) => ({
      ...prev,
      platform: plat.name,
      iconName: plat.icon,
      color: plat.defaultColor,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-md w-full bg-paper-50 dark:bg-paper-darkSurface rounded-3xl p-5 sm:p-6 shadow-2xl border border-ink-border dark:border-paper-darkBorder my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-ink-border/50 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-periwinkle-light dark:bg-periwinkle/20 text-periwinkle">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-gray-100">
                {link ? 'Chỉnh Sửa Liên Kết' : 'Thêm Kênh Mạng Xã Hội'}
              </h3>
              <p className="text-[11px] text-ink-muted dark:text-gray-400">
                Kênh liên hệ hoặc tài khoản mạng xã hội của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-paper-200/80 dark:bg-paper-dark border border-ink-border/60 text-ink dark:text-gray-300 hover:bg-paper-300 transition-all"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-left">
          {/* Quick Platform Select */}
          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1.5 uppercase">
              Chọn nền tảng phổ biến
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((plat) => (
                <button
                  type="button"
                  key={plat.name}
                  onClick={() => handlePlatformSelect(plat)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    formData.platform === plat.name
                      ? 'bg-clay text-white border-clay font-medium'
                      : 'bg-paper-100 dark:bg-stone-800 text-ink dark:text-gray-300 border-ink-border/60'
                  }`}
                >
                  {plat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              TÊN NỀN TẢNG *
            </label>
            <input
              type="text"
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                TÊN HIỂN THỊ / USERNAME *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@baotrung, fb.com/..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                HUY HIỆU (BADGE)
              </label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="VD: Nhắn nhanh, Thường dùng..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              ĐƯỜNG DẪN LIÊN KẾT (URL) *
            </label>
            <input
              type="text"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              MÔ TẢ NGẮN
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="VD: Cập nhật cuộc sống hàng ngày..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-ink-border/50 dark:border-stone-800">
            {link && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Xóa liên kết "${formData.platform}"?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                title="Xóa liên kết này"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-paper-200 dark:bg-stone-800 text-ink dark:text-gray-200 text-xs font-medium border border-ink-border/60 hover:bg-paper-300 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 rounded-xl bg-clay text-white text-xs font-medium shadow-clay hover:brightness-105 active:scale-95 transition-all"
            >
              {link ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
