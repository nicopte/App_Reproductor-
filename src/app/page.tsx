'use client';

import { useNavigationStore, usePlayerStore, useAuthStore } from '@/stores';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { PlayerBar } from '@/components/player/PlayerBar';
import { HomeView } from '@/components/views/HomeView';
import { SearchView } from '@/components/views/SearchView';
import { LibraryView } from '@/components/views/LibraryView';
import { PodcastsView, PodcastDetailView } from '@/components/views/PodcastViews';
import { PlaylistDetailView } from '@/components/views/PlaylistDetailView';
import { CreatePlaylistView } from '@/components/views/CreatePlaylistView';
import { CreatePodcastView } from '@/components/views/CreatePodcastView';
import { LoginView } from '@/components/views/AuthViews';
import { FavoritesView } from '@/components/views/FavoritesView';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Music2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function App() {
  const { currentView, viewParams, goBack } = useNavigationStore();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();
  const hasLogged = useRef(false);

  useEffect(() => {
    checkSession();
  }, []);


  useEffect(() => {
    if (currentSong && !hasLogged.current) {
      hasLogged.current = true;
      fetch('/api/reproductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId: currentSong.id }),
      }).catch(() => {});
    }
    if (!currentSong) hasLogged.current = false;
  }, [currentSong]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && currentSong) {
        e.preventDefault();
        usePlayerStore.getState().togglePlay();
      }
      if (e.code === 'Escape' && currentView !== 'home') goBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong, currentView, goBack]);

  const showNavBack = !['home', 'search', 'library', 'login', 'register'].includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'search': return <SearchView />;
      case 'library': return <LibraryView />;
      case 'podcasts': return <PodcastsView />;
      case 'podcast-detail': return <PodcastDetailView podcastId={viewParams.id || ''} />;
      case 'playlist-detail': return <PlaylistDetailView playlistId={viewParams.id || ''} />;
      case 'create-playlist': return <CreatePlaylistView />;
      case 'create-podcast': return <CreatePodcastView />;
      case 'favorites': return <FavoritesView />;
      case 'login':
      case 'register': return <LoginView />;
      default: return <HomeView />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Music2 className="w-6 h-6 text-primary" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen overflow-y-auto bg-background">
        <LoginView />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden pb-[136px] md:pb-[88px]">
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 sticky top-0 z-30 glass-subtle">
          {showNavBack && (
            <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={goBack} aria-label="Volver">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex-1" />
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 md:px-6 py-2 md:py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView + (viewParams.id || '')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
      <MobileNav />
      <PlayerBar />
    </div>
  );
}
