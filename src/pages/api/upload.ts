import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filename = `${nanoid()}.png`;
    const blob = await put(filename, file, {
      access: 'public',
    });

    return res.status(200).json({
      url: blob.url,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
} 