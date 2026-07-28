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
    const { episodeId } = body;

    if (!episodeId) {
      return NextResponse.json(
        { error: 'episodeId is required' },
        { status: 400 }
      );
    }

    const playlist = await db.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    if (playlist.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the max position for the new episode
    const maxPosition = await db.playlistEpisode.findFirst({
      where: { playlistId: id },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const newPosition = (maxPosition?.position ?? 0) + 1;

    const playlistEpisode = await db.playlistEpisode.create({
      data: {
        playlistId: id,
        episodeId,
        position: newPosition,
      },
      include: {
        episode: {
          include: {
            podcast: {
              select: { id: true, title: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(playlistEpisode, { status: 201 });
  } catch (error) {
    console.error('Add episode to playlist error:', error);
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
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');

    if (!episodeId) {
      return NextResponse.json(
        { error: 'episodeId query parameter is required' },
        { status: 400 }
      );
    }

    const playlist = await db.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    if (playlist.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.playlistEpisode.delete({
      where: {
        playlistId_episodeId: {
          playlistId: id,
          episodeId,
        },
      },
    });

    return NextResponse.json({ message: 'Episode removed from playlist' });
  } catch (error) {
    console.error('Remove episode from playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
