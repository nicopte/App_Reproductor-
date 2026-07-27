export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  songCount?: number;
  albumCount?: number;
}

export interface Album {
  id: string;
  title: string;
  image?: string;
  year?: number;
  artistId: string;
  artist?: Artist;
  songCount?: number;
}

export interface Song {
  id: string;
  title: string;
  duration: number;
  url?: string;
  image?: string;
  artistId: string;
  albumId?: string;
  genre?: string;
  artist?: Artist;
  album?: Album;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  image?: string;
  isPublic: boolean;
  userId: string;
  user?: { id: string; name: string; avatar?: string };
  songCount?: number;
  songs?: (PlaylistSong & { song: Song })[];
}

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  position: number;
  addedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  songId: string;
  song?: Song;
  createdAt: string;
}

export interface Reproduction {
  id: string;
  userId: string;
  songId?: string;
  episodeId?: string;
  progress: number;
  completed: boolean;
  createdAt: string;
  song?: Song;
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

export type ViewType = 'home' | 'search' | 'library' | 'podcasts' | 'podcast-detail' | 'artist-detail' | 'album-detail' | 'playlist-detail' | 'create-playlist' | 'create-podcast' | 'favorites' | 'profile' | 'login' | 'register';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
}
