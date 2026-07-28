'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore, usePlayerStore } from '@/stores';
import { MediaCard, SectionHeader, SkeletonGrid, EmptyState } from '@/components/shared/MediaComponents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, ListMusic, Heart, Disc, Users, Podcast, Clock, Play } from 'lucide-react';
import type { Playlist, Favorite, Album, Artist, Reproduction, Song } from '@/types';
import { cn, formatDuration } from '@/lib/constants';

export function LibraryView() {
  const navigate = useNavigationStore((s) => s.navigate);

  const { data: playlists, isLoading: loadingPlaylists } = useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: () => fetch('/api/playlists').then((r) => r.json()),
  });

  const { data: favorites, isLoading: loadingFavorites } = useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: () => fetch('/api/favorites').then((r) => r.json()),
  });

  const { data: albums, isLoading: loadingAlbums } = useQuery<Album[]>({
    queryKey: ['albums'],
    queryFn: () => fetch('/api/albums').then((r) => r.json()),
  });

  const { data: artists, isLoading: loadingArtists } = useQuery<Artist[]>({
    queryKey: ['artists'],
    queryFn: () => fetch('/api/artists').then((r) => r.json()),
  });

  const { data: history, isLoading: loadingHistory } = useQuery<Reproduction[]>({
    queryKey: ['reproductions'],
    queryFn: () => fetch('/api/reproductions').then((r) => r.json()),
  });

  return (
    <div className="space-y-6 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-6">Tu Biblioteca</h1>
      </motion.div>

      <Tabs defaultValue="playlists" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="playlists" className="gap-1.5">
            <ListMusic className="w-4 h-4" />
            <span className="hidden sm:inline">Playlists</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1.5">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Favoritos</span>
          </TabsTrigger>
          <TabsTrigger value="albums" className="gap-1.5">
            <Disc className="w-4 h-4" />
            <span className="hidden sm:inline">Álbumes</span>
          </TabsTrigger>
          {/* Pestaña Artistas — oculta de la navegación a pedido */}
          {false && (
            <TabsTrigger value="artists" className="gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Artistas</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Historial</span>
          </TabsTrigger>
        </TabsList>

        {/* Playlists */}
        <TabsContent value="playlists">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="Tus playlists" />
            <Button size="sm" onClick={() => navigate('create-playlist')}>
              <Plus className="w-4 h-4 mr-1" />
              Crear
            </Button>
          </div>
          {loadingPlaylists ? (
            <SkeletonGrid count={4} />
          ) : playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {playlists.map((pl) => (
                <MediaCard
                  key={pl.id}
                  id={pl.id}
                  title={pl.title}
                  subtitle={pl.description || `${pl.songCount || 0} canciones`}
                  image={pl.image}
                  type="playlist"
                  onClick={() => navigate('playlist-detail', { id: pl.id })}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No hay playlists"
              description="Crea tu primera playlist para organizar tu música"
              icon={<ListMusic className="w-8 h-8 text-muted-foreground" />}
              action={{ label: 'Crear playlist', onClick: () => navigate('create-playlist') }}
            />
          )}
        </TabsContent>

        {/* Favorites */}
        <TabsContent value="favorites">
          <SectionHeader title="Tus favoritos" />
          {loadingFavorites ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 rounded bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="space-y-1">
              {favorites.map((fav) => (
                fav.song && <FavoriteItem key={fav.id} favorite={{ id: fav.id, songId: fav.songId, song: fav.song }} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin favoritos"
              description="Agrega canciones a tus favoritos para encontrarlas fácilmente"
              icon={<Heart className="w-8 h-8 text-muted-foreground" />}
            />
          )}
        </TabsContent>

        {/* Albums */}
        <TabsContent value="albums">
          <SectionHeader title="Álbumes guardados" />
          {loadingAlbums ? (
            <SkeletonGrid count={4} />
          ) : albums && albums.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {albums.map((album) => (
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
          ) : (
            <EmptyState
              title="Sin álbumes"
              description="Explora álbumes y guárdalos en tu biblioteca"
              icon={<Disc className="w-8 h-8 text-muted-foreground" />}
            />
          )}
        </TabsContent>

        {/* Artists */}
        <TabsContent value="artists">
          <SectionHeader title="Artistas seguidos" />
          {loadingArtists ? (
            <SkeletonGrid count={4} />
          ) : artists && artists.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {artists.map((artist) => (
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
          ) : (
            <EmptyState
              title="Sin artistas"
              description="Sigue a tus artistas favoritos para ver sus novedades"
              icon={<Users className="w-8 h-8 text-muted-foreground" />}
            />
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <SectionHeader title="Historial de reproducción" />
          {loadingHistory ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 rounded bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-1">
              {history.slice(0, 20).map((rep, idx) => (
                rep.song && <FavoriteItem key={rep.id} favorite={{ id: rep.id, songId: rep.song.id, song: rep.song }} index={idx} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin historial"
              description="Las canciones que escuches aparecerán aquí"
              icon={<Clock className="w-8 h-8 text-muted-foreground" />}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FavoriteItem({ favorite, index }: { favorite: { id: string; songId: string; song: Song }; index?: number }) {
  const playSong = usePlayerStore((s) => s.playSong);
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isActive = currentSong?.id === favorite.song.id;

  return (
    <button
      onClick={() => playSong(favorite.song)}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left hover:bg-accent',
        isActive && 'bg-accent/60'
      )}
    >
      <span className="w-5 text-center text-xs text-muted-foreground tabular-nums">
        {index !== undefined ? index + 1 : ''}
      </span>
      <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
        {favorite.song.image ? (
          <img src={favorite.song.image} alt={favorite.song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            {favorite.song.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', isActive && 'text-primary')}>
          {favorite.song.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{favorite.song.artist?.name}</p>
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{formatDuration(favorite.song.duration)}</span>
    </button>
  );
}
