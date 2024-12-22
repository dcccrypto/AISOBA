import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import formidable from 'formidable';
import { promises as fs } from 'fs';

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
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Read the file content
    const fileData = await fs.readFile(file.filepath);
    const filename = `${nanoid()}.png`;

    // Upload to Vercel Blob
    const blob = await put(filename, fileData, {
      access: 'public',
    });

    // Clean up temp file
    await fs.unlink(file.filepath);

    return res.status(200).json({
      url: blob.url,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
} 