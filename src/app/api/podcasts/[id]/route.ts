import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const podcast = await db.podcast.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        episodes: {
          orderBy: { createdAt: 'desc' },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Get podcast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { title, description, image } = body;

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

    const updated = await db.podcast.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update podcast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    const [podcast, user] = await Promise.all([
      db.podcast.findUnique({ where: { id }, include: { episodes: true } }),
      db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } }),
    ]);
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }
    if (podcast.userId !== userId && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Best-effort cleanup of audio files in Blob storage; DB deletion
    // (cascades to episodes) proceeds even if a blob delete fails.
    await Promise.allSettled(
      podcast.episodes
        .filter((e) => e.url)
        .map((e) => del(e.url as string).catch(() => null))
    );

    await db.podcast.delete({ where: { id } });

    return NextResponse.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    console.error('Delete podcast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
