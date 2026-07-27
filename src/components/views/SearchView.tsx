'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigationStore, usePlayerStore } from '@/stores';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MediaCard } from '@/components/shared/MediaComponents';
import { cn, formatDuration } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import type { Song } from '@/types';

interface SearchResults {
  songs: Song[];
  artists: Array<{ id: string; name: string; image?: string; _count?: { songs: number; albums: number } }>;
  albums: Array<{ id: string; title: string; image?: string; artist?: { name: string } }>;
  podcasts: Array<{ id: string; title: string; image?: string; episodeCount?: number }>;
}

export function SearchView() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigationStore((s) => s.navigate);
  const playSong = usePlayerStore((s) => s.playSong);
  const currentSong = usePlayerStore((s) => s.currentSong);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery<SearchResults>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`).then((r) => r.json()),
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div className="space-y-6 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-lg"
      >
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="¿Qué quieres escuchar?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 h-12 bg-card border-border/50 text-base rounded-xl focus-visible:ring-primary/30"
          aria-label="Buscar canciones, artistas, álbumes o podcasts"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando...
            </div>
          </motion.div>
        )}

        {!isLoading && results && debouncedQuery.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {results.songs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Canciones</h2>
                <div className="space-y-1">
                  {results.songs.slice(0, 6).map((song) => {
                    const isActive = currentSong?.id === song.id;
                    return (
                      <button
                        key={song.id}
                        onClick={() => playSong(song)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left hover:bg-accent',
                          isActive && 'bg-accent/60'
                        )}
                      >
                        <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          {song.image ? (
                            <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                              {song.title.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium truncate', isActive && 'text-primary')}>{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.artist?.name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{formatDuration(song.duration)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {results.artists.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Artistas</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {results.artists.slice(0, 8).map((artist) => (
                    <MediaCard
                      key={artist.id}
                      id={artist.id}
                      title={artist.name}
                      image={artist.image}
                      type="artist"
                      onClick={() => navigate('artist-detail', { id: artist.id })}
                    />
                  ))}
                </div>
              </section>
            )}

            {results.albums.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Álbumes</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.albums.slice(0, 6).map((album) => (
                    <MediaCard
                      key={album.id}
                      id={album.id}
                      title={album.title}
                      subtitle={album.artist?.name || ''}
                      image={album.image}
                      type="album"
                      onClick={() => navigate('album-detail', { id: album.id })}
                    />
                  ))}
                </div>
              </section>
            )}

            {results.podcasts.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Podcasts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.podcasts.map((podcast) => (
                    <MediaCard
                      key={podcast.id}
                      id={podcast.id}
                      title={podcast.title}
                      subtitle={`${podcast.episodeCount || 0} episodios`}
                      image={podcast.image}
                      type="podcast"
                      onClick={() => navigate('podcast-detail', { id: podcast.id })}
                    />
                  ))}
                </div>
              </section>
            )}

            {results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && results.podcasts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg font-medium">No se encontraron resultados</p>
                <p className="text-sm text-muted-foreground mt-1">Intenta buscar con otras palabras</p>
              </div>
            )}
          </motion.div>
        )}

        {!isLoading && !results && debouncedQuery.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Busca tu música favorita</h3>
            <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">
              Encuentra canciones, artistas, álbumes y podcasts
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
