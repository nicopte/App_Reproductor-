import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const song = await db.song.findUnique({
      where: { id },
      include: {
        artist: {
          select: { id: true, name: true, image: true, bio: true },
        },
        album: {
          select: {
            id: true,
            title: true,
            image: true,
            year: true,
          },
          include: {
            artist: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error('Get song error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
