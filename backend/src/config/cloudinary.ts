import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Test Cloudinary connection
 * Used to verify credentials on startup
 */
export async function testCloudinaryConnection(): Promise<boolean> {
  try {
    await cloudinary.api.ping();
    return true;
  } catch (error) {
    console.error('Cloudinary connection failed:', error);
    return false;
  }
}

export { cloudinary };