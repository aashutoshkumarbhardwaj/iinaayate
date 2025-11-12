import { v2 as cloudinary } from 'cloudinary';

const hasUrl = !!process.env.CLOUDINARY_URL;
const hasKeys = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const cloudinaryConfigured = hasUrl || hasKeys;

if (cloudinaryConfigured) {
  // Build options only with defined values to satisfy TS (exactOptionalPropertyTypes)
  const opts: Record<string, string | boolean> = { secure: true };
  if (process.env.CLOUDINARY_CLOUD_NAME) opts.cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  if (process.env.CLOUDINARY_API_KEY) opts.api_key = process.env.CLOUDINARY_API_KEY;
  if (process.env.CLOUDINARY_API_SECRET) opts.api_secret = process.env.CLOUDINARY_API_SECRET;
  cloudinary.config(opts as any);
}

export { cloudinary, cloudinaryConfigured };
