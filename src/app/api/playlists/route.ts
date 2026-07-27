import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const playlists = await db.playlist.findMany({
      where: { userId },
      include: {
        _count: {
          select: { songs: true },
        },
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
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
    const { title, description, image, isPublic } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const playlist = await db.playlist.create({
      data: {
        title,
        description: description ?? null,
        image: image ?? null,
        isPublic: isPublic ?? true,
        userId,
      },
    });

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error('Create playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
