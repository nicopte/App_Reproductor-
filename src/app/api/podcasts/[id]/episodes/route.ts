import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, duration, url, image } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json({ error: 'A valid duration (seconds) is required' }, { status: 400 });
    }
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'An uploaded audio url is required' }, { status: 400 });
    }

    const podcast = await db.podcast.findUnique({ where: { id } });
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }
    if (podcast.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const episode = await db.episode.create({
      data: {
        title,
        description: description ?? null,
        duration,
        url,
        image: image ?? null,
        podcastId: id,
      },
    });

    return NextResponse.json(episode, { status: 201 });
  } catch (error) {
    console.error('Create episode error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
