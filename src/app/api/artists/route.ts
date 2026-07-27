import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const artists = await db.artist.findMany({
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(artists);
  } catch (error) {
    console.error('Get artists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
