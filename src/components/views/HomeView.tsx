'use client';

import { useQuery } from '@tanstack/react-query';
import { usePlayerStore, useNavigationStore } from '@/stores';
import {
  MediaCard,
  SongRow,
  SectionHeader,
  SkeletonGrid,
  SkeletonList,
  GenreCard,
} from '@/components/shared/MediaComponents';
import { GENRES, formatDuration } from '@/lib/constants';
import { Play, TrendingUp, Clock, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import type { Song, Artist, Album, Playlist, Podcast } from '@/types';

export function HomeView() {
  const { data, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: () => fetch('/api/home').then((r) => r.json()),
  });

  const playSong = usePlayerStore((s) => s.playSong);
  const navigate = useNavigationStore((s) => s.navigate);

  const handlePlaySong = (song: Song, songs?: Song[]) => {
    playSong(song, songs);
  };

  const handlePlayAll = (songs: Song[]) => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Hero skeleton */}
        <div className="h-[280px] rounded-2xl bg-muted animate-pulse" />
        <SkeletonGrid count={6} />
        <SkeletonGrid count={6} />
        <SkeletonList count={5} />
      </div>
    );
  }

  const recentSongs: Song[] = data?.recentSongs || [];
  const popularArtists: Artist[] = data?.popularArtists || [];
  const newAlbums: Album[] = data?.newAlbums || [];
  const featuredPlaylists: Playlist[] = data?.featuredPlaylists || [];
  const recentPodcasts: Podcast[] = data?.recentPodcasts || [];

  return (
    <div className="space-y-8 pb-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-accent/30 p-6 md:p-10"
      >
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            Buenas tardes
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-6">
            Descubre música nueva, podcasts y más
          </p>
          {recentSongs.length > 0 && (
            <Button
              onClick={() => handlePlayAll(recentSongs)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all"
              size="lg"
            >
              <Play className="w-5 h-5 fill-current mr-2" />
              Reproducir todo
            </Button>
          )}
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
      </motion.div>

      {/* Quick Play Cards */}
      {recentSongs.slice(0, 6).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionHeader title="Reproducciones recientes" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentSongs.slice(0, 6).map((song) => (
              <button
                key={song.id}
                onClick={() => handlePlaySong(song, recentSongs)}
                className="flex items-center gap-3 bg-accent/40 hover:bg-accent rounded-md overflow-hidden transition-colors group"
              >
                <div className="w-12 h-12 flex-shrink-0 relative">
                  {song.image ? (
                    <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-4 h-4 fill-current text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2 pr-3">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist?.name}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Featured Playlists */}
      {featuredPlaylists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionHeader title="Playlists destacadas" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {featuredPlaylists.map((playlist) => (
              <MediaCard
                key={playlist.id}
                id={playlist.id}
                title={playlist.title}
                subtitle={playlist.description || `${playlist.songCount || 0} canciones`}
                image={playlist.image}
                type="playlist"
                onClick={() => navigate('playlist-detail', { id: playlist.id })}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Popular Artists — oculto de la navegación a pedido; el código y los datos siguen disponibles */}
      {false && popularArtists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SectionHeader title="Artistas populares" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {popularArtists.slice(0, 8).map((artist) => (
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
        </motion.div>
      )}

      {/* New Albums */}
      {newAlbums.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SectionHeader title="Álbumes nuevos" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {newAlbums.map((album) => (
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
        </motion.div>
      )}

      {/* Genres Browse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <SectionHeader title="Explorar por género" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {GENRES.map((genre) => (
            <GenreCard key={genre.name} name={genre.name} color={genre.color} />
          ))}
        </div>
      </motion.div>

      {/* Recent Podcasts */}
      {recentPodcasts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <SectionHeader title="Podcasts" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentPodcasts.map((podcast) => (
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
        </motion.div>
      )}
    </div>
  );
}

function Music({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
