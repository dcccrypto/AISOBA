import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, File, Files } from 'formidable';
import { uploadToBlob } from '../../utils/storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const form = new IncomingForm();

  try {
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const imageId = Array.isArray(fields.imageId) ? fields.imageId[0] : fields.imageId;
    if (!imageId) {
      return res.status(400).json({ success: false, error: 'No image ID provided' });
    }

    // Upload to blob storage
    const imageUrl = await uploadToBlob(imageFile.filepath, imageId);

    return res.status(200).json({
      success: true,
      imageUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
} 