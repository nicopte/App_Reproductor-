import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [recentPodcasts, recentEpisodes, ratingGroups] = await Promise.all([
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

      // Rating averages per podcast, para armar "Mejor valorados"
      db.podcastRating.groupBy({
        by: ['podcastId'],
        _avg: { value: true },
        _count: { value: true },
      }),
    ]);

    // Solo consideramos podcasts con al menos 1 calificación, ordenados de mayor a menor promedio
    const topRatedIds = ratingGroups
      .filter((g) => g._count.value > 0)
      .sort((a, b) => (b._avg.value || 0) - (a._avg.value || 0))
      .slice(0, 8)
      .map((g) => g.podcastId);

    const topRatedPodcastsRaw = topRatedIds.length
      ? await db.podcast.findMany({
          where: { id: { in: topRatedIds } },
          include: { _count: { select: { episodes: true } } },
        })
      : [];

    const ratingById = new Map(ratingGroups.map((g) => [g.podcastId, g._avg.value || 0]));
    const topRatedPodcasts = topRatedIds
      .map((id) => {
        const p = topRatedPodcastsRaw.find((x) => x.id === id);
        return p ? { ...p, episodeCount: p._count.episodes, averageRating: ratingById.get(id) || 0 } : null;
      })
      .filter(Boolean);

    return NextResponse.json({
      recentPodcasts: recentPodcasts.map((p) => ({ ...p, episodeCount: p._count.episodes })),
      recentEpisodes,
      topRatedPodcasts,
    });
  } catch (error) {
    console.error('Get home data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
