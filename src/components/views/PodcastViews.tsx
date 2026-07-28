'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigationStore, usePlayerStore, useAuthStore } from '@/stores';
import { MediaCard, SectionHeader, SkeletonGrid, EmptyState } from '@/components/shared/MediaComponents';
import { motion } from 'framer-motion';
import { Podcast, Mic, Clock, Plus, Trash2, Star, MessageCircle, Heart, ListMusic } from 'lucide-react';
import { formatDuration, formatDate } from '@/lib/constants';
import { cn } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Play } from 'lucide-react';
import type { Podcast as PodcastType, Episode } from '@/types';
import { AudioUploader } from '@/components/shared/AudioUploader';
import { ImageUploader } from '@/components/shared/ImageUploader';

interface PodcastWithEpisodes extends PodcastType {
  episodes: Episode[];
}

export function PodcastsView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: podcasts, isLoading } = useQuery<PodcastType[]>({
    queryKey: ['podcasts'],
    queryFn: () => fetch('/api/podcasts').then((r) => r.json()),
  });

  return (
    <div className="space-y-6 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Podcasts</h1>
          <p className="text-muted-foreground text-sm">Descubre programas y episodios</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => navigate('create-podcast')} className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            Crear podcast
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : podcasts && podcasts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {podcasts.map((podcast) => (
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
      ) : (
        <EmptyState
          title="No hay podcasts"
          description="Aún no hay podcasts disponibles"
          icon={<Podcast className="w-8 h-8 text-muted-foreground" />}
        />
      )}
    </div>
  );
}

