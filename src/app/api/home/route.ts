import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [featuredPlaylists, recentPodcasts, recentEpisodes] = await Promise.all([
      // Featured playlists (public playlists, limited to 6)
      db.playlist.findMany({
        where: { isPublic: true },
        take: 6,
        include: {
          _count: { select: { episodes: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),

      // Recent podcasts (latest 8)
      db.podcast.findMany({
        take: 8,
        include: {
          _count: { select: { episodes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Recent episodes (latest 10)
      db.episode.findMany({
        take: 10,
        include: {
          podcast: { select: { id: true, title: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      featuredPlaylists,
      recentPodcasts,
      recentEpisodes,
    });
  } catch (error) {
    console.error('Get home data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
