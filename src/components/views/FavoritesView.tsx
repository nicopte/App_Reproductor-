'use client';

import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/stores';
import { SectionHeader, EmptyState, SkeletonList } from '@/components/shared/MediaComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, Play, Trash2 } from 'lucide-react';
import { cn, formatDuration } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Song } from '@/types';

interface FavoriteItem {
  id: string;
  songId: string;
  song: Song;
  createdAt: string;
}

export function FavoritesView() {
  const playSong = usePlayerStore((s) => s.playSong);
  const currentSong = usePlayerStore((s) => s.currentSong);
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery<FavoriteItem[]>({
    queryKey: ['favorites'],
    queryFn: () => fetch('/api/favorites').then((r) => r.json()),
  });

  const toggleMutation = useMutation({
    mutationFn: (songId: string) =>
      fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const handlePlayAll = () => {
    if (favorites && favorites.length > 0) {
      const songs = favorites.map((f) => f.song).filter(Boolean);
      playSong(songs[0], songs);
    }
  };

  const totalDuration = favorites?.reduce((acc, f) => acc + (f.song?.duration || 0), 0) || 0;

  return (
    <div className="space-y-6 pb-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-end gap-6 mb-6">
          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center shadow-2xl">
            <Heart className="w-20 h-20 text-primary/60" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">Playlist</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Favoritos</h1>
            <p className="text-sm text-muted-foreground">
              {favorites?.length || 0} canciones • {formatDuration(totalDuration)}
            </p>
            <Button onClick={handlePlayAll} size="lg" className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-5 h-5 fill-current mr-2" />
              Reproducir
            </Button>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <SkeletonList count={8} />
      ) : favorites && favorites.length > 0 ? (
        <div className="space-y-1">
          <div className="grid grid-cols-[32px_1fr_1fr_80px] md:grid-cols-[32px_1fr_1fr_1fr_80px] gap-3 px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border/50">
            <span>#</span>
            <span>Título</span>
            <span className="hidden md:block">Álbum</span>
            <span className="text-right">Duración</span>
          </div>
          {favorites.map((fav, idx) => {
            const song = fav.song;
            const isActive = currentSong?.id === song.id;
            return (
              <div
                key={fav.id}
                className={cn(
                  'grid grid-cols-[32px_1fr_1fr_80px] md:grid-cols-[32px_1fr_1fr_1fr_80px] items-center gap-3 px-3 py-2 rounded-lg transition-colors group hover:bg-accent cursor-pointer',
                  isActive && 'bg-accent/60'
                )}
                onClick={() => playSong(song, favorites.map(f => f.song).filter(Boolean))}
              >
                <div className="flex items-center justify-center w-8">
                  <span className={cn('text-sm tabular-nums', isActive ? 'text-primary' : 'text-muted-foreground group-hover:hidden')}>
                    {idx + 1}
                  </span>
                  <span className="hidden group-hover:block text-muted-foreground">
                    <Play className="w-4 h-4 fill-current" />
                  </span>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                    {song.image ? (
                      <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {song.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium truncate', isActive && 'text-primary')}>{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{song.artist?.name}</p>
                  </div>
                </div>
                <p className="hidden md:block text-sm text-muted-foreground truncate">{song.album?.title}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground tabular-nums">{formatDuration(song.duration)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMutation.mutate(song.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Quitar de favoritos"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Sin favoritos"
          description="Agrega canciones a tus favoritos para encontrarlas fácilmente"
          icon={<Heart className="w-8 h-8 text-muted-foreground" />}
        />
      )}
    </div>
  );
}
