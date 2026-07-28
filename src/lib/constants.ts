export const APP_NAME = 'MP3DB';
export const APP_DESCRIPTION = 'Tu plataforma de podcasts';

export const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: 'Home' },
  { id: 'search', label: 'Buscar', icon: 'Search' },
  { id: 'library', label: 'Biblioteca', icon: 'Library' },
] as const;

export const LIBRARY_ITEMS = [
  { id: 'playlists', label: 'Playlists', icon: 'ListMusic' },
  { id: 'favorites', label: 'Favoritos', icon: 'Heart' },
  { id: 'podcasts', label: 'Podcasts', icon: 'Podcast' },
  { id: 'history', label: 'Historial', icon: 'Clock' },
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
