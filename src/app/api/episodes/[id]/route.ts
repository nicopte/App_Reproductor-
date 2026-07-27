import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const episode = await db.episode.findUnique({
      where: { id },
      include: {
        podcast: {
          select: { id: true, title: true, image: true },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(episode);
  } catch (error) {
    console.error('Get episode error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
