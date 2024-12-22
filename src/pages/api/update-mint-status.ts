import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageId, mintAddress } = req.body;

    if (!imageId || !mintAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedImage = await prisma.generatedImage.update({
      where: { id: imageId },
      data: { mintAddress },
    });

    return res.status(200).json(updatedImage);
  } catch (error) {
    console.error('Error updating mint status:', error);
    return res.status(500).json({ 
      message: 'Error updating mint status',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 