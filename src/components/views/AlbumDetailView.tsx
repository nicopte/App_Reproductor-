'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore, usePlayerStore } from '@/stores';
import { SectionHeader, SkeletonGrid, EmptyState } from '@/components/shared/MediaComponents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Disc } from 'lucide-react';
import { cn, formatDuration } from '@/lib/constants';
import type { Album, Song } from '@/types';

interface AlbumDetail extends Album {
  songs: Song[];
}

export function AlbumDetailView({ albumId }: { albumId: string }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const playSong = usePlayerStore((s) => s.playSong);
  const currentSong = usePlayerStore((s) => s.currentSong);

  const { data: album, isLoading } = useQuery<AlbumDetail>({
    queryKey: ['album', albumId],
    queryFn: () => fetch(`/api/albums/${albumId}`).then((r) => r.json()),
    enabled: !!albumId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="space-y-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-3 w-12 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!album) return <EmptyState title="Álbum no encontrado" description="El álbum que buscas no existe" />;

  const handlePlayAll = () => {
    if (album.songs?.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  const totalDuration = album.songs?.reduce((acc, s) => acc + s.duration, 0) || 0;

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden bg-muted shadow-2xl flex-shrink-0">
          {album.image ? (
            <img src={album.image} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="mb-2">Álbum</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{album.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => album.artist && navigate('artist-detail', { id: album.artistId })} className="font-medium text-foreground hover:underline">
              {album.artist?.name}
            </button>
            <span>•</span>
            <span>{album.year}</span>
            <span>•</span>
            <span>{album.songs?.length || 0} canciones, {formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handlePlayAll} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-5 h-5 fill-current mr-2" />
              Reproducir
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Song List */}
      <div className="space-y-1">
        <div className="grid grid-cols-[32px_1fr_1fr_80px] gap-3 px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border/50">
          <span>#</span>
          <span>Título</span>
          <span className="text-right">Duración</span>
        </div>
        {album.songs?.map((song, idx) => {
          const isActive = currentSong?.id === song.id;
          return (
            <div
              key={song.id}
              className={cn(
                'grid grid-cols-[32px_1fr_1fr_80px] items-center gap-3 px-3 py-2 rounded-lg transition-colors group hover:bg-accent cursor-pointer',
                isActive && 'bg-accent/60'
              )}
              onClick={() => playSong(song, album.songs || [])}
            >
              <div className="flex items-center justify-center w-8">
                <span className={cn('text-sm tabular-nums', isActive ? 'text-primary' : 'text-muted-foreground group-hover:hidden')}>
                  {idx + 1}
                </span>
                <span className="hidden group-hover:block text-muted-foreground">
                  <Play className="w-4 h-4 fill-current" />
                </span>
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-medium truncate', isActive && 'text-primary')}>{song.title}</p>
              </div>
              <span className="text-sm text-muted-foreground tabular-nums text-right">{formatDuration(song.duration)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
