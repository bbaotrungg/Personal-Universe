export type SectionId = 'gioi-thieu' | 'so-thich' | 'yeu-thich' | 'tinh-cach' | 'hinh-anh' | 'lien-he';

export interface ListeningToInfo {
  song: string;
  artist: string;
  link?: string;
  audioUrl?: string;
  enabled?: boolean;
}

export interface PersonalInfo {
  name: string;
  nickname: string;
  pronouns: string;
  role: string;
  tagline: string;
  bio: string;
  location: string;
  bornYear: string;
  mbti: string;
  zodiac: string;
  avatarUrl: string;
  status: {
    listeningTo: ListeningToInfo;
    currentObsession: string;
    todayVibe: string;
    coffeeFuelLevel: number;
  };
  quickFacts: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
  storyHighlights: Array<{
    title: string;
    content: string;
  }>;
}

export interface InterestItem {
  id: string;
  title: string;
  category: string;
  iconName: string;
  color: 'clay' | 'sage' | 'solar' | 'periwinkle';
  description: string;
  tags: string[];
  gearOrFavorites: string[];
}

export interface FavoriteItem {
  id: string;
  category: 'nhac' | 'phim' | 'game' | 'mon-an' | 'chon-quen';
  title: string;
  subtitle: string;
  tag: string;
  badge?: string;
  imageUrl: string;
  whyILoveIt: string;
  link?: string;
}

export interface PersonalityData {
  traits: Array<{
    title: string;
    desc: string;
    emoji: string;
  }>;
  habits: Array<{
    title: string;
    desc: string;
    emoji: string;
  }>;
  likes: string[];
  dislikes: string[];
  randomFacts: string[];
}

export interface MemoryItem {
  id: string;
  title: string;
  location: string;
  date: string;
  category: string;
  imageUrl: string;
  caption: string;
  story: string;
  tapeColor?: 'yellow' | 'coral' | 'sage' | 'periwinkle';
  rotation?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  username: string;
  url: string;
  iconName: string;
  badge?: string;
  color: string;
  description: string;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  emoji: string;
  timestamp: string;
}

export interface UniverseContent {
  personal: PersonalInfo;
  interests: InterestItem[];
  favorites: FavoriteItem[];
  personality: PersonalityData;
  memories: MemoryItem[];
  socialLinks: SocialLink[];
  publicSlug?: string;
  lastPublishedAt?: string;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
}
