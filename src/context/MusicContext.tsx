import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import type { ListeningToInfo } from '../types';

interface MusicContextType {
  isPlaying: boolean;
  isAutoplayBlocked: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  togglePlay: () => void;
  play: () => Promise<void>;
  pause: () => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  track?: ListeningToInfo;
}

const MusicContext = createContext<MusicContextType | null>(null);

const USER_PAUSED_KEY = 'bg_music_user_paused';
const VOLUME_KEY = 'bg_music_volume';

interface MusicProviderProps {
  track?: ListeningToInfo;
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ track, children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem(VOLUME_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
    return 0.5; // default 50% gentle background volume
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const prevVolumeRef = useRef<number>(0.5);

  // Initialize Audio instance once
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, []);

  // Update volume & mute on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sync track URL and attempt Autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const hasAudio = !!(track?.audioUrl && track.audioUrl.trim().length > 0);
    const isEnabled = track?.enabled !== false;

    if (!hasAudio || !isEnabled) {
      if (!audio.paused) {
        audio.pause();
      }
      setIsPlaying(false);
      setIsAutoplayBlocked(false);
      return;
    }

    // If source URL changed, update audio src
    const currentSrc = audio.getAttribute('src');
    if (currentSrc !== track.audioUrl) {
      audio.src = track.audioUrl || '';
      audio.load();
    }

    // Check if user previously paused intentionally in this session
    const wasPausedByUser = sessionStorage.getItem(USER_PAUSED_KEY) === 'true';
    if (wasPausedByUser) {
      setIsPlaying(false);
      setIsAutoplayBlocked(false);
      return;
    }

    // Attempt Autoplay
    audio.volume = isMuted ? 0 : volume;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsAutoplayBlocked(false);
        })
        .catch(() => {
          // Autoplay was blocked by browser policy
          setIsPlaying(false);
          setIsAutoplayBlocked(true);
        });
    }
  }, [track?.audioUrl, track?.enabled]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl || track.enabled === false) return;

    try {
      sessionStorage.removeItem(USER_PAUSED_KEY);
      audio.volume = isMuted ? 0 : volume;
      await audio.play();
      setIsPlaying(true);
      setIsAutoplayBlocked(false);
    } catch {
      setIsPlaying(false);
    }
  }, [track?.audioUrl, track?.enabled, isMuted, volume]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    sessionStorage.setItem(USER_PAUSED_KEY, 'true');
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const setVolume = useCallback((level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setVolumeState(clamped);
    localStorage.setItem(VOLUME_KEY, clamped.toString());
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) {
        prevVolumeRef.current = volume;
        return true;
      } else {
        if (volume === 0) {
          setVolume(prevVolumeRef.current || 0.5);
        }
        return false;
      }
    });
  }, [volume, setVolume]);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        isAutoplayBlocked,
        isMuted,
        volume,
        togglePlay,
        play,
        pause,
        setVolume,
        toggleMute,
        track,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
