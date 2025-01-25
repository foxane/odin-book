import { extname } from 'node:path';
import { StorageClient } from '@supabase/storage-js';

const BUCKET_URL = `${process.env.SUPABASE_URL}/storage/v1`;
const KEY = process.env.SUPABASE_SERVICE_KEY;

const storageClient = new StorageClient(BUCKET_URL, {
  apikey: KEY,
  Authorization: KEY,
});

export const uploadToBucket = async (
  file: Express.Multer.File,
  username: string,
) => {
  /**
   * Field + name + date + extensions
   */
  const fileName =
    file.fieldname +
    '-' +
    username.replaceAll(' ', '_') +
    '-' +
    Date.now() +
    extname(file.originalname);

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