export function PodcastDetailView({ podcastId }: { podcastId: string }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const playSong = usePlayerStore((s) => s.playSong);
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [epTitle, setEpTitle] = useState('');
  const [epDescription, setEpDescription] = useState('');
  const [epImage, setEpImage] = useState('');
  const [epAudio, setEpAudio] = useState<{ url: string; durationSeconds: number; fileName: string } | null>(null);
  const [epError, setEpError] = useState('');

  const { data: podcast, isLoading } = useQuery<PodcastWithEpisodes>({
    queryKey: ['podcast', podcastId],
    queryFn: () => fetch(`/api/podcasts/${podcastId}`).then((r) => r.json()),
    enabled: !!podcastId,
  });

  const addEpisodeMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/podcasts/${podcastId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: epTitle.trim(),
          description: epDescription.trim() || undefined,
          image: epImage || undefined,
          url: epAudio?.url,
          duration: epAudio?.durationSeconds,
        }),
      }),
    onSuccess: async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEpError(data.error || 'No se pudo crear el episodio');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['podcast', podcastId] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setShowAddEpisode(false);
      setEpTitle('');
      setEpDescription('');
      setEpImage('');
      setEpAudio(null);
      setEpError('');
    },
  });

  const { data: favorites } = useQuery<{ episodeId: string }[]>({
    queryKey: ['favorites'],
    queryFn: () => fetch('/api/favorites').then((r) => r.json()),
    enabled: !!currentUser,
  });
  const favoriteEpisodeIds = new Set((favorites || []).map((f) => f.episodeId));

  const toggleFavoriteMutation = useMutation({
    mutationFn: (episodeId: string) =>
      fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const { data: myPlaylists } = useQuery<{ id: string; title: string }[]>({
    queryKey: ['playlists'],
    queryFn: () => fetch('/api/playlists').then((r) => r.json()),
    enabled: !!currentUser,
  });
  const [addToPlaylistEpisodeId, setAddToPlaylistEpisodeId] = useState<string | null>(null);

  const addToPlaylistMutation = useMutation({
    mutationFn: ({ playlistId, episodeId }: { playlistId: string; episodeId: string }) =>
      fetch(`/api/playlists/${playlistId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId }),
      }),
    onSuccess: () => setAddToPlaylistEpisodeId(null),
  });

  const deleteEpisodeMutation = useMutation({
    mutationFn: (episodeId: string) =>
      fetch(`/api/podcasts/${podcastId}/episodes/${episodeId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcast', podcastId] });
    },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deletePodcastMutation = useMutation({
    mutationFn: () => fetch(`/api/podcasts/${podcastId}`, { method: 'DELETE' }),
    onSuccess: (res) => {
      if (!res.ok) return;
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      navigate('podcasts');
    },
  });

  // Calificación
  const { data: ratingData } = useQuery<{ average: number; count: number; myRating: number | null }>({
    queryKey: ['podcast-rating', podcastId],
    queryFn: () => fetch(`/api/podcasts/${podcastId}/rating`).then((r) => r.json()),
    enabled: !!podcastId,
  });

  const rateMutation = useMutation({
    mutationFn: (value: number) =>
      fetch(`/api/podcasts/${podcastId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      queryClient.setQueryData(['podcast-rating', podcastId], data);
    },
  });

  // Comentarios
  const [commentText, setCommentText] = useState('');
  const { data: comments } = useQuery<
    { id: string; content: string; createdAt: string; user: { id: string; name: string; avatar: string | null } }[]
  >({
    queryKey: ['podcast-comments', podcastId],
    queryFn: () => fetch(`/api/podcasts/${podcastId}/comments`).then((r) => r.json()),
    enabled: !!podcastId,
  });

  const addCommentMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/podcasts/${podcastId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      }),
    onSuccess: async (res) => {
      if (!res.ok) return;
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['podcast-comments', podcastId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      fetch(`/api/podcasts/${podcastId}/comments/${commentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcast-comments', podcastId] });
    },
  });

  const handleAddEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    setEpError('');
    if (!epTitle.trim()) {
      setEpError('El título es requerido');
      return;
    }
    if (!epAudio) {
      setEpError('Subí el archivo de audio del episodio');
      return;
    }
    addEpisodeMutation.mutate();
  };

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
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!podcast) return <EmptyState title="Podcast no encontrado" description="El podcast que buscas no existe" />;

  const handlePlayEpisode = (episode: Episode) => {
    if (episode.url) {
      playSong({ ...episode, podcast: episode.podcast || { id: podcast.id, title: podcast.title, image: podcast.image, userId: podcast.userId } });
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden bg-muted shadow-2xl flex-shrink-0">
          {podcast.image ? (
            <img src={podcast.image} alt={podcast.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Podcast className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <Badge variant="secondary" className="mb-2">Podcast</Badge>
            {currentUser && podcast.user?.id === currentUser.id && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 shrink-0"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Eliminar podcast"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar podcast
              </Button>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{podcast.title}</h1>
          {podcast.description && (
            <p className="text-muted-foreground text-sm max-w-xl">{podcast.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {podcast.episodes?.length || 0} episodios
          </p>

          {showDeleteConfirm && (
            <div className="mt-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3 max-w-xl">
              <p className="text-sm">
                ¿Eliminar <strong>{podcast.title}</strong>? Esto borra el podcast y sus{' '}
                {podcast.episodes?.length || 0} episodio(s) de forma permanente.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletePodcastMutation.isPending}
                  onClick={() => deletePodcastMutation.mutate()}
                >
                  {deletePodcastMutation.isPending ? 'Eliminando…' : 'Sí, eliminar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletePodcastMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Episodes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Episodios</h2>
          {currentUser && podcast.user?.id === currentUser.id && (
            <Button
              variant={showAddEpisode ? 'outline' : 'default'}
              size="sm"
              className="gap-1.5"
              onClick={() => setShowAddEpisode((v) => !v)}
            >
              <Plus className="w-4 h-4" />
              {showAddEpisode ? 'Cancelar' : 'Agregar episodio'}
            </Button>
          )}
        </div>

        {showAddEpisode && (
          <form onSubmit={handleAddEpisode} className="mb-6 p-4 rounded-lg border border-border bg-muted/30 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <ImageUploader folder="podcasts" value={epImage} onChange={setEpImage} label="Portada (opcional)" />
              <div className="flex-1 space-y-3">
                <div>
                  <label htmlFor="ep-title" className="text-sm font-medium mb-1.5 block">Título *</label>
                  <Input
                    id="ep-title"
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    placeholder="Título del episodio"
                    aria-label="Título del episodio"
                  />
                </div>
                <div>
                  <label htmlFor="ep-description" className="text-sm font-medium mb-1.5 block">Descripción</label>
                  <Textarea
                    id="ep-description"
                    value={epDescription}
                    onChange={(e) => setEpDescription(e.target.value)}
                    placeholder="Descripción (opcional)"
                    rows={2}
                    aria-label="Descripción del episodio"
                  />
                </div>
              </div>
            </div>

            <AudioUploader
              value={epAudio?.url}
              fileName={epAudio?.fileName}
              onUploaded={({ url, durationSeconds }) =>
                setEpAudio({ url, durationSeconds, fileName: epTitle || 'episodio.mp3' })
              }
              onClear={() => setEpAudio(null)}
            />

            {epError && <p className="text-xs text-destructive">{epError}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={addEpisodeMutation.isPending} className="flex-1">
                {addEpisodeMutation.isPending ? 'Publicando...' : 'Publicar episodio'}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {podcast.episodes?.map((episode, idx) => {
            const isFavorite = favoriteEpisodeIds.has(episode.id);
            return (
            <div key={episode.id}>
            <div
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer group',
                'hover:bg-accent'
              )}
              onClick={() => handlePlayEpisode(episode)}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                {episode.image ? (
                  <img src={episode.image} alt={episode.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Mic className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-muted-foreground font-medium">{idx + 1}.</span>
                  <p className="text-sm font-medium truncate">{episode.title}</p>
                </div>
                {episode.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{episode.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(episode.duration)}</span>
              </div>
              {currentUser && (
                <>
                  <button
                    type="button"
                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteMutation.mutate(episode.id);
                    }}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0',
                      isFavorite ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary'
                    )}
                  >
                    <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                  </button>
                  <button
                    type="button"
                    aria-label="Agregar a playlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddToPlaylistEpisodeId(addToPlaylistEpisodeId === episode.id ? null : episode.id);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-all shrink-0"
                  >
                    <ListMusic className="w-4 h-4" />
                  </button>
                </>
              )}
              {currentUser && podcast.user?.id === currentUser.id && (
                <button
                  type="button"
                  aria-label="Eliminar episodio"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEpisodeMutation.mutate(episode.id);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {addToPlaylistEpisodeId === episode.id && (
              <div className="ml-16 mb-2 p-3 rounded-lg border border-border bg-card space-y-1 max-w-xs">
                {myPlaylists && myPlaylists.length > 0 ? (
                  myPlaylists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => addToPlaylistMutation.mutate({ playlistId: pl.id, episodeId: episode.id })}
                      disabled={addToPlaylistMutation.isPending}
                      className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {pl.title}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground px-2 py-1">
                    No tenés playlists todavía. Creá una desde tu Biblioteca.
                  </p>
                )}
              </div>
            )}
            </div>
            );
          })}
        </div>
      </section>

      {/* Calificación */}
      <section className="max-w-xl">
        <h2 className="text-xl font-bold mb-3">Calificación</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= (ratingData?.myRating || 0);
              return (
                <button
                  key={star}
                  type="button"
                  aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                  disabled={!currentUser || rateMutation.isPending}
                  onClick={() => rateMutation.mutate(star)}
                  className="disabled:cursor-not-allowed"
                >
                  <Star
                    className={cn(
                      'w-6 h-6 transition-colors',
                      filled ? 'fill-primary text-primary' : 'text-muted-foreground',
                      currentUser && 'hover:text-primary cursor-pointer'
                    )}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-sm text-muted-foreground">
            {ratingData && ratingData.count > 0
              ? `${ratingData.average.toFixed(1)} / 5 (${ratingData.count} calificación${ratingData.count === 1 ? '' : 'es'})`
              : 'Sin calificaciones todavía'}
          </span>
        </div>
        {!currentUser && (
          <p className="text-xs text-muted-foreground mt-2">Iniciá sesión para calificar este podcast.</p>
        )}
      </section>

      {/* Comentarios */}
      <section className="max-w-xl">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comentarios {comments && comments.length > 0 ? `(${comments.length})` : ''}
        </h2>

        {currentUser ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim()) addCommentMutation.mutate();
            }}
            className="mb-4 space-y-2"
          >
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribí un comentario..."
              maxLength={1000}
              rows={3}
            />
            <Button type="submit" size="sm" disabled={!commentText.trim() || addCommentMutation.isPending}>
              {addCommentMutation.isPending ? 'Publicando…' : 'Comentar'}
            </Button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground mb-4">Iniciá sesión para dejar un comentario.</p>
        )}

        <div className="space-y-4">
          {comments?.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no hay comentarios. ¡Sé el primero!</p>
          )}
          {comments?.map((comment) => {
            const canDelete = currentUser && (comment.user.id === currentUser.id || podcast.user?.id === currentUser.id);
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                  {comment.user.avatar ? (
                    <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                  ) : (
                    comment.user.name?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.user.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{comment.content}</p>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    aria-label="Eliminar comentario"
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
