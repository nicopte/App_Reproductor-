import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const artist = await db.artist.findUnique({
      where: { id },
      include: {
        songs: {
          orderBy: { createdAt: 'desc' },
          include: {
            album: {
              select: { id: true, title: true, image: true },
            },
          },
        },
        albums: {
          orderBy: { year: 'desc' },
          include: {
            _count: {
              select: { songs: true },
            },
          },
        },
        _count: {
          select: {
            songs: true,
            albums: true,
            follows: true,
          },
        },
      },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error('Get artist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
