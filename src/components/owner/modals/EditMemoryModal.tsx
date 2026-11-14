import { useState, useEffect, useRef, type FC, type FormEvent, type ChangeEvent } from 'react';
import { X, Camera, Upload, Loader2, Trash2 } from 'lucide-react';
import type { MemoryItem } from '../../../types';
import { uploadImage } from '../../../services/api';

interface EditMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: MemoryItem | null;
  token: string;
  onSave: (saved: MemoryItem) => void;
  onDelete?: (id: string) => void;
}

const TAPE_OPTIONS: Array<{ value: NonNullable<MemoryItem['tapeColor']>; label: string; classColor: string }> = [
  { value: 'yellow', label: 'Vàng Washi', classColor: 'bg-amber-200' },
  { value: 'coral', label: 'Cam Đất', classColor: 'bg-rose-200' },
  { value: 'sage', label: 'Xanh Sage', classColor: 'bg-emerald-200' },
  { value: 'periwinkle', label: 'Tím Xanh', classColor: 'bg-indigo-200' },
];

export const EditMemoryModal: FC<EditMemoryModalProps> = ({
  isOpen,
  onClose,
  memory,
  token,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<MemoryItem>({
    id: `mem-${Date.now()}`,
    title: '',
    location: '',
    date: '',
    category: 'Đời thường',
    imageUrl: '',
    caption: '',
    story: '',
    tapeColor: 'yellow',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (memory) {
      setFormData(memory);
    } else {
      setFormData({
        id: `mem-${Date.now()}`,
        title: '',
        location: '',
        date: new Date().toLocaleDateString('vi-VN'),
        category: 'Đời thường',
        imageUrl: '',
        caption: '',
        story: '',
        tapeColor: 'yellow',
      });
    }
  }, [memory, isOpen]);

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
              <Camera size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-gray-100">
                {memory ? 'Chỉnh Sửa Ảnh Polaroid' : 'Thêm Kỷ Niệm Mới'}
              </h3>
              <p className="text-[11px] text-ink-muted dark:text-gray-400">
                Lưu giữ khoảnh khắc và câu chuyện đời thường
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
          {/* Photo Upload / URL */}
          <div className="p-3.5 rounded-2xl bg-paper-100 dark:bg-stone-900 border border-ink-border/60 dark:border-stone-800">
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-2 uppercase">
              Hình ảnh Polaroid *
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-ink-border shrink-0 shadow-sm">
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
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="URL ảnh hoặc tải từ điện thoại/máy tính..."
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

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              TIÊU ĐỀ BỨC ẢNH *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Chiều thu Hà Nội, Góc làm việc..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                ĐỊA ĐIỂM
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="VD: Cầu Long Biên, Quán quen..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                THỜI GIAN
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="VD: Tháng 10, 2024"
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                CHỦ ĐỀ / PHÂN LOẠI
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="VD: Phố xá, Cà phê, Du lịch..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                MÀU BĂNG DÍNH WASHI
              </label>
              <select
                value={formData.tapeColor || 'yellow'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tapeColor: e.target.value as MemoryItem['tapeColor'],
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              >
                {TAPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              CHÚ THÍCH DƯỚI ẢNH (CAPTION) *
            </label>
            <input
              type="text"
              required
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Dòng chữ viết tay ngắn dưới khung ảnh..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              CÂU CHUYỆN KHI BẤM XEM CHI TIẾT (STORY)
            </label>
            <textarea
              rows={3}
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              placeholder="Kỷ niệm hoặc cảm xúc đằng sau bức ảnh này..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay resize-y"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-ink-border/50 dark:border-stone-800">
            {memory && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Xóa ảnh "${formData.title}"?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                title="Xóa bức ảnh này"
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
              {memory ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
