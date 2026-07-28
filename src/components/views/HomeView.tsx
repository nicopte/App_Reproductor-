'use client';

import { useQuery } from '@tanstack/react-query';
import { usePlayerStore, useNavigationStore } from '@/stores';
import {
  MediaCard,
  SectionHeader,
  SkeletonGrid,
  SkeletonList,
} from '@/components/shared/MediaComponents';
import { Play, Podcast as PodcastIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { Episode, Playlist, Podcast } from '@/types';

export function HomeView() {
  const { data, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: () => fetch('/api/home').then((r) => r.json()),
  });

  const playSong = usePlayerStore((s) => s.playSong);
  const navigate = useNavigationStore((s) => s.navigate);

  const handlePlayEpisode = (episode: Episode, episodes?: Episode[]) => {
    if (episode.url) playSong(episode, episodes);
  };

  const handlePlayAll = (episodes: Episode[]) => {
    const playable = episodes.filter((e) => e.url);
    if (playable.length > 0) playSong(playable[0], playable);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-[280px] rounded-2xl bg-muted animate-pulse" />
        <SkeletonGrid count={6} />
        <SkeletonList count={5} />
      </div>
    );
  }

  const recentEpisodes: Episode[] = data?.recentEpisodes || [];
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
            Descubrí podcasts nuevos y tus episodios recientes
          </p>
          {recentEpisodes.length > 0 && (
            <Button
              onClick={() => handlePlayAll(recentEpisodes)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all"
              size="lg"
            >
              <Play className="w-5 h-5 fill-current mr-2" />
              Reproducir todo
            </Button>
          )}
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
      </motion.div>

      {/* Episodios recientes */}
      {recentEpisodes.slice(0, 6).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionHeader title="Episodios recientes" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentEpisodes.slice(0, 6).map((episode) => (
              <button
                key={episode.id}
                onClick={() => handlePlayEpisode(episode, recentEpisodes.filter((e) => e.url))}
                className="flex items-center gap-3 bg-accent/40 hover:bg-accent rounded-md overflow-hidden transition-colors group"
              >
                <div className="w-12 h-12 flex-shrink-0 relative">
                  {episode.image || episode.podcast?.image ? (
                    <img src={episode.image || episode.podcast?.image} alt={episode.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <PodcastIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-4 h-4 fill-current text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2 pr-3">
                  <p className="text-sm font-medium truncate">{episode.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{episode.podcast?.title}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Playlists destacadas */}
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
                subtitle={playlist.description || `${playlist.episodeCount || 0} episodios`}
                image={playlist.image}
                type="playlist"
                onClick={() => navigate('playlist-detail', { id: playlist.id })}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Podcasts */}
      {recentPodcasts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
