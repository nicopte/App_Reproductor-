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
    const { songId } = body;

    if (!songId) {
      return NextResponse.json(
        { error: 'songId is required' },
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

    // Get the max position for the new song
    const maxPosition = await db.playlistSong.findFirst({
      where: { playlistId: id },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const newPosition = (maxPosition?.position ?? 0) + 1;

    const playlistSong = await db.playlistSong.create({
      data: {
        playlistId: id,
        songId,
        position: newPosition,
      },
      include: {
        song: {
          include: {
            artist: {
              select: { id: true, name: true, image: true },
            },
            album: {
              select: { id: true, title: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(playlistSong, { status: 201 });
  } catch (error) {
    console.error('Add song to playlist error:', error);
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
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json(
        { error: 'songId query parameter is required' },
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

    await db.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId: id,
          songId,
        },
      },
    });

    return NextResponse.json({ message: 'Song removed from playlist' });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
