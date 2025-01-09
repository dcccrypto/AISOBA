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
    console.log('Processing upload request...');
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
        }
        console.log('Form parsed:', { fields, files: Object.keys(files) });
        resolve([fields, files]);
      });
    });

    const imageFile = files.image?.[0];
    if (!imageFile) {
      console.error('No image file in request:', { files });
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const imageId = Array.isArray(fields.imageId) ? fields.imageId[0] : fields.imageId;
    if (!imageId) {
      console.error('No imageId in request:', { fields });
      return res.status(400).json({ success: false, error: 'No image ID provided' });
    }

    console.log('Uploading to blob storage...', { imageId });
    const imageUrl = await uploadToBlob(imageFile.filepath, imageId);
    console.log('Upload successful:', { imageUrl });

    return res.status(200).json({
      success: true,
      imageUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    });
  }
} 