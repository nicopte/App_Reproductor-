import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: podcastId } = await params;

    const comments = await db.podcastComment.findMany({
      where: { podcastId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('List comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id: podcastId } = await params;
    const body = await request.json();
    const content = (body.content || '').trim();

    if (!content) {
      return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: 'El comentario es demasiado largo (máx. 1000 caracteres)' }, { status: 400 });
    }

    const podcast = await db.podcast.findUnique({ where: { id: podcastId } });
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast no encontrado' }, { status: 404 });
    }

    const comment = await db.podcastComment.create({
      data: { userId, podcastId, content },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
