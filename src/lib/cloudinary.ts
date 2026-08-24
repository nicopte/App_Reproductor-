import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Folders correspond to the entity types listed in the spec: podcasts, users. */
export type CloudinaryFolder = 'podcasts' | 'users';

const APP_ROOT_FOLDER = 'mp3db';

export async function uploadImage(fileBuffer: Buffer, folder: CloudinaryFolder): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${APP_ROOT_FOLDER}/${folder}`,
        resource_type: 'image',
        // Automatic format + quality optimization, and a sane max size so
        // oversized uploads don't bloat storage/bandwidth.
        transformation: [{ width: 1600, height: 1600, crop: 'limit' }, { fetch_format: 'auto', quality: 'auto' }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export { cloudinary };
