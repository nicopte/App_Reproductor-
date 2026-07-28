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
    const { episodeId } = body;

    if (!episodeId) {
      return NextResponse.json(
        { error: 'episodeId is required' },
        { status: 400 }
      );
    }

    const existing = await db.favorite.findUnique({
      where: {
        userId_episodeId: {
          userId,
          episodeId,
        },
      },
    });

    if (existing) {
      await db.favorite.delete({
        where: {
          userId_episodeId: {
            userId,
            episodeId,
          },
        },
      });

      return NextResponse.json({ favorited: false, message: 'Removed from favorites' });
    }

    const favorite = await db.favorite.create({
      data: { userId, episodeId },
      include: {
        episode: {
          include: {
            podcast: {
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
