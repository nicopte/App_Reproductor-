import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim() === '') {
      return NextResponse.json(
        { error: 'Search query parameter "q" is required' },
        { status: 400 }
      );
    }

    const query = q.trim();

    const [podcasts, episodes] = await Promise.all([
      db.podcast.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: 20,
        include: {
          _count: { select: { episodes: true } },
        },
      }),
      db.episode.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: 20,
        include: {
          podcast: { select: { id: true, title: true, image: true } },
        },
      }),
    ]);

    return NextResponse.json({
      podcasts,
      episodes,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
