import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { songId } = body;

    if (!songId) {
      return NextResponse.json(
        { error: 'songId is required' },
        { status: 400 }
      );
    }

    const existing = await db.favorite.findUnique({
      where: {
        userId_songId: {
          userId,
          songId,
        },
      },
    });

    if (existing) {
      await db.favorite.delete({
        where: {
          userId_songId: {
            userId,
            songId,
          },
        },
      });

      return NextResponse.json({ favorited: false, message: 'Removed from favorites' });
    }

    const favorite = await db.favorite.create({
      data: { userId, songId },
      include: {
        song: {
          include: {
            artist: {
              select: { id: true, name: true, image: true },
            },
            album: {
              select: { id: true, title: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ favorited: true, data: favorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
