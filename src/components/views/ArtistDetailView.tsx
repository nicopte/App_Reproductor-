'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore, usePlayerStore } from '@/stores';
import { MediaCard, SectionHeader, SkeletonGrid, SkeletonList, EmptyState } from '@/components/shared/MediaComponents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Users, Heart, Music } from 'lucide-react';
import { cn, formatDuration } from '@/lib/constants';
import type { Artist, Album, Song } from '@/types';

interface ArtistDetail extends Artist {
  songs: Song[];
  albums: Album[];
  _count: { songs: number; albums: number; follows: number };
}

export function ArtistDetailView({ artistId }: { artistId: string }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const playSong = usePlayerStore((s) => s.playSong);
  const currentSong = usePlayerStore((s) => s.currentSong);

  const { data: artist, isLoading } = useQuery<ArtistDetail>({
    queryKey: ['artist', artistId],
    queryFn: () => fetch(`/api/artists/${artistId}`).then((r) => r.json()),
    enabled: !!artistId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 rounded-full bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  if (!artist) return <EmptyState title="Artista no encontrado" description="El artista que buscas no existe" />;

  const handlePlayAll = () => {
    if (artist.songs?.length > 0) {
      playSong(artist.songs[0], artist.songs);
    }
  };

  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-muted shadow-2xl flex-shrink-0">
          {artist.image ? (
            <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="mb-2">Artista</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{artist.name}</h1>
          {artist.bio && (
            <p className="text-muted-foreground text-sm max-w-xl">{artist.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{artist._count?.songs || artist.songs?.length || 0} canciones</span>
            <span>{artist._count?.albums || artist.albums?.length || 0} álbumes</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handlePlayAll} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-5 h-5 fill-current mr-2" />
              Reproducir
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Popular Songs */}
      {artist.songs?.length > 0 && (
        <section>
          <SectionHeader title="Popular" />
          <div className="space-y-1">
            {artist.songs.map((song, idx) => {
              const isActive = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className={cn(
                    'grid grid-cols-[32px_1fr_1fr_80px] md:grid-cols-[32px_1fr_1fr_1fr_80px] items-center gap-3 px-3 py-2 rounded-lg transition-colors group hover:bg-accent cursor-pointer',
                    isActive && 'bg-accent/60'
                  )}
                  onClick={() => playSong(song, artist.songs || [])}
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
                    </div>
                  </div>
                  <p className="hidden md:block text-sm text-muted-foreground truncate">{song.album?.title}</p>
                  <span className="text-sm text-muted-foreground tabular-nums">{formatDuration(song.duration)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Albums */}
      {artist.albums?.length > 0 && (
        <section>
          <SectionHeader title="Discografía" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.albums.map((album) => (
              <MediaCard
                key={album.id}
                id={album.id}
                title={album.title}
                subtitle={`${album.year || ''}`}
                image={album.image}
                type="album"
                onClick={() => navigate('album-detail', { id: album.id })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
