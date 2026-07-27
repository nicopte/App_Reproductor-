import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { uploadImage, deleteImage, type CloudinaryFolder } from '@/lib/cloudinary';

const ALLOWED_FOLDERS: CloudinaryFolder[] = ['songs', 'albums', 'artists', 'podcasts', 'playlists', 'users'];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured on the server (missing env vars)' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    if (typeof folder !== 'string' || !ALLOWED_FOLDERS.includes(folder as CloudinaryFolder)) {
      return NextResponse.json(
        { error: `folder must be one of: ${ALLOWED_FOLDERS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WEBP or GIF images are allowed' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File is too large (max 8MB)' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadImage(buffer, folder as CloudinaryFolder);

    return NextResponse.json({ url, publicId }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { publicId } = body;

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }

    // Only allow deleting images inside our app's Cloudinary folder to
    // prevent this endpoint being used to delete arbitrary assets.
    if (!publicId.startsWith('mp3db/')) {
      return NextResponse.json({ error: 'Invalid publicId' }, { status: 400 });
    }

    await deleteImage(publicId);

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
