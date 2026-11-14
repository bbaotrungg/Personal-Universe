import type { FC } from 'react';
import {
  MapPin,
  Sparkles,
  Coffee,
  Moon,
  Disc,
  Pencil,
  Share2,
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { PersonalInfo } from '../../types';
import { useMusic } from '../../context/MusicContext';

interface ProfileSectionProps {
  personal: PersonalInfo;
  onOpenQR: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
}

export const ProfileSection: FC<ProfileSectionProps> = ({
  personal,
  onOpenQR,
  isOwner = false,
  onEdit,
}) => {
  const {
    isPlaying,
    isAutoplayBlocked,
    isMuted,
    volume,
    togglePlay,
    toggleMute,
  } = useMusic();

  const listening = personal.status.listeningTo;
  const hasAudioTrack = !!(
    listening?.audioUrl &&
    listening.audioUrl.trim().length > 0 &&
    listening.enabled !== false
  );

  const renderFactIcon = (iconName: string) => {
    switch (iconName) {
      case 'MapPin': return <MapPin size={16} className="text-clay shrink-0" />;
      case 'Sparkles': return <Sparkles size={16} className="text-periwinkle shrink-0" />;
      case 'Coffee': return <Coffee size={16} className="text-solar-dark shrink-0" />;
      case 'Moon': return <Moon size={16} className="text-indigo-400 shrink-0" />;
      default: return <Sparkles size={16} className="text-clay shrink-0" />;
    }
  };

  return (
    <section id="gioi-thieu" className="space-y-6 pt-2 sm:pt-4">
      {/* Top Greeting Badge */}
      <div className="text-center max-w-xl mx-auto px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-200 dark:bg-stone-800 text-ink-muted dark:text-gray-300 text-xs font-mono mb-2.5 border border-ink-border/50">
          <span className="w-2 h-2 rounded-full bg-clay animate-pulse" />
          <span>Hello!</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-gray-100">
          Muốn Biết Điều Giề
        </h1>
        <p className="font-sans text-xs sm:text-sm text-ink-muted dark:text-gray-400 mt-1.5 leading-relaxed">
          {personal.tagline}
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="relative p-5 sm:p-7 rounded-3xl bg-white dark:bg-paper-darkSurface border border-ink-border dark:border-paper-darkBorder shadow-polaroid overflow-hidden">
        {/* Decorative Scrapbook Washi Tape */}
        <div className="washi-tape washi-tape-sage -top-2.5 left-8 w-24 -rotate-1" />

        {isOwner && onEdit && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-clay text-white text-xs font-mono font-medium shadow-sm hover:brightness-105 active:scale-95 transition-all"
              title="Chỉnh sửa thông tin cá nhân"
            >
              <Pencil size={13} />
              <span>Chỉnh sửa</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
          {/* Avatar with Status indicator */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-paper-100 dark:bg-stone-800 border-2 border-dashed border-clay/40 shadow-soft">
              <img
                src={personal.avatarUrl}
                alt={personal.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span
              className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-sage text-white text-[10px] font-mono font-medium border-2 border-white dark:border-stone-900 shadow-sm"
              title="Đang hoạt động"
            >
              Online
            </span>
          </div>

          {/* Identity Information */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-gray-100">
                {personal.name}
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-clay-light dark:bg-clay/20 text-clay-dark dark:text-clay-light font-medium">
                "{personal.nickname}"
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono text-ink-muted dark:text-gray-400 mb-2.5">
              <span>{personal.bornYear}</span>
              <span>•</span>
              <span className="text-clay font-medium">{personal.role}</span>
              <span>•</span>
              <span>{personal.location}</span>
            </div>

            <p className="text-xs sm:text-sm text-ink-muted dark:text-gray-300 font-sans leading-relaxed">
              {personal.bio}
            </p>
          </div>
        </div>

        {/* Live Status Widget - Tối ưu hoá đặc biệt cho iPhone 14 Pro Max & Desktop */}
        <div className="mt-5 p-3 sm:p-3.5 rounded-2xl bg-paper-100/90 dark:bg-stone-800/80 border border-ink-border/60 dark:border-stone-700/80 shadow-soft space-y-2.5">
          {/* Deck 1: Trạng thái âm nhạc / Trình phát nhạc nền (Now Playing & Background Music) */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Đĩa Vinyl có thể bấm để phát/dừng nếu có bài nhạc */}
              <button
                type="button"
                onClick={hasAudioTrack ? togglePlay : undefined}
                disabled={!hasAudioTrack}
                className={`relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  hasAudioTrack
                    ? 'cursor-pointer active:scale-95 bg-periwinkle/15 dark:bg-periwinkle/25 text-periwinkle border-periwinkle/30 hover:border-periwinkle hover:bg-periwinkle/20 shadow-xs'
                    : 'bg-paper-200/60 dark:bg-stone-700/60 text-ink-subtle dark:text-gray-400 border-ink-border/40'
                }`}
                title={
                  hasAudioTrack
                    ? isPlaying
                      ? 'Nhấn để tạm dừng nhạc'
                      : 'Nhấn để phát nhạc nền'
                    : 'Chưa có nhạc nền'
                }
                aria-label={
                  hasAudioTrack
                    ? isPlaying
                      ? 'Tạm dừng nhạc'
                      : 'Phát nhạc'
                    : 'Đang nghe'
                }
              >
                <Disc
                  size={17}
                  className={isPlaying ? 'animate-spin [animation-duration:4s]' : ''}
                />
                {/* Dấu chấm nhấp nháy báo hiệu khi trình duyệt chặn Autoplay */}
                {hasAudioTrack && isAutoplayBlocked && !isPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5" title="Nhấn để nghe nhạc">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clay opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-clay" />
                  </span>
                )}
              </button>

              {/* Thông tin bài hát & trạng thái phát */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-subtle dark:text-gray-400 uppercase tracking-wider">
                  {hasAudioTrack ? (
                    isPlaying ? (
                      <>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                        <span className="text-sage-dark dark:text-emerald-400 font-semibold">Đang phát</span>
                      </>
                    ) : isAutoplayBlocked ? (
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="inline-flex items-center gap-1 text-clay hover:underline font-semibold cursor-pointer active:scale-95"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
                        <span>Chạm để nghe ♪</span>
                      </button>
                    ) : (
                      <>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink-subtle/60" />
                        <span>Tạm dừng</span>
                      </>
                    )
                  ) : (
                    <>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                      <span>Đang nghe</span>
                    </>
                  )}
                </div>
                <div
                  className="text-xs truncate font-sans text-ink dark:text-gray-100"
                  title={`${listening.song} — ${listening.artist}`}
                >
                  <strong className="font-semibold">{listening.song}</strong>
                  {listening.artist && (
                    <span className="text-ink-muted dark:text-gray-400 text-[11px]">
                      {' '}— {listening.artist}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Điều khiển phát nhạc & Sóng âm Equalizer */}
            {hasAudioTrack ? (
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Sóng âm Equalizer (nhấp nhô khi phát, tĩnh khi dừng) */}
                <div
                  className="flex items-end gap-0.5 h-3.5 px-0.5"
                  aria-hidden="true"
                  title={isPlaying ? 'Đang phát' : 'Đang tạm dừng'}
                >
                  <span
                    className={`w-0.5 bg-periwinkle rounded-full transition-all duration-300 ${
                      isPlaying
                        ? 'animate-[pulse_1s_ease-in-out_infinite] h-2.5'
                        : 'h-1 opacity-40'
                    }`}
                  />
                  <span
                    className={`w-0.5 bg-periwinkle rounded-full transition-all duration-300 ${
                      isPlaying
                        ? 'animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-3.5'
                        : 'h-1.5 opacity-40'
                    }`}
                  />
                  <span
                    className={`w-0.5 bg-periwinkle rounded-full transition-all duration-300 ${
                      isPlaying
                        ? 'animate-[pulse_1.2s_ease-in-out_infinite_0.4s] h-1.5'
                        : 'h-1 opacity-40'
                    }`}
                  />
                </div>

                {/* Nút Play / Pause nhỏ gọn */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                    isPlaying
                      ? 'bg-clay text-white shadow-xs hover:brightness-105'
                      : 'bg-paper-200/90 dark:bg-stone-700/80 text-ink dark:text-gray-200 hover:bg-clay hover:text-white border border-ink-border/50 dark:border-stone-600'
                  }`}
                  title={isPlaying ? 'Tạm dừng nhạc' : 'Phát bài nhạc'}
                  aria-label={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
                >
                  {isPlaying ? (
                    <Pause size={12} className="fill-current" />
                  ) : (
                    <Play size={12} className="ml-0.5 fill-current" />
                  )}
                </button>

                {/* Nút Âm lượng & Bật/Tắt tiếng (Volume / Mute toggle duy nhất) */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-paper-200/70 dark:bg-stone-700/60 hover:bg-paper-300 dark:hover:bg-stone-600 text-ink-muted dark:text-gray-300 transition-colors border border-ink-border/40 dark:border-stone-600/60 active:scale-95"
                  title={isMuted || volume === 0 ? 'Bật âm thanh' : 'Tắt tiếng (Mute)'}
                  aria-label={isMuted || volume === 0 ? 'Bật âm thanh' : 'Tắt tiếng'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={13} className="text-clay" />
                  ) : (
                    <Volume2 size={13} />
                  )}
                </button>
              </div>
            ) : (
              /* Hiển thị Equalizer tĩnh nếu chưa gắn file nhạc */
              <div className="flex items-end gap-0.5 h-3.5 px-1 shrink-0" aria-hidden="true">
                <span className="w-0.5 bg-periwinkle rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2.5" />
                <span className="w-0.5 bg-periwinkle rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-3.5" />
                <span className="w-0.5 bg-periwinkle rounded-full animate-[pulse_1.2s_ease-in-out_infinite_0.4s] h-1.5" />
              </div>
            )}
          </div>

          {/* Đường phân cách mảnh */}
          <div className="border-t border-ink-border/40 dark:border-stone-700/60" />

          {/* Deck 2: Thanh hiển thị Năng lượng & Nút Chia sẻ */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Thanh đo Năng lượng (Battery Gauge) */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Zap size={13} className="text-solar-dark dark:text-solar fill-solar/20 shrink-0" />
              <span className="text-[11px] font-mono font-medium text-ink-muted dark:text-gray-300 shrink-0">
                Năng lượng:
              </span>
              <div className="w-14 sm:w-24 h-2 rounded-full bg-paper-300/80 dark:bg-stone-700 overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-solar to-clay transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(personal.status.coffeeFuelLevel, 0), 100)}%` }}
                />
              </div>
              <span className="font-mono text-[11px] font-bold text-clay dark:text-clay-light shrink-0">
                {personal.status.coffeeFuelLevel}%
              </span>
            </div>

            {/* Nút Chia sẻ */}
            <button
              onClick={onOpenQR}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-paper-200/90 dark:bg-stone-700/80 hover:bg-clay hover:text-white dark:hover:bg-clay text-ink-muted dark:text-gray-200 transition-all text-[11px] font-medium active:scale-95 shrink-0 whitespace-nowrap border border-ink-border/50 dark:border-stone-600"
              title="Chia sẻ danh thiếp & Mã QR"
            >
              <Share2 size={12} />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Facts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {personal.quickFacts.map((fact, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white dark:bg-paper-darkSurface border border-ink-border/70 dark:border-paper-darkBorder shadow-soft"
          >
            <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-gray-400 mb-1">
              {renderFactIcon(fact.icon)}
              <span className="font-sans font-medium">{fact.label}</span>
            </div>
            <div className="font-sans font-semibold text-xs sm:text-sm text-ink dark:text-gray-100 truncate">
              {fact.value}
            </div>
          </div>
        ))}
      </div>

      {/* Story Highlights (3 Cards) */}
      {personal.storyHighlights && personal.storyHighlights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {personal.storyHighlights.map((story, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-paper-100/90 dark:bg-stone-900 border border-ink-border/60 dark:border-stone-800 shadow-soft"
            >
              <h3 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-gray-100 mb-1.5">
                {story.title}
              </h3>
              <p className="font-sans text-xs text-ink-muted dark:text-gray-300 leading-relaxed">
                {story.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
