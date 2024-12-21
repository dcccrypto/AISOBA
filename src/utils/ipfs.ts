import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export async function uploadToIPFS(imageUrl: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const imageBlob = await response.blob();
    if (imageBlob.size === 0) {
      throw new Error('Empty image blob');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = nanoid();
    const fileName = `soba-${timestamp}-${uniqueId}.png`;

    // Upload to Vercel Blob Storage
    const { url } = await put(fileName, imageBlob, {
      access: 'public',
      addRandomSuffix: false // We already have unique names
    });

    if (!url) {
      throw new Error('Failed to get URL from Vercel Blob Storage');
    }

    return url;

  } catch (error) {
    console.error('Detailed Upload Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      service: 'vercel-blob'
    });
    throw new Error('Failed to store image');
  }
}

/**
 * No need for URL conversion since Vercel Blob already provides HTTP URLs
 */
export function ipfsToHttp(url: string): string {
  return url;
} 