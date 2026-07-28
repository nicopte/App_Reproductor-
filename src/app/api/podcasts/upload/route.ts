import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getSessionUserId } from '@/lib/auth';

const MAX_EPISODE_AUDIO_BYTES = 45 * 1024 * 1024; // 45MB hard cap (target: ~40MB episodes)

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Only allow uploads into the podcasts/audio/ prefix, formatos de audio soportados.
        if (!pathname.startsWith(`podcasts/${userId}/`)) {
          throw new Error('Invalid upload path');
        }
        return {
          allowedContentTypes: [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/wave',
            'audio/m4a',
            'audio/x-m4a',
            'audio/mp4',
          ],
          maximumSizeInBytes: MAX_EPISODE_AUDIO_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No server-side bookkeeping needed here — the client saves the
        // resulting blob URL to the Episode record via POST /api/podcasts/[id]/episodes.
        // (This callback only fires when Vercel can reach a public webhook URL,
        // i.e. in production — it's a no-op safety hook, not the primary flow.)
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob upload token error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
