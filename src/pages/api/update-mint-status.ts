import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

interface UpdateMintStatusResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateMintStatusResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { imageId, mintAddress } = req.body;

    if (!imageId || !mintAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Image ID and mint address are required' 
      });
    }

    // Update the generated image record with mint address
    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { mintAddress }
    });

    return res.status(200).json({
      success: true,
      message: 'Mint status updated successfully'
    });

  } catch (error) {
    console.error('Error updating mint status:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update mint status'
    });
  }
} 