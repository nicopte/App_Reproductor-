import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const artistId = searchParams.get('artistId');
    const albumId = searchParams.get('albumId');

    const where: Record<string, unknown> = {};

    if (genre) {
      where.genre = { contains: genre };
    }
    if (artistId) {
      where.artistId = artistId;
    }
    if (albumId) {
      where.albumId = albumId;
    }

    const songs = await db.song.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        artist: {
          select: { id: true, name: true, image: true },
        },
        album: {
          select: { id: true, title: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error('Get songs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
