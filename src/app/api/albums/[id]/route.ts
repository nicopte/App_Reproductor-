import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const album = await db.album.findUnique({
      where: { id },
      include: {
        artist: {
          select: { id: true, name: true, image: true, bio: true },
        },
        songs: {
          orderBy: { createdAt: 'asc' },
          include: {
            artist: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error('Get album error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
