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

    const [songs, artists, albums, podcasts] = await Promise.all([
      db.song.findMany({
        where: { title: { contains: query } },
        take: 20,
        include: {
          artist: { select: { id: true, name: true, image: true } },
          album: { select: { id: true, title: true, image: true } },
        },
      }),
      db.artist.findMany({
        where: { name: { contains: query } },
        take: 20,
        include: {
          _count: { select: { songs: true, albums: true } },
        },
      }),
      db.album.findMany({
        where: { title: { contains: query } },
        take: 20,
        include: {
          artist: { select: { id: true, name: true, image: true } },
          _count: { select: { songs: true } },
        },
      }),
      db.podcast.findMany({
        where: { title: { contains: query } },
        take: 20,
        include: {
          _count: { select: { episodes: true } },
        },
      }),
    ]);

    return NextResponse.json({
      songs,
      artists,
      albums,
      podcasts,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
