import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const reproductions = await db.reproduction.findMany({
      where: {
        userId,
        songId: { not: null },
      },
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(reproductions);
  } catch (error) {
    console.error('Get reproductions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { songId, episodeId, progress, completed } = body;

    if (!songId && !episodeId) {
      return NextResponse.json(
        { error: 'Either songId or episodeId is required' },
        { status: 400 }
      );
    }

    const reproduction = await db.reproduction.create({
      data: {
        userId,
        songId: songId ?? null,
        episodeId: episodeId ?? null,
        progress: progress ?? 0,
        completed: completed ?? false,
      },
    });

    return NextResponse.json(reproduction, { status: 201 });
  } catch (error) {
    console.error('Log reproduction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
