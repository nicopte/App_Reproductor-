export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  image?: string;
  isPublic: boolean;
  userId: string;
  user?: { id: string; name: string; avatar?: string };
  episodeCount?: number;
  episodes?: (PlaylistEpisode & { episode: Episode })[];
}

export interface PlaylistEpisode {
  id: string;
  playlistId: string;
  episodeId: string;
  position: number;
  addedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  episodeId: string;
  episode?: Episode;
  createdAt: string;
}

export interface Reproduction {
  id: string;
  userId: string;
  episodeId: string;
  progress: number;
  completed: boolean;
  createdAt: string;
  episode?: Episode;
}

export interface Podcast {
  id: string;
  title: string;
  description?: string;
  image?: string;
  userId: string;
  user?: { id: string; name: string; avatar?: string };
  episodeCount?: number;
}

export interface Episode {
  id: string;
  title: string;
  description?: string;
  duration: number;
  url?: string;
  image?: string;
  podcastId: string;
  podcast?: Podcast;
}

export interface Category {
  id: string;
  name: string;
}

export type ViewType = 'home' | 'search' | 'library' | 'podcasts' | 'podcast-detail' | 'playlist-detail' | 'create-playlist' | 'create-podcast' | 'favorites' | 'profile' | 'login' | 'register';

// El reproductor toma episodios de podcast. Se mantiene el nombre
// "currentSong"/"playSong" internamente para no tocar decenas de archivos,
// pero lo que reproduce siempre es un Episode.
export interface PlayerState {
  currentSong: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
}
