import { useState, useEffect, useRef, type FC, type FormEvent, type ChangeEvent } from 'react';
import {
  X,
  Upload,
  Loader2,
  User,
  Plus,
  Trash2,
  Play,
  Pause,
  Music,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { PersonalInfo } from '../../../types';
import { uploadImage, uploadAudio } from '../../../services/api';
import { useMusic } from '../../../context/MusicContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  personal: PersonalInfo;
  token: string;
  onSave: (updated: PersonalInfo) => void;
}

export const EditProfileModal: FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  personal,
  token,
  onSave,
}) => {
  const [formData, setFormData] = useState<PersonalInfo>({ ...personal });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio / Music states
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const { pause: pauseBgMusic } = useMusic();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...personal,
        status: {
          ...personal.status,
          listeningTo: {
            song: personal.status?.listeningTo?.song || '',
            artist: personal.status?.listeningTo?.artist || '',
            link: personal.status?.listeningTo?.link || '',
            audioUrl: personal.status?.listeningTo?.audioUrl || '',
            enabled: personal.status?.listeningTo?.enabled !== false,
          },
        },
        quickFacts: personal.quickFacts ? [...personal.quickFacts] : [],
        storyHighlights: personal.storyHighlights ? [...personal.storyHighlights] : [],
      });
      setUploadError(null);
      setAudioUploadError(null);
    } else {
      // Dừng nghe thử khi đóng modal
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      setIsPreviewPlaying(false);
    }
  }, [personal, isOpen]);

  // Dọn dẹp audio element khi unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    setIsPreviewPlaying(false);
    onClose();
  };

  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadImage(token, file);
      setFormData((prev) => ({
        ...prev,
        avatarUrl: res.url,
      }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Tải ảnh thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload file nhạc MP3
  const handleAudioFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setAudioUploadError(null);

    // Tạm dừng preview cũ nếu đang phát
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    }

    try {
      const res = await uploadAudio(token, file);
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').trim();
      setFormData((prev) => ({
        ...prev,
        status: {
          ...prev.status,
          listeningTo: {
            ...prev.status.listeningTo,
            audioUrl: res.url,
            song: prev.status.listeningTo.song || cleanFileName,
            enabled: true,
          },
        },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải file âm thanh thất bại';
      setAudioUploadError(msg);
    } finally {
      setIsUploadingAudio(false);
      if (audioFileInputRef.current) {
        audioFileInputRef.current.value = '';
      }
    }
  };

  // Bật/tắt nghe thử bài nhạc trước khi xuất bản
  const togglePreview = () => {
    const audioUrl = formData.status.listeningTo.audioUrl;
    if (!audioUrl) return;

    if (!previewAudioRef.current) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPreviewPlaying(false);
      audio.onpause = () => setIsPreviewPlaying(false);
      audio.onerror = () => {
        setIsPreviewPlaying(false);
        setAudioUploadError('Không thể phát file âm thanh này.');
      };
      previewAudioRef.current = audio;
    } else {
      const currentSrc = previewAudioRef.current.getAttribute('src');
      if (currentSrc !== audioUrl) {
        previewAudioRef.current.src = audioUrl;
        previewAudioRef.current.load();
      }
    }

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      pauseBgMusic();
      previewAudioRef.current
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => setIsPreviewPlaying(false));
    }
  };

  // Gỡ bỏ file nhạc hiện tại
  const handleRemoveAudio = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      setIsPreviewPlaying(false);
    }
    setFormData((prev) => ({
      ...prev,
      status: {
        ...prev.status,
        listeningTo: {
          ...prev.status.listeningTo,
          audioUrl: '',
        },
      },
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
        className="relative max-w-lg w-full bg-paper-50 dark:bg-paper-darkSurface rounded-3xl p-5 sm:p-6 shadow-2xl border border-ink-border dark:border-paper-darkBorder my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink-border/50 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-clay-light dark:bg-clay/20 text-clay">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-gray-100">
                Chỉnh Sửa Thông Tin Cá Nhân
              </h3>
              <p className="text-[11px] text-ink-muted dark:text-gray-400">
                Cập nhật ảnh đại diện, danh xưng, giới thiệu & trạng thái
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-left">
          {/* Avatar Upload / URL */}
          <div className="p-3.5 rounded-2xl bg-paper-100 dark:bg-stone-900 border border-ink-border/60 dark:border-stone-800">
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-2 uppercase">
              Ảnh đại diện (Avatar)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-paper-200 border border-clay/40 shrink-0">
                <img
                  src={formData.avatarUrl || '/placeholder.png'}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="URL ảnh hoặc tải ảnh lên..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay font-mono"
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
                  <span className="text-[10px] text-ink-subtle">PNG, JPG, WEBP tối đa 5MB</span>
                </div>
                {uploadError && (
                  <p className="text-[11px] text-red-500">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Names & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                HỌ VÀ TÊN *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                BIỆT DANH (NICKNAME)
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                NĂM SINH / TUỔI
              </label>
              <input
                type="text"
                value={formData.bornYear}
                onChange={(e) => setFormData({ ...formData, bornYear: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                VAI TRÒ / ĐỊNH DANH
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
                ĐỊA ĐIỂM (LOCATION)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              CÂU NÓI DƯỚI TIÊU ĐỀ (TAGLINE)
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 mb-1">
              ĐOẠN GIỚI THIỆU BẢN THÂN (BIO)
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 text-ink dark:text-white focus:outline-none focus:border-clay resize-y"
            />
          </div>

          {/* Nhạc nền cá nhân (Background Music Player Management) & Mức năng lượng */}
          <div className="p-3.5 rounded-2xl bg-paper-100 dark:bg-stone-900 border border-ink-border/60 dark:border-stone-800 space-y-3.5">
            {/* Header & Toggle Bật/Tắt */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-ink-muted dark:text-gray-300">
                <Music size={15} className="text-periwinkle" />
                <span>NHẠC NỀN WEBSITE (BACKGROUND MUSIC)</span>
              </div>

              {/* Toggle Switch */}
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <span className="text-[11px] font-sans font-medium text-ink-muted dark:text-gray-400">
                  {formData.status.listeningTo.enabled !== false ? 'Đang bật' : 'Đang tắt'}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.status.listeningTo.enabled !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: {
                          ...formData.status,
                          listeningTo: {
                            ...formData.status.listeningTo,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-paper-300 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-clay" />
                </div>
              </label>
            </div>

            {/* Thông tin bài hát */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono text-ink-subtle mb-0.5">
                  TÊN BÀI HÁT
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nàng Thơ..."
                  value={formData.status.listeningTo.song}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: {
                        ...formData.status,
                        listeningTo: { ...formData.status.listeningTo, song: e.target.value },
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-800 border border-ink-border/70 text-ink dark:text-white focus:outline-none focus:border-clay"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-ink-subtle mb-0.5">
                  NGHỆ SĨ / CA SĨ
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Dũng..."
                  value={formData.status.listeningTo.artist}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: {
                        ...formData.status,
                        listeningTo: { ...formData.status.listeningTo, artist: e.target.value },
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-800 border border-ink-border/70 text-ink dark:text-white focus:outline-none focus:border-clay"
                />
              </div>
            </div>

            {/* File nhạc MP3: Quản lý, tải lên, nghe thử & xóa */}
            <div className="p-3 rounded-xl bg-white/70 dark:bg-stone-800/70 border border-ink-border/60 dark:border-stone-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-ink-subtle dark:text-gray-400">
                  Tệp âm thanh MP3
                </span>
                {formData.status.listeningTo.audioUrl && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>Đã gắn bài nhạc</span>
                  </span>
                )}
              </div>

              {/* Input file ẩn */}
              <input
                type="file"
                ref={audioFileInputRef}
                onChange={handleAudioFileChange}
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                className="hidden"
              />

              {formData.status.listeningTo.audioUrl ? (
                /* Đã có file: Hiển thị bộ phát nghe thử & các nút thao tác */
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                  {/* Trình nghe thử mini */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={togglePreview}
                      className="w-8 h-8 rounded-lg bg-clay text-white flex items-center justify-center shrink-0 shadow-xs hover:brightness-105 active:scale-95 transition-all"
                      title={isPreviewPlaying ? 'Tạm dừng nghe thử' : 'Nghe thử bài nhạc'}
                    >
                      {isPreviewPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-ink dark:text-gray-200 truncate">
                        {formData.status.listeningTo.audioUrl.split('/').pop()}
                      </div>
                      <div className="text-[10px] font-mono text-ink-muted dark:text-gray-400">
                        {isPreviewPlaying ? (
                          <span className="text-clay dark:text-clay-light font-semibold animate-pulse">
                            Đang nghe thử...
                          </span>
                        ) : (
                          <span>Nhấn nút Play để nghe thử trước khi xuất bản</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nút thay file & Nút xóa file */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end">
                    <button
                      type="button"
                      disabled={isUploadingAudio}
                      onClick={() => audioFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-paper-200 dark:bg-stone-700 hover:bg-paper-300 dark:hover:bg-stone-600 text-ink dark:text-gray-200 text-xs font-medium transition-all active:scale-95"
                    >
                      {isUploadingAudio ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <RefreshCw size={12} />
                      )}
                      <span>Thay file khác</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveAudio}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Gỡ bỏ file nhạc này"
                      aria-label="Xóa nhạc"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Chưa có file: Nút tải lên */
                <div className="py-2 text-center">
                  <p className="text-xs text-ink-muted dark:text-gray-400 mb-2 font-sans">
                    Chưa có file nhạc MP3. Tải lên để website tự động phát khi khách truy cập.
                  </p>
                  <button
                    type="button"
                    disabled={isUploadingAudio}
                    onClick={() => audioFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-periwinkle text-white text-xs font-medium hover:brightness-105 active:scale-95 transition-all shadow-xs"
                  >
                    {isUploadingAudio ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Đang tải file lên...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Tải lên file MP3 (tối đa 25MB)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {audioUploadError && (
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{audioUploadError}</span>
                </div>
              )}
            </div>

            {/* Mức năng lượng cà phê */}
            <div>
              <label className="flex items-center justify-between text-[10px] font-mono text-ink-subtle mb-1">
                <span>MỨC NĂNG LƯỢNG CÀ PHÊ: {formData.status.coffeeFuelLevel}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.status.coffeeFuelLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: {
                      ...formData.status,
                      coffeeFuelLevel: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-clay cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Facts */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 uppercase">
              Thông tin nhanh (4 thẻ bên dưới ảnh)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(formData.quickFacts || []).map((fact, index) => (
                <div key={index} className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 space-y-1">
                  <span className="text-[10px] font-mono text-ink-subtle">{fact.label}</span>
                  <input
                    type="text"
                    value={fact.value}
                    onChange={(e) => {
                      const nextFacts = [...(formData.quickFacts || [])];
                      nextFacts[index] = { ...fact, value: e.target.value };
                      setFormData({ ...formData, quickFacts: nextFacts });
                    }}
                    className="w-full px-2 py-1 text-xs rounded bg-paper-100 dark:bg-stone-900 border border-ink-border/50 text-ink dark:text-white focus:outline-none focus:border-clay"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Story Highlights (Câu chuyện nổi bật) */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-paper-100 dark:bg-stone-900 border border-ink-border/60 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-mono text-ink-subtle dark:text-gray-400 uppercase">
                Câu chuyện nổi bật (Story Highlights)
              </label>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    storyHighlights: [
                      ...(formData.storyHighlights || []),
                      { title: '✨ Tiêu đề câu chuyện', content: '' },
                    ],
                  });
                }}
                className="inline-flex items-center gap-1 text-[11px] text-clay hover:underline font-medium"
              >
                <Plus size={13} />
                Thêm câu chuyện
              </button>
            </div>

            <div className="space-y-3">
              {(formData.storyHighlights || []).map((story, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-ink-border/70 dark:border-stone-700 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Tiêu đề (VD: 🌿 Về bản thân mình, ✨ Châm ngôn...)"
                      value={story.title}
                      onChange={(e) => {
                        const updated = [...(formData.storyHighlights || [])];
                        updated[idx] = { ...story, title: e.target.value };
                        setFormData({ ...formData, storyHighlights: updated });
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-paper-100 dark:bg-stone-900 border border-ink-border/50 text-ink dark:text-white focus:outline-none focus:border-clay"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (formData.storyHighlights || []).filter((_, i) => i !== idx);
                        setFormData({ ...formData, storyHighlights: updated });
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Xóa câu chuyện này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Nội dung câu chuyện hoặc chia sẻ..."
                    value={story.content}
                    onChange={(e) => {
                      const updated = [...(formData.storyHighlights || [])];
                      updated[idx] = { ...story, content: e.target.value };
                      setFormData({ ...formData, storyHighlights: updated });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-paper-100 dark:bg-stone-900 border border-ink-border/50 text-ink dark:text-white focus:outline-none focus:border-clay resize-y"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-2 pt-3 border-t border-ink-border/50 dark:border-stone-800 sticky bottom-0 bg-paper-50 dark:bg-paper-darkSurface">
            <button
              type="button"
              onClick={handleClose}
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
