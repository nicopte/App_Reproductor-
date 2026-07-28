import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

// GET: promedio, cantidad de votos, y el rating del usuario actual (si está logueado)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: podcastId } = await params;
    const userId = await getSessionUserId();

    const [aggregate, myRating] = await Promise.all([
      db.podcastRating.aggregate({
        where: { podcastId },
        _avg: { value: true },
        _count: { value: true },
      }),
      userId
        ? db.podcastRating.findUnique({
            where: { userId_podcastId: { userId, podcastId } },
          })
        : null,
    ]);

    return NextResponse.json({
      average: aggregate._avg.value || 0,
      count: aggregate._count.value,
      myRating: myRating?.value || null,
    });
  } catch (error) {
    console.error('Get rating error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: crear o actualizar la calificación del usuario actual (1 a 5)
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
    const value = Number(body.value);

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return NextResponse.json(
        { error: 'value debe ser un número entero entre 1 y 5' },
        { status: 400 }
      );
    }

    const podcast = await db.podcast.findUnique({ where: { id: podcastId } });
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast no encontrado' }, { status: 404 });
    }

    await db.podcastRating.upsert({
      where: { userId_podcastId: { userId, podcastId } },
      update: { value },
      create: { userId, podcastId, value },
    });

    const aggregate = await db.podcastRating.aggregate({
      where: { podcastId },
      _avg: { value: true },
      _count: { value: true },
    });

    return NextResponse.json({
      average: aggregate._avg.value || 0,
      count: aggregate._count.value,
      myRating: value,
    });
  } catch (error) {
    console.error('Rate podcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: quitar la calificación del usuario actual
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { id: podcastId } = await params;

    await db.podcastRating.deleteMany({ where: { userId, podcastId } });

    const aggregate = await db.podcastRating.aggregate({
      where: { podcastId },
      _avg: { value: true },
      _count: { value: true },
    });

    return NextResponse.json({
      average: aggregate._avg.value || 0,
      count: aggregate._count.value,
      myRating: null,
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
