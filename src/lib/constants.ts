export const APP_NAME = 'MP3DB';
export const APP_DESCRIPTION = 'Tu plataforma de música y podcasts';

export const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: 'Home' },
  { id: 'search', label: 'Buscar', icon: 'Search' },
  { id: 'library', label: 'Biblioteca', icon: 'Library' },
] as const;

export const LIBRARY_ITEMS = [
  { id: 'playlists', label: 'Playlists', icon: 'ListMusic' },
  { id: 'favorites', label: 'Favoritos', icon: 'Heart' },
  { id: 'albums', label: 'Álbumes', icon: 'Disc' },
  { id: 'artists', label: 'Artistas', icon: 'Users' },
  { id: 'podcasts', label: 'Podcasts', icon: 'Podcast' },
  { id: 'history', label: 'Historial', icon: 'Clock' },
] as const;

export const GENRES = [
  { name: 'Pop', color: '#f43f5e' },
  { name: 'Rock', color: '#f97316' },
  { name: 'Electronic', color: '#a855f7' },
  { name: 'Jazz', color: '#eab308' },
  { name: 'Hip Hop', color: '#ef4444' },
  { name: 'Classical', color: '#14b8a6' },
  { name: 'R&B', color: '#ec4899' },
  { name: 'Reggae', color: '#22c55e' },
  { name: 'Indie', color: '#6366f1' },
  { name: 'Latin', color: '#f59e0b' },
] as const;

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const SAMPLE_AUDIO_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
];
