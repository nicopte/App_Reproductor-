import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      featuredPlaylists,
      recentSongs,
      popularArtists,
      newAlbums,
      recentPodcasts,
    ] = await Promise.all([
      // Featured playlists (public playlists, limited to 6)
      db.playlist.findMany({
        where: { isPublic: true },
        take: 6,
        include: {
          _count: { select: { songs: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),

      // Recent songs (latest 10)
      db.song.findMany({
        take: 10,
        include: {
          artist: { select: { id: true, name: true, image: true } },
          album: { select: { id: true, title: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Popular artists (sorted by song count, limited to 6)
      db.artist.findMany({
        take: 6,
        include: {
          _count: { select: { songs: true, albums: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // New albums (latest 6)
      db.album.findMany({
        take: 6,
        include: {
          artist: { select: { id: true, name: true, image: true } },
          _count: { select: { songs: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Recent podcasts (latest 4)
      db.podcast.findMany({
        take: 4,
        include: {
          _count: { select: { episodes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      featuredPlaylists,
      recentSongs,
      popularArtists,
      newAlbums,
      recentPodcasts,
    });
  } catch (error) {
    console.error('Get home data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
