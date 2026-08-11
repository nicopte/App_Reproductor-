import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id: podcastId, commentId } = await params;

    const comment = await db.podcastComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.podcastId !== podcastId) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
    }

    const podcast = await db.podcast.findUnique({ where: { id: podcastId } });
    const user = await db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
    const canDelete = comment.userId === userId || podcast?.userId === userId || !!user?.isAdmin;

    if (!canDelete) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await db.podcastComment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
