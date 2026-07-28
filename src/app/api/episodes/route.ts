import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const episodes = await db.episode.findMany({
      include: {
        podcast: { select: { id: true, title: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(episodes);
  } catch (error) {
    console.error('List episodes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
