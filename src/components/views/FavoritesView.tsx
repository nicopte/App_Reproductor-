'use client';

import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/stores';
import { SkeletonList, EmptyState } from '@/components/shared/MediaComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, Play, Trash2 } from 'lucide-react';
import { cn, formatDuration } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Episode } from '@/types';

interface FavoriteItem {
  id: string;
  episodeId: string;
  episode: Episode;
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
    mutationFn: (episodeId: string) =>
      fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const handlePlayAll = () => {
    if (favorites && favorites.length > 0) {
      const episodes = favorites.map((f) => f.episode).filter((e) => e && e.url);
      if (episodes.length > 0) playSong(episodes[0], episodes);
    }
  };

  const totalDuration = favorites?.reduce((acc, f) => acc + (f.episode?.duration || 0), 0) || 0;

  return (
    <div className="space-y-6 pb-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-end gap-6 mb-6">
          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center shadow-2xl">
            <Heart className="w-20 h-20 text-primary/60" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">Favoritos</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Favoritos</h1>
            <p className="text-sm text-muted-foreground">
              {favorites?.length || 0} episodios • {formatDuration(totalDuration)}
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
            <span className="hidden md:block">Podcast</span>
            <span className="text-right">Duración</span>
          </div>
          {favorites.map((fav, idx) => {
            const episode = fav.episode;
            if (!episode) return null;
            const isActive = currentSong?.id === episode.id;
            const playableEpisodes = favorites.map((f) => f.episode).filter((e) => e && e.url);
            return (
              <div
                key={fav.id}
                className={cn(
                  'grid grid-cols-[32px_1fr_1fr_80px] md:grid-cols-[32px_1fr_1fr_1fr_80px] items-center gap-3 px-3 py-2 rounded-lg transition-colors group hover:bg-accent cursor-pointer',
                  isActive && 'bg-accent/60'
                )}
                onClick={() => episode.url && playSong(episode, playableEpisodes)}
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
                    {episode.image || episode.podcast?.image ? (
                      <img src={episode.image || episode.podcast?.image} alt={episode.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {episode.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium truncate', isActive && 'text-primary')}>{episode.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{episode.podcast?.title}</p>
                  </div>
                </div>
                <p className="hidden md:block text-sm text-muted-foreground truncate">{episode.podcast?.title}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground tabular-nums">{formatDuration(episode.duration)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMutation.mutate(episode.id);
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
          description="Marcá episodios como favoritos para encontrarlos fácilmente"
          icon={<Heart className="w-8 h-8 text-muted-foreground" />}
        />
      )}
    </div>
  );
}
