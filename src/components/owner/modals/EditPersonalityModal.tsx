import { useState, useEffect, type FC, type FormEvent } from 'react';
import { X, Smile, Plus, Trash2 } from 'lucide-react';
import type { PersonalityData } from '../../../types';

interface EditPersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PersonalityData;
  onSave: (saved: PersonalityData) => void;
}

export const EditPersonalityModal: FC<EditPersonalityModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  const [formData, setFormData] = useState<PersonalityData>({ ...data });
  const [likesInput, setLikesInput] = useState('');
  const [dislikesInput, setDislikesInput] = useState('');

  useEffect(() => {
    if (data) {
      setFormData(data);
      setLikesInput(data.likes.join('\n'));
      setDislikesInput(data.dislikes.join('\n'));
    }
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanLikes = likesInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const cleanDislikes = dislikesInput
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    onSave({
      ...formData,
      likes: cleanLikes,
      dislikes: cleanDislikes,
    });
    onClose();
  };

  const handleTraitChange = (
    index: number,
    field: 'title' | 'desc' | 'emoji',
    value: string
  ) => {
    const updated = [...formData.traits];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, traits: updated });
  };

  const handleHabitChange = (
    index: number,
    field: 'title' | 'desc' | 'emoji',
    value: string
  ) => {
    const updated = [...formData.habits];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, habits: updated });
  };

  const handleFactChange = (index: number, value: string) => {
    const updated = [...formData.randomFacts];
    updated[index] = value;
    setFormData({ ...formData, randomFacts: updated });
  };

  const handleAddFact = () => {
    setFormData({
      ...formData,
      randomFacts: [...formData.randomFacts, ''],
    });
  };

  const handleRemoveFact = (index: number) => {
    setFormData({
      ...formData,
      randomFacts: formData.randomFacts.filter((_, i) => i !== index),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-lg w-full bg-paper-50 dark:bg-paper-darkSurface rounded-3xl p-5 sm:p-6 shadow-2xl border border-ink-border dark:border-paper-darkBorder my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-ink-border/50 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-solar-light dark:bg-solar/20 text-solar-dark dark:text-solar">
              <Smile size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-gray-100">
                Chỉnh Sửa Tính Cách & Thói Quen
              </h3>
              <p className="text-[11px] text-ink-muted dark:text-gray-400">
                Đặc điểm tính cách, thói quen thường nhật, điều thích & ghét
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 text-left pr-1">
          {/* Traits Section */}
          <div className="space-y-3">
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 uppercase">
              1. Nét tính cách tiêu biểu (3 nét)
            </label>
            <div className="space-y-2.5">
              {formData.traits.map((trait, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 flex items-start gap-2.5"
                >
                  <input
                    type="text"
                    value={trait.emoji}
                    onChange={(e) => handleTraitChange(idx, 'emoji', e.target.value)}
                    className="w-10 text-center text-lg p-1.5 rounded-lg bg-paper-100 dark:bg-stone-900 border border-ink-border/50 shrink-0"
                    title="Emoji"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={trait.title}
                      onChange={(e) => handleTraitChange(idx, 'title', e.target.value)}
                      placeholder="Tên nét tính cách"
                      className="w-full px-2.5 py-1 text-xs font-semibold rounded-lg bg-paper-100 dark:bg-stone-900 border border-ink-border/50 text-ink dark:text-white"
                    />
                    <input
                      type="text"
                      value={trait.desc}
                      onChange={(e) => handleTraitChange(idx, 'desc', e.target.value)}
                      placeholder="Mô tả ngắn"
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-paper-100 dark:bg-stone-900 border border-ink-border/50 text-ink-muted dark:text-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habits Section */}
          <div className="space-y-3">
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 uppercase">
              2. Thói quen thường nhật (3 thói quen)
            </label>
            <div className="space-y-2.5">
              {formData.habits.map((habit, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 flex items-start gap-2.5"
                >
                  <input
                    type="text"
                    value={habit.emoji}
                    onChange={(e) => handleHabitChange(idx, 'emoji', e.target.value)}
                    className="w-10 text-center text-lg p-1.5 rounded-lg bg-paper-100 dark:bg-stone-900 border border-ink-border/50 shrink-0"
                    title="Emoji"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={habit.title}
                      onChange={(e) => handleHabitChange(idx, 'title', e.target.value)}
                      placeholder="Tên thói quen"
                      className="w-full px-2.5 py-1 text-xs font-semibold rounded-lg bg-paper-100 dark:bg-stone-900 border border-ink-border/50 text-ink dark:text-white"
                    />
                    <input
                      type="text"
                      value={habit.desc}
                      onChange={(e) => handleHabitChange(idx, 'desc', e.target.value)}
                      placeholder="Mô tả thói quen"
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-paper-100 dark:bg-stone-900 border border-ink-border/50 text-ink-muted dark:text-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Likes & Dislikes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                3. ĐIỀU TÔI THÍCH (MỖI DÒNG 1 ĐIỀU)
              </label>
              <textarea
                rows={5}
                value={likesInput}
                onChange={(e) => setLikesInput(e.target.value)}
                placeholder="Trời mưa ngồi bên cửa sổ&#10;Hương cà phê sáng sớm&#10;Nhạc Lo-fi ban đêm"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                4. ĐIỀU TÔI KHÔNG THÍCH (MỖI DÒNG 1 ĐIỀU)
              </label>
              <textarea
                rows={5}
                value={dislikesInput}
                onChange={(e) => setDislikesInput(e.target.value)}
                placeholder="Tiếng còi xe giờ cao điểm&#10;Bị hủy hẹn phút chót&#10;Cơm nguội"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
          </div>

          {/* Random Facts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-ink-subtle dark:text-gray-400 uppercase">
                5. Sự thật ngẫu nhiên (Random Facts)
              </label>
              <button
                type="button"
                onClick={handleAddFact}
                className="inline-flex items-center gap-1 text-[11px] text-clay hover:underline font-medium"
              >
                <Plus size={13} />
                Thêm sự thật
              </button>
            </div>

            <div className="space-y-2">
              {formData.randomFacts.map((fact, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center font-mono text-xs text-ink-subtle">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={fact}
                    onChange={(e) => handleFactChange(idx, e.target.value)}
                    placeholder="Một điều thú vị/ngộ nghĩnh về bạn..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFact(idx)}
                    className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                    title="Xóa dòng này"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-ink-border/50 dark:border-stone-800 sticky bottom-0 bg-paper-50 dark:bg-paper-darkSurface">
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
              Cập nhật vào bản nháp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
