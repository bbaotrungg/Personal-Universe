import { useState, useEffect, type FC, type FormEvent } from 'react';
import { X, Sparkles, Trash2 } from 'lucide-react';
import type { InterestItem } from '../../../types';

interface EditInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  interest: InterestItem | null; // null means adding a new one
  onSave: (saved: InterestItem) => void;
  onDelete?: (id: string) => void;
}

const COLOR_OPTIONS: Array<{ value: InterestItem['color']; label: string; bg: string }> = [
  { value: 'clay', label: 'Màu Đất (Clay)', bg: 'bg-clay text-white' },
  { value: 'sage', label: 'Xanh Sage', bg: 'bg-sage text-white' },
  { value: 'solar', label: 'Vàng Nắng (Solar)', bg: 'bg-solar text-ink' },
  { value: 'periwinkle', label: 'Tím Xanh (Periwinkle)', bg: 'bg-periwinkle text-white' },
];

export const EditInterestModal: FC<EditInterestModalProps> = ({
  isOpen,
  onClose,
  interest,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<InterestItem>({
    id: `interest-${Date.now()}`,
    title: '',
    category: 'Sở thích',
    iconName: 'Sparkles',
    color: 'clay',
    description: '',
    tags: [],
    gearOrFavorites: [],
  });

  const [tagsInput, setTagsInput] = useState('');
  const [gearInput, setGearInput] = useState('');

  useEffect(() => {
    if (interest) {
      setFormData(interest);
      setTagsInput(interest.tags.join(', '));
      setGearInput(interest.gearOrFavorites.join(', '));
    } else {
      setFormData({
        id: `interest-${Date.now()}`,
        title: '',
        category: 'Sở thích',
        iconName: 'Sparkles',
        color: 'clay',
        description: '',
        tags: [],
        gearOrFavorites: [],
      });
      setTagsInput('');
      setGearInput('');
    }
  }, [interest, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const finalGear = gearInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    onSave({
      ...formData,
      tags: finalTags,
      gearOrFavorites: finalGear,
    });
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
            <div className="p-2 rounded-xl bg-sage/20 text-sage-dark dark:text-sage">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-gray-100">
                {interest ? 'Chỉnh Sửa Sở Thích' : 'Thêm Sở Thích Mới'}
              </h3>
              <p className="text-[11px] text-ink-muted dark:text-gray-400">
                Mô tả chi tiết những gì bạn đam mê
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
          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              TÊN SỞ THÍCH *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Nhiếp ảnh đường phố, Pha cà phê thủ công..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                DANH MỤC
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="VD: Sáng tạo, Thể thao, Đời sống..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                TÔNG MÀU THẺ
              </label>
              <select
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value as InterestItem['color'] })
                }
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              MÔ TẢ CHI TIẾT
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Chia sẻ lý do bạn thích, cảm xúc hoặc thói quen gắn liền..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay resize-y"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              CÁC THẺ GẮN LIỀN (CÁCH NHAU BẰNG DẤU PHẨY)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="VD: 35mm, B&W, Leica, Phố cổ"
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              THIẾT BỊ / MÓN ĐỒ / TÁC PHẨM YÊU THÍCH (CÁCH NHAU BẰNG DẤU PHẨY)
            </label>
            <input
              type="text"
              value={gearInput}
              onChange={(e) => setGearInput(e.target.value)}
              placeholder="VD: Fujifilm X100V, Hạt Arabica Cầu Đất, V60"
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-ink-border/50 dark:border-stone-800">
            {interest && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Xóa sở thích "${formData.title}"?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                title="Xóa sở thích này"
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
              {interest ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
