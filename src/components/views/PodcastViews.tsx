'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigationStore, usePlayerStore, useAuthStore } from '@/stores';
import { MediaCard, SectionHeader, SkeletonGrid, EmptyState } from '@/components/shared/MediaComponents';
import { motion } from 'framer-motion';
import { Podcast, Mic, Clock, Plus, Trash2, Star, MessageCircle, Heart, Pencil, X as XIcon } from 'lucide-react';
import { formatDuration, formatDate } from '@/lib/constants';
import { cn } from '@/lib/constants';
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
          <h1 className="font-display text-3xl md:text-4xl mb-2">Podcasts</h1>
          <p className="text-muted-foreground text-sm">Descubre programas y episodios</p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => navigate('create-podcast')}
            className="gap-1.5 shrink-0 rounded-full bg-gradient-warm text-primary-foreground shadow-glow border-0 hover:scale-[1.02] transition-transform"
          >
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

  const deleteEpisodeMutation = useMutation({
    mutationFn: (episodeId: string) =>
      fetch(`/api/podcasts/${podcastId}/episodes/${episodeId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcast', podcastId] });
    },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');

  const updatePodcastMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/podcasts/${podcastId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          image: editImage || null,
        }),
      }),
    onSuccess: async (res) => {
      if (!res.ok) return;
      queryClient.invalidateQueries({ queryKey: ['podcast', podcastId] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setIsEditing(false);
    },
  });
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
          <div className="w-48 h-48 rounded-3xl bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-20 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-64 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card shadow-soft flex items-center gap-3 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-2xl bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-1/3 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!podcast) return <EmptyState title="Podcast no encontrado" description="El podcast que buscas no existe" />;

  const isOwner = !!currentUser && podcast.user?.id === currentUser.id;
  const isAdmin = !!currentUser?.isAdmin;

  const handlePlayEpisode = (episode: Episode) => {
    if (episode.url) {
      playSong({ ...episode, podcast: episode.podcast || { id: podcast.id, title: podcast.title, image: podcast.image, userId: podcast.userId } });
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="bg-card shadow-card animate-float w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden flex-shrink-0">
          {podcast.image ? (
            <img src={podcast.image} alt={podcast.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-soft">
              <Podcast className="w-16 h-16 text-primary/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <span className="bg-card shadow-soft inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider mb-2">
              Podcast
            </span>
            {currentUser && !isEditing && (isOwner || isAdmin) && (
              <div className="flex items-center gap-1 shrink-0">
                {(isOwner || isAdmin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 rounded-full bg-card shadow-soft hover:shadow-card"
                    onClick={() => {
                      setEditTitle(podcast.title);
                      setEditDescription(podcast.description || '');
                      setEditImage(podcast.image || '');
                      setIsEditing(true);
                    }}
                    aria-label="Editar podcast"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive rounded-full bg-card shadow-soft hover:bg-destructive/10 gap-1.5"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Eliminar podcast"
                >
                  <Trash2 className="w-4 h-4" />
                  {isOwner ? 'Eliminar podcast' : 'Eliminar (admin)'}
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="bg-card shadow-soft rounded-3xl p-4 space-y-3 max-w-xl">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Portada</label>
                <ImageUploader folder="podcasts" value={editImage} onChange={(url) => setEditImage(url)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Título</label>
                <Input className="rounded-2xl" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título del podcast" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Descripción</label>
                <Textarea className="rounded-2xl" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} placeholder="Descripción" />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-warm text-primary-foreground shadow-glow border-0"
                  disabled={!editTitle.trim() || updatePodcastMutation.isPending}
                  onClick={() => updatePodcastMutation.mutate()}
                >
                  {updatePodcastMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsEditing(false)} disabled={updatePodcastMutation.isPending}>
                  <XIcon className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl md:text-5xl leading-tight mb-2">{podcast.title}</h1>
              {podcast.description && (
                <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">{podcast.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {podcast.episodes?.length || 0} episodios
              </p>
            </>
          )}

          {showDeleteConfirm && (
            <div className="bg-card shadow-soft mt-4 p-4 rounded-3xl border border-destructive/20 space-y-3 max-w-xl">
              <p className="text-sm">
                ¿Eliminar <strong>{podcast.title}</strong>? Esto borra el podcast y sus{' '}
                {podcast.episodes?.length || 0} episodio(s) de forma permanente.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full"
                  disabled={deletePodcastMutation.isPending}
                  onClick={() => deletePodcastMutation.mutate()}
                >
                  {deletePodcastMutation.isPending ? 'Eliminando…' : 'Sí, eliminar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
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
          <h2 className="font-display text-xl md:text-2xl">Episodios</h2>
          {currentUser && podcast.user?.id === currentUser.id && (
            <Button
              variant={showAddEpisode ? 'outline' : 'default'}
              size="sm"
              className={cn(
                'gap-1.5 rounded-full',
                !showAddEpisode && 'bg-gradient-warm text-primary-foreground shadow-glow border-0'
              )}
              onClick={() => setShowAddEpisode((v) => !v)}
            >
              <Plus className="w-4 h-4" />
              {showAddEpisode ? 'Cancelar' : 'Agregar episodio'}
            </Button>
          )}
        </div>

        {showAddEpisode && (
          <form onSubmit={handleAddEpisode} className="bg-card shadow-soft mb-6 p-4 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <ImageUploader folder="podcasts" value={epImage} onChange={setEpImage} label="Portada (opcional)" />
              <div className="flex-1 space-y-3">
                <div>
                  <label htmlFor="ep-title" className="text-sm font-medium mb-1.5 block">Título *</label>
                  <Input
                    id="ep-title"
                    className="rounded-2xl"
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
                    className="rounded-2xl"
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
              <Button
                type="submit"
                disabled={addEpisodeMutation.isPending}
                className="flex-1 rounded-full bg-gradient-warm text-primary-foreground shadow-glow border-0"
              >
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
              className="bg-card shadow-soft hover:shadow-card flex items-center gap-4 p-3 rounded-3xl transition-all cursor-pointer group"
              onClick={() => handlePlayEpisode(episode)}
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted flex-shrink-0 relative">
                {episode.image ? (
                  <img src={episode.image} alt={episode.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-soft">
                    <Mic className="w-5 h-5 text-primary/50" />
                  </div>
                )}
                <div className="bg-gradient-warm absolute inset-0 opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current text-primary-foreground" />
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
                      'w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0',
                      isFavorite ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary'
                    )}
                  >
                    <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                  </button>
                </>
              )}
              {currentUser && (podcast.user?.id === currentUser.id || currentUser.isAdmin) && (
                <button
                  type="button"
                  aria-label="Eliminar episodio"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEpisodeMutation.mutate(episode.id);
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* Calificación */}
      <section className="bg-card shadow-soft max-w-xl rounded-3xl p-5">
        <h2 className="font-display text-xl mb-3">Calificación</h2>
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
      <section className="max-w-xl space-y-4">
        <h2 className="font-display flex items-center gap-2 text-xl">
          <MessageCircle className="text-primary w-4 h-4" />
          Comentarios {comments && comments.length > 0 ? `(${comments.length})` : ''}
        </h2>

        {currentUser ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim()) addCommentMutation.mutate();
            }}
            className="bg-card shadow-soft rounded-2xl p-2 space-y-2"
          >
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribí un comentario..."
              maxLength={1000}
              rows={3}
              className="rounded-xl border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <div className="flex justify-end px-1 pb-1">
              <Button
                type="submit"
                size="sm"
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className="rounded-full bg-gradient-warm text-primary-foreground shadow-glow border-0"
              >
                {addCommentMutation.isPending ? 'Publicando…' : 'Comentar'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">Iniciá sesión para dejar un comentario.</p>
        )}

        <div className="space-y-3">
          {comments?.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no hay comentarios. ¡Sé el primero!</p>
          )}
          {comments?.map((comment) => {
            const canDelete = currentUser && (comment.user.id === currentUser.id || podcast.user?.id === currentUser.id || currentUser.isAdmin);
            return (
              <div key={comment.id} className="bg-card shadow-soft flex gap-3 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-gradient-soft flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
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
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
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
