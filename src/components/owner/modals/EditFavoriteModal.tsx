import { useState, useEffect, useRef, type FC, type FormEvent, type ChangeEvent } from 'react';
import { X, Heart, Upload, Loader2, Trash2 } from 'lucide-react';
import type { FavoriteItem } from '../../../types';
import { uploadImage } from '../../../services/api';

interface EditFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorite: FavoriteItem | null;
  token: string;
  onSave: (saved: FavoriteItem) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_OPTIONS: Array<{ value: FavoriteItem['category']; label: string }> = [
  { value: 'nhac', label: 'Âm nhạc' },
  { value: 'phim', label: 'Phim ảnh' },
  { value: 'game', label: 'Game' },
  { value: 'mon-an', label: 'Món ăn & Đồ uống' },
  { value: 'chon-quen', label: 'Chốn quen' },
];

export const EditFavoriteModal: FC<EditFavoriteModalProps> = ({
  isOpen,
  onClose,
  favorite,
  token,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<FavoriteItem>({
    id: `fav-${Date.now()}`,
    category: 'nhac',
    title: '',
    subtitle: '',
    tag: '',
    badge: '',
    imageUrl: '',
    whyILoveIt: '',
    link: '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (favorite) {
      setFormData(favorite);
    } else {
      setFormData({
        id: `fav-${Date.now()}`,
        category: 'nhac',
        title: '',
        subtitle: '',
        tag: 'Yêu thích',
        badge: 'Top Pick',
        imageUrl: '',
        whyILoveIt: '',
        link: '',
      });
    }
  }, [favorite, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadImage(token, file);
      setFormData((prev) => ({
        ...prev,
        imageUrl: res.url,
      }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Tải ảnh thất bại');
    } finally {
      setIsUploading(false);
    }
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
            <div className="p-2 rounded-xl bg-clay-light dark:bg-clay/20 text-clay">
              <Heart size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-gray-100">
                {favorite ? 'Chỉnh Sửa Mục Yêu Thích' : 'Thêm Mục Yêu Thích Mới'}
              </h3>
              <p className="text-[11px] text-ink-muted dark:text-gray-400">
                Chia sẻ những thứ bạn say mê nhất
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
          {/* Cover Image Upload / URL */}
          <div className="p-3.5 rounded-2xl bg-paper-100 dark:bg-stone-900 border border-ink-border/60 dark:border-stone-800">
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-2 uppercase">
              Hình ảnh / Ảnh bìa
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-paper-200 border border-ink-border shrink-0">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-subtle text-[10px] font-mono">
                    Chưa có ảnh
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="URL ảnh hoặc tải ảnh lên..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-800 border border-ink-border/70 text-ink dark:text-white focus:outline-none focus:border-clay font-mono"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-clay text-white text-xs font-medium hover:brightness-105 active:scale-95 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Tải ảnh từ máy</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>
                {uploadError && (
                  <p className="text-[11px] text-red-500">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                DANH MỤC *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as FavoriteItem['category'] })
                }
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                HUY HIỆU (BADGE)
              </label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="VD: Top 1, Replay 24/7..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              TIÊU ĐỀ / TÊN TÁC PHẨM *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Discovery, Spirited Away, Phở Bát Đàn..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                PHỤ ĐỀ / NGHỆ SĨ / TÁC GIẢ
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="VD: Daft Punk, Studio Ghibli..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                NHÃN PHÂN LOẠI (TAG)
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="VD: Electronic 2001, Anime..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              VÌ SAO TÔI THÍCH? (WHY I LOVE IT) *
            </label>
            <textarea
              rows={3}
              required
              value={formData.whyILoveIt}
              onChange={(e) => setFormData({ ...formData, whyILoveIt: e.target.value })}
              placeholder="Cảm xúc, câu chuyện hoặc lý do bạn yêu thích..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay resize-y"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-ink-border/50 dark:border-stone-800">
            {favorite && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Xóa "${formData.title}" khỏi danh sách yêu thích?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                title="Xóa mục này"
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
              {favorite ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
