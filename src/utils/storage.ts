import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';

export async function uploadToBlob(filepath: string, imageId: string): Promise<string> {
  try {
    const buffer = await readFile(filepath);
    const blob = await put(`${imageId}.png`, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });
    
    return blob.url;
  } catch (error) {
    console.error('Error uploading to blob storage:', error);
    throw new Error('Failed to upload image to storage');
  }
} 