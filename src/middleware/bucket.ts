import { extname } from 'node:path';
import { StorageClient } from '@supabase/storage-js';

const BUCKET_URL = `${process.env.SUPABASE_URL}/storage/v1`;
const KEY = process.env.SUPABASE_SERVICE_KEY;

const storageClient = new StorageClient(BUCKET_URL, {
  apikey: KEY,
  Authorization: KEY,
});

/**
 * Used after multer middleware run
 */
export const uploadToBucket = async (
  file: Express.Multer.File,
  userId: string,
) => {
  /**
   * Id + date + extensions
   * Id will act as directory as it wont change
   */
  const fileName = userId + '/' + Date.now() + extname(file.originalname);

  const { data, error } = await storageClient
    .from(file.fieldname)
    .upload(fileName.toLowerCase(), file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  /**
   * Handled by error middleware
   */
  if (error) throw error;

  return storageClient.from(file.fieldname).getPublicUrl(data.path).data
    .publicUrl;
};

/**
 * Used anywhere
 */
export const sendToBucket = async (
  bucket: string,
  path: string,
  file: ArrayBuffer,
  mime?: string,
) => {
  const { data, error } = await storageClient.from(bucket).upload(path, file, {
    contentType: mime ?? 'image/jpeg',
    upsert: true,
  });

  /**
   * Handled by error middleware
   */
  if (error) throw error;

  return storageClient.from(bucket).getPublicUrl(data.path).data.publicUrl;
};
