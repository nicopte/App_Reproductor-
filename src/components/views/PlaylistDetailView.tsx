'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigationStore, usePlayerStore, useAuthStore } from '@/stores';
import { SectionHeader, EmptyState } from '@/components/shared/MediaComponents';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Plus, Music, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn, formatDuration } from '@/lib/constants';
import type { Playlist, Song } from '@/types';

interface PlaylistWithSongs extends Omit<Playlist, 'songs'> {
  songs: Array<{ id: string; song: Song; position: number }>;
}

export function PlaylistDetailView({ playlistId }: { playlistId: string }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const playSong = usePlayerStore((s) => s.playSong);
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showAddSong, setShowAddSong] = useState(false);

  const { data: playlist, isLoading } = useQuery<PlaylistWithSongs>({
    queryKey: ['playlist', playlistId],
    queryFn: () => fetch(`/api/playlists/${playlistId}`).then((r) => r.json()),
    enabled: !!playlistId,
  });

  const { data: allSongs } = useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: () => fetch('/api/songs').then((r) => r.json()),
  });

  const updateCoverMutation = useMutation({
    mutationFn: (image: string) =>
      fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image || null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });

  const addSongMutation = useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      setShowAddSong(false);
    },
  });

  const removeSongMutation = useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      fetch(`/api/playlists/${playlistId}/songs?songId=${songId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/playlists/${id}`, { method: 'DELETE' }),
    onSuccess: () => navigate('library'),
  });

  const handlePlayAll = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      const songs = playlist.songs.map((s) => s.song).filter(Boolean);
      playSong(songs[0], songs);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  if (!playlist) return <EmptyState title="Playlist no encontrada" description="La playlist que buscas no existe" />;

  const songs = playlist.songs?.map((s) => s.song).filter(Boolean) || [];

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-end gap-6">
        {currentUser && playlist.user?.id === currentUser.id ? (
          <div className="flex-shrink-0">
            <ImageUploader
              folder="playlists"
              value={playlist.image ?? undefined}
              onChange={(url) => updateCoverMutation.mutate(url)}
            />
          </div>
        ) : (
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden bg-muted shadow-2xl flex-shrink-0">
            {playlist.image ? (
              <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-16 h-16 text-muted-foreground/40" />
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="mb-2">Playlist</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{playlist.title}</h1>
          {playlist.description && (
            <p className="text-muted-foreground text-sm mb-3">{playlist.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {songs.length} canciones
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handlePlayAll} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-5 h-5 fill-current mr-2" />
              Reproducir
            </Button>
            <Button variant="outline" size="lg" onClick={() => setShowAddSong(!showAddSong)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar canción
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(playlist.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Add Song Panel */}
      {showAddSong && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Agregar canción</h3>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setShowAddSong(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {allSongs?.filter((s) => !songs.find((ps) => ps.id === s.id)).map((song) => (
              <button
                key={song.id}
                onClick={() => addSongMutation.mutate({ playlistId: playlist.id, songId: song.id })}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                  {song.image ? (
                    <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      {song.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist?.name}</p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Song List */}
      <div className="space-y-1">
        <div className="grid grid-cols-[32px_1fr_1fr_80px] md:grid-cols-[32px_1fr_1fr_1fr_80px] gap-3 px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border/50">
          <span>#</span>
          <span>Título</span>
          <span className="hidden md:block">Álbum</span>
          <span className="text-right">Duración</span>
        </div>
        {songs.map((song, idx) => {
          const isActive = currentSong?.id === song.id;
          return (
            <div
              key={`${song.id}-${idx}`}
              className={cn(
                'grid grid-cols-[32px_1fr_1fr_80px] md:grid-cols-[32px_1fr_1fr_1fr_80px] items-center gap-3 px-3 py-2 rounded-lg transition-colors group hover:bg-accent cursor-pointer',
                isActive && 'bg-accent/60'
              )}
              onClick={() => playSong(song, songs)}
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
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm text-muted-foreground tabular-nums">{formatDuration(song.duration)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSongMutation.mutate({ playlistId: playlist.id, songId: song.id });
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-3 w-12 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
