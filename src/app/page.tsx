'use client';

import { useNavigationStore, usePlayerStore, useAuthStore } from '@/stores';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { PlayerBar } from '@/components/player/PlayerBar';
import { HomeView } from '@/components/views/HomeView';
import { SearchView } from '@/components/views/SearchView';
import { LibraryView } from '@/components/views/LibraryView';
import { PodcastsView, PodcastDetailView } from '@/components/views/PodcastViews';
import { CreatePodcastView } from '@/components/views/CreatePodcastView';
import { LoginView } from '@/components/views/AuthViews';
import { FavoritesView } from '@/components/views/FavoritesView';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
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
      case 'create-podcast': return <CreatePodcastView />;
      case 'favorites': return <FavoritesView />;
      case 'login':
      case 'register': return <LoginView />;
      default: return <HomeView />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-glow flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="shadow-glow w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center">
            <img src="/logo.jpg" alt="MP3DB" className="w-full h-full object-cover" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-glow h-screen overflow-y-auto bg-background">
        <LoginView />
      </div>
    );
  }

  return (
    <div className="bg-gradient-glow flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 px-3 pt-3 pb-2 md:px-6">
          <div className="glass shadow-soft flex items-center gap-3 rounded-3xl px-3 py-2">
            {showNavBack ? (
              <Button variant="ghost" size="icon" className="w-9 h-9 flex-shrink-0 rounded-2xl" onClick={goBack} aria-label="Volver">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 pl-1 pr-1 flex-shrink-0">
                <span className="shadow-glow grid h-9 w-9 place-items-center overflow-hidden rounded-2xl">
                  <img src="/logo.jpg" alt="MP3DB" className="h-full w-full object-cover" />
                </span>
                <span className="font-display hidden text-lg font-semibold tracking-tight sm:inline">MP3DB</span>
              </div>
            )}
            <button
              onClick={() => useNavigationStore.getState().navigate('search')}
              className="bg-muted/60 text-muted-foreground hover:bg-muted flex flex-1 items-center gap-2 rounded-2xl px-3 py-2 text-sm transition"
            >
              <Search className="h-4 w-4" />
              <span className="truncate">Buscar podcasts, episodios…</span>
            </button>
          </div>
        </header>
        <ScrollArea className="flex-1 min-h-0 pb-[136px] md:pb-[104px]">
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
      </div>
      <MobileNav />
      <PlayerBar />
    </div>
  );
}
