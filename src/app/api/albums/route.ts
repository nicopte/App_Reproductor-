import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const albums = await db.album.findMany({
      include: {
        artist: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { songs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Get albums error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
