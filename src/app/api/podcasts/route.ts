import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET() {
  try {
    const podcasts = await db.podcast.findMany({
      include: {
        _count: {
          select: { episodes: true },
        },
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      podcasts.map((p) => ({ ...p, episodeCount: p._count.episodes }))
    );
  } catch (error) {
    console.error('Get podcasts error:', error);
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
    const { title, description, image } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const podcast = await db.podcast.create({
      data: {
        title,
        description: description ?? null,
        image: image ?? null,
        userId,
      },
    });

    return NextResponse.json(podcast, { status: 201 });
  } catch (error) {
    console.error('Create podcast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
