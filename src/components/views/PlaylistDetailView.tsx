'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigationStore, usePlayerStore, useAuthStore } from '@/stores';
import { EmptyState } from '@/components/shared/MediaComponents';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Plus, Podcast as PodcastIcon, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn, formatDuration } from '@/lib/constants';
import type { Playlist, Episode } from '@/types';

interface PlaylistWithEpisodes extends Omit<Playlist, 'episodes'> {
  episodes: Array<{ id: string; episode: Episode; position: number }>;
}

export function PlaylistDetailView({ playlistId }: { playlistId: string }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const playSong = usePlayerStore((s) => s.playSong);
  const currentSong = usePlayerStore((s) => s.currentSong);
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: playlist, isLoading } = useQuery<PlaylistWithEpisodes>({
    queryKey: ['playlist', playlistId],
    queryFn: () => fetch(`/api/playlists/${playlistId}`).then((r) => r.json()),
    enabled: !!playlistId,
  });

  const { data: allEpisodes } = useQuery<Episode[]>({
    queryKey: ['episodes'],
    queryFn: () => fetch('/api/episodes').then((r) => r.json()),
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

  const addEpisodeMutation = useMutation({
    mutationFn: ({ playlistId, episodeId }: { playlistId: string; episodeId: string }) =>
      fetch(`/api/playlists/${playlistId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
    },
  });

  const removeEpisodeMutation = useMutation({
    mutationFn: ({ playlistId, episodeId }: { playlistId: string; episodeId: string }) =>
      fetch(`/api/playlists/${playlistId}/episodes?episodeId=${episodeId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/playlists/${id}`, { method: 'DELETE' }),
    onSuccess: (res) => {
      if (!res.ok) return;
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      navigate('library');
    },
  });

  const handlePlayAll = () => {
    if (episodes.length > 0) {
      const playable = episodes.filter((e) => e.url);
      if (playable.length > 0) playSong(playable[0], playable);
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
      </div>
    );
  }

  if (!playlist) return <EmptyState title="Playlist no encontrada" description="La playlist que buscás no existe" />;

  const episodes = playlist.episodes?.map((e) => e.episode).filter(Boolean) || [];
  const isOwner = currentUser && playlist.user?.id === currentUser.id;

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-end gap-6">
        {isOwner ? (
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
                <PodcastIcon className="w-16 h-16 text-muted-foreground/40" />
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
            {episodes.length} episodios
          </p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Button onClick={handlePlayAll} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-5 h-5 fill-current mr-2" />
              Reproducir
            </Button>
            {isOwner && (
              <>
                <Button variant="outline" size="lg" onClick={() => setShowAddEpisode(!showAddEpisode)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar episodio
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Eliminar playlist"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3 max-w-xl">
              <p className="text-sm">
                ¿Eliminar la playlist <strong>{playlist.title}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(playlist.id)}
                >
                  {deleteMutation.isPending ? 'Eliminando…' : 'Sí, eliminar'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleteMutation.isPending}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Episode Panel */}
      {showAddEpisode && isOwner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Agregar episodio</h3>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setShowAddEpisode(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {allEpisodes?.filter((ep) => !episodes.find((pe) => pe.id === ep.id)).map((episode) => (
              <button
                key={episode.id}
                onClick={() => addEpisodeMutation.mutate({ playlistId: playlist.id, episodeId: episode.id })}
                disabled={addEpisodeMutation.isPending}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                  {episode.image || episode.podcast?.image ? (
                    <img src={episode.image || episode.podcast?.image} alt={episode.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      {episode.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{episode.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{episode.podcast?.title}</p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
            {allEpisodes && allEpisodes.filter((ep) => !episodes.find((pe) => pe.id === ep.id)).length === 0 && (
              <p className="text-sm text-muted-foreground px-3 py-2">No hay más episodios para agregar.</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Episode List */}
      {episodes.length === 0 ? (
        <EmptyState
          title="Playlist vacía"
          description="Agregá episodios para empezar a armar tu lista"
          icon={<PodcastIcon className="w-8 h-8 text-muted-foreground" />}
        />
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-[32px_1fr_1fr_80px] md:grid-cols-[32px_1fr_1fr_1fr_80px] gap-3 px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border/50">
            <span>#</span>
            <span>Título</span>
            <span className="hidden md:block">Podcast</span>
            <span className="text-right">Duración</span>
          </div>
          {episodes.map((episode, idx) => {
            const isActive = currentSong?.id === episode.id;
            return (
              <div
                key={`${episode.id}-${idx}`}
                className={cn(
                  'grid grid-cols-[32px_1fr_1fr_80px] md:grid-cols-[32px_1fr_1fr_1fr_80px] items-center gap-3 px-3 py-2 rounded-lg transition-colors group hover:bg-accent cursor-pointer',
                  isActive && 'bg-accent/60'
                )}
                onClick={() => episode.url && playSong(episode, episodes.filter((e) => e.url))}
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
                <div className="flex items-center justify-end gap-1">
                  <span className="text-sm text-muted-foreground tabular-nums">{formatDuration(episode.duration)}</span>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEpisodeMutation.mutate({ playlistId: playlist.id, episodeId: episode.id });
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Quitar de la playlist"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
