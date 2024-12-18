import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mintAddress, imageUrl, wallet } = req.body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Record NFT
    const nftRecord = await prisma.nFT.create({
      data: {
        mintAddress,
        imageUrl,
        userId: user.id,
      },
    });

    res.status(200).json({ success: true, nftRecord });
  } catch (error) {
    console.error('Error recording NFT:', error);
    res.status(500).json({ message: 'Error recording NFT' });
  }
} 