import { useState, useEffect, useCallback } from 'react';
import type {
  SectionId,
  MemoryItem,
  InterestItem,
  FavoriteItem,
  SocialLink,
  UniverseContent,
} from './types';

// Fallback initial data
import { personalData } from './data/personal';
import { interestsData } from './data/interests';
import { favoritesData } from './data/favorites';
import { personalityData } from './data/personality';
import { memoriesData } from './data/memories';
import { socialLinksData } from './data/social';

// Layout & Modals
import { Header } from './components/layout/Header';
import { NavigationDock } from './components/layout/NavigationDock';
import { LightboxModal } from './components/layout/LightboxModal';
import { QRModal } from './components/layout/QRModal';
import { ToastContainer, type ToastMessage } from './components/common/Toast';

// Sections
import { ProfileSection } from './components/sections/ProfileSection';
import { InterestsSection } from './components/sections/InterestsSection';
import { FavoritesSection } from './components/sections/FavoritesSection';
import { PersonalitySection } from './components/sections/PersonalitySection';
import { GallerySection } from './components/sections/GallerySection';
import { SocialSection } from './components/sections/SocialSection';

// Owner Components
import { OwnerControlBar } from './components/owner/OwnerControlBar';
import { OwnerAccessModal } from './components/owner/OwnerAccessModal';
import { PublishConfirmModal } from './components/owner/PublishConfirmModal';
import { EditProfileModal } from './components/owner/modals/EditProfileModal';
import { EditInterestModal } from './components/owner/modals/EditInterestModal';
import { EditFavoriteModal } from './components/owner/modals/EditFavoriteModal';
import { EditPersonalityModal } from './components/owner/modals/EditPersonalityModal';
import { EditMemoryModal } from './components/owner/modals/EditMemoryModal';
import { EditSocialModal } from './components/owner/modals/EditSocialModal';

// Services
import {
  getPublishedContent,
  getDraftContent,
  saveDraftContent,
  publishContent,
  checkSessionToken,
  logoutOwner,
} from './services/api';
import { Lock } from 'lucide-react';
import { MusicProvider } from './context/MusicContext';

const sectionIds: SectionId[] = [
  'gioi-thieu',
  'so-thich',
  'yeu-thich',
  'tinh-cach',
  'hinh-anh',
  'lien-he',
];

const initialDefaultContent: UniverseContent = {
  personal: personalData,
  interests: interestsData,
  favorites: favoritesData,
  personality: personalityData,
  memories: memoriesData,
  socialLinks: socialLinksData,
  publicSlug: 'bao-trung',
};

function sanitizeContent(data: any): UniverseContent {
  if (!data || typeof data !== 'object') {
    return initialDefaultContent;
  }
  const raw = (data.content && data.content.personal) ? data.content : data;
  return {
    personal: raw.personal || initialDefaultContent.personal,
    interests: Array.isArray(raw.interests) ? raw.interests : initialDefaultContent.interests,
    favorites: Array.isArray(raw.favorites) ? raw.favorites : initialDefaultContent.favorites,
    personality: raw.personality || initialDefaultContent.personality,
    memories: Array.isArray(raw.memories) ? raw.memories : initialDefaultContent.memories,
    socialLinks: Array.isArray(raw.socialLinks) ? raw.socialLinks : initialDefaultContent.socialLinks,
    publicSlug: raw.publicSlug || initialDefaultContent.publicSlug,
    lastPublishedAt: raw.lastPublishedAt,
  };
}

export function App() {
  // Navigation & Theme
  const [activeSection, setActiveSection] = useState<SectionId>('gioi-thieu');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [isQROpen, setIsQROpen] = useState<boolean>(false);

  // Content & Owner Mode State
  const [content, setContent] = useState<UniverseContent>(initialDefaultContent);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [ownerToken, setOwnerToken] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isDraftDirty, setIsDraftDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Modals state
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [editingInterest, setEditingInterest] = useState<InterestItem | null>(null);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState<boolean>(false);
  const [editingFavorite, setEditingFavorite] = useState<FavoriteItem | null>(null);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState<boolean>(false);
  const [isPersonalityModalOpen, setIsPersonalityModalOpen] = useState<boolean>(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState<boolean>(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize Theme Preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('personal-card-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Initialize Session & Content
  useEffect(() => {
    async function initApp() {
      const savedToken = sessionStorage.getItem('owner_token');
      if (savedToken) {
        const isValid = await checkSessionToken(savedToken);
        if (isValid) {
          setIsOwner(true);
          setOwnerToken(savedToken);
          try {
            const draftData = await getDraftContent(savedToken);
            setContent(sanitizeContent(draftData));
            return;
          } catch {
            // fallback to published
          }
        } else {
          sessionStorage.removeItem('owner_token');
        }
      }

      // Public visitor / default
      try {
        const pubData = await getPublishedContent();
        setContent(sanitizeContent(pubData));
      } catch (err) {
        console.warn('Không thể nạp dữ liệu từ máy chủ, dùng dữ liệu mặc định.', err);
      }
    }

    initApp();
  }, []);

  // Scroll listener to update activeSection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Discreet Keyboard Shortcut to open Owner Access Modal (Alt + E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'e') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        if (isOwner) {
          addToast('Bạn đang ở Chế độ Chủ sở hữu.', 'info');
        } else {
          setIsAccessModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOwner, addToast]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('personal-card-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('personal-card-theme', 'light');
    }
  };

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auth Handlers
  const handleAuthenticated = async (token: string) => {
    setIsOwner(true);
    setOwnerToken(token);
    setIsPreviewMode(false);
    try {
      const draftData = await getDraftContent(token);
      setContent(sanitizeContent(draftData));
      addToast('Chào mừng trở lại! Đã kích hoạt Chế độ chỉnh sửa.', 'success');
    } catch {
      addToast('Đã kích hoạt quyền chỉnh sửa.', 'success');
    }
  };

  const handleLogout = async () => {
    if (ownerToken) {
      await logoutOwner(ownerToken);
    }
    sessionStorage.removeItem('owner_token');
    setIsOwner(false);
    setOwnerToken('');
    setIsPreviewMode(false);
    setIsDraftDirty(false);

    try {
      const pubData = await getPublishedContent();
      setContent(sanitizeContent(pubData));
    } catch {
      // ignore
    }
    addToast('Đã thoát khỏi chế độ chủ sở hữu.', 'info');
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    if (!ownerToken) return;
    setIsSaving(true);
    try {
      await saveDraftContent(ownerToken, content);
      setIsDraftDirty(false);
      addToast('Đã lưu bản nháp thành công!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu bản nháp';
      addToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Action
  const handlePublish = async () => {
    if (!ownerToken) return;
    setIsPublishing(true);
    try {
      // Save draft first to ensure latest content is published
      await saveDraftContent(ownerToken, content);
      await publishContent(ownerToken);
      setIsDraftDirty(false);
      setIsPublishModalOpen(false);
      addToast('Đã xuất bản thành công! Khách truy cập sẽ thấy ngay lập tức.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xuất bản thất bại';
      addToast(msg, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Section Update Helpers
  const updateContent = (partial: Partial<UniverseContent>) => {
    setContent((prev) => ({
      ...prev,
      ...partial,
    }));
    setIsDraftDirty(true);
  };

  const showEditControls = isOwner && !isPreviewMode;

  return (
    <MusicProvider track={content.personal.status.listeningTo}>
      <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden flex flex-col bg-paper-100 dark:bg-paper-dark bg-grid-paper transition-colors duration-300 relative selection:bg-clay/20 selection:text-clay-dark text-ink dark:text-gray-100">
      
      {/* Header Bar */}
      <Header
        isDark={isDark}
        name={content.personal.nickname || content.personal.name}
        onToggleDark={toggleTheme}
        onOpenQR={() => setIsQROpen(true)}
      />

      {/* Owner Mode Sticky Floating Bar */}
      {isOwner && (
        <OwnerControlBar
          isDraftDirty={isDraftDirty}
          isPreviewMode={isPreviewMode}
          isSaving={isSaving}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          onSaveDraft={handleSaveDraft}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
          onOpenQR={() => setIsQROpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-28 sm:pb-32 space-y-4 min-w-0">
        {/* A. Giới thiệu */}
        <ProfileSection
          personal={content.personal}
          onOpenQR={() => setIsQROpen(true)}
          isOwner={showEditControls}
          onEdit={() => setIsProfileModalOpen(true)}
        />

        {/* B. Sở thích */}
        <InterestsSection
          interests={content.interests}
          isOwner={showEditControls}
          onAddInterest={() => {
            setEditingInterest(null);
            setIsInterestModalOpen(true);
          }}
          onEditInterest={(item) => {
            setEditingInterest(item);
            setIsInterestModalOpen(true);
          }}
        />

        {/* C. Những điều tôi thích */}
        <FavoritesSection
          favorites={content.favorites}
          isOwner={showEditControls}
          onAddFavorite={() => {
            setEditingFavorite(null);
            setIsFavoriteModalOpen(true);
          }}
          onEditFavorite={(item) => {
            setEditingFavorite(item);
            setIsFavoriteModalOpen(true);
          }}
        />

        {/* D. Một chút về tôi */}
        <PersonalitySection
          data={content.personality}
          isOwner={showEditControls}
          onEdit={() => setIsPersonalityModalOpen(true)}
        />

        {/* E. Hình ảnh */}
        <GallerySection
          memories={content.memories}
          onSelectMemory={(mem) => setSelectedMemory(mem)}
          isOwner={showEditControls}
          onAddMemory={() => {
            setEditingMemory(null);
            setIsMemoryModalOpen(true);
          }}
          onEditMemory={(item) => {
            setEditingMemory(item);
            setIsMemoryModalOpen(true);
          }}
        />

        {/* F. Liên hệ */}
        <SocialSection
          socialLinks={content.socialLinks}
          onOpenQR={() => setIsQROpen(true)}
          isOwner={showEditControls}
          onAddSocial={() => {
            setEditingSocial(null);
            setIsSocialModalOpen(true);
          }}
          onEditSocial={(link) => {
            setEditingSocial(link);
            setIsSocialModalOpen(true);
          }}
        />

        {/* Footer with Discreet Owner Access Trigger */}
        <footer className="pt-8 pb-4 text-center border-t border-ink-border/40 dark:border-stone-800 text-xs text-ink-subtle dark:text-gray-500 font-sans">
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            <span>© {new Date().getFullYear()} {content.personal.name}</span>
            <span>•</span>
            <span>Thấy thế nào!</span>
            <button
              onClick={() => {
                if (isOwner) {
                  setIsPreviewMode(false);
                  addToast('Đang ở Chế độ Chủ sở hữu', 'info');
                } else {
                  setIsAccessModalOpen(true);
                }
              }}
              className="p-1 rounded-full text-ink-subtle/50 hover:text-clay transition-colors"
              title="Quản trị viên (Alt+E)"
              aria-label="Truy cập chủ sở hữu"
            >
              <Lock size={12} />
            </button>
          </p>
          <p className="text-[11px] font-mono mt-1 text-ink-subtle/80">
            Thiết kế thân thiện với iPhone 14 Pro Max
          </p>
        </footer>
      </main>

      {/* Floating Bottom Navigation Dock */}
      <NavigationDock
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Lightbox Modal for Photo Details */}
      <LightboxModal
        memory={selectedMemory}
        memories={content.memories}
        onClose={() => setSelectedMemory(null)}
        onSelectMemory={(mem) => setSelectedMemory(mem)}
      />

      {/* QR Code Modal for Phone Scanning */}
      <QRModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        name={content.personal.nickname || content.personal.name}
      />

      {/* Discreet Owner Access Modal */}
      <OwnerAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Publish Confirmation Modal */}
      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        isPublishing={isPublishing}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublish}
      />

      {/* Edit Modals */}
      {isOwner && (
        <>
          <EditProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            personal={content.personal}
            token={ownerToken}
            onSave={(updated) => updateContent({ personal: updated })}
          />

          <EditInterestModal
            isOpen={isInterestModalOpen}
            onClose={() => setIsInterestModalOpen(false)}
            interest={editingInterest}
            onSave={(saved) => {
              const current = content.interests;
              const exists = current.some((i) => i.id === saved.id);
              const updated = exists
                ? current.map((i) => (i.id === saved.id ? saved : i))
                : [saved, ...current];
              updateContent({ interests: updated });
            }}
            onDelete={(id) => {
              updateContent({
                interests: content.interests.filter((i) => i.id !== id),
              });
            }}
          />

          <EditFavoriteModal
            isOpen={isFavoriteModalOpen}
            onClose={() => setIsFavoriteModalOpen(false)}
            favorite={editingFavorite}
            token={ownerToken}
            onSave={(saved) => {
              const current = content.favorites;
              const exists = current.some((f) => f.id === saved.id);
              const updated = exists
                ? current.map((f) => (f.id === saved.id ? saved : f))
                : [saved, ...current];
              updateContent({ favorites: updated });
            }}
            onDelete={(id) => {
              updateContent({
                favorites: content.favorites.filter((f) => f.id !== id),
              });
            }}
          />

          <EditPersonalityModal
            isOpen={isPersonalityModalOpen}
            onClose={() => setIsPersonalityModalOpen(false)}
            data={content.personality}
            onSave={(updated) => updateContent({ personality: updated })}
          />

          <EditMemoryModal
            isOpen={isMemoryModalOpen}
            onClose={() => setIsMemoryModalOpen(false)}
            memory={editingMemory}
            token={ownerToken}
            onSave={(saved) => {
              const current = content.memories;
              const exists = current.some((m) => m.id === saved.id);
              const updated = exists
                ? current.map((m) => (m.id === saved.id ? saved : m))
                : [saved, ...current];
              updateContent({ memories: updated });
            }}
            onDelete={(id) => {
              updateContent({
                memories: content.memories.filter((m) => m.id !== id),
              });
            }}
          />

          <EditSocialModal
            isOpen={isSocialModalOpen}
            onClose={() => setIsSocialModalOpen(false)}
            link={editingSocial}
            onSave={(saved) => {
              const current = content.socialLinks;
              const exists = current.some((s) => s.id === saved.id);
              const updated = exists
                ? current.map((s) => (s.id === saved.id ? saved : s))
                : [saved, ...current];
              updateContent({ socialLinks: updated });
            }}
            onDelete={(id) => {
              updateContent({
                socialLinks: content.socialLinks.filter((s) => s.id !== id),
              });
            }}
          />
        </>
      )}

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
    </MusicProvider>
  );
}

export default App;
