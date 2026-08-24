import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id, episodeId } = await params;
    const body = await request.json();
    const { title, description, image } = body;

    if (title !== undefined && !String(title).trim()) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    const [podcast, user] = await Promise.all([
      db.podcast.findUnique({ where: { id } }),
      db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } }),
    ]);
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }
    if (podcast.userId !== userId && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const episode = await db.episode.findUnique({ where: { id: episodeId } });
    if (!episode || episode.podcastId !== id) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    const updated = await db.episode.update({
      where: { id: episodeId },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(description !== undefined && { description: description || null }),
        ...(image !== undefined && { image: image || null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update episode error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id, episodeId } = await params;

    const [podcast, user] = await Promise.all([
      db.podcast.findUnique({ where: { id } }),
      db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } }),
    ]);
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }
    if (podcast.userId !== userId && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const episode = await db.episode.findUnique({ where: { id: episodeId } });
    if (!episode || episode.podcastId !== id) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    if (episode.url) {
      await del(episode.url).catch(() => null);
    }

    await db.episode.delete({ where: { id: episodeId } });

    return NextResponse.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    console.error('Delete episode error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
