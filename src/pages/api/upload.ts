import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { uploadToStorage } from '../../utils/storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable();
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    if (!files.image) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    const imageId = Array.isArray(fields.imageId) ? fields.imageId[0] : fields.imageId;

    // Upload to your storage service
    const imageUrl = await uploadToStorage(imageFile, imageId);

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: 'Error uploading image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 