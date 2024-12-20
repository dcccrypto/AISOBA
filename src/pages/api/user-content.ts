import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { wallet, type } = req.query;

  if (!wallet) {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { wallet: wallet as string },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (type === 'nfts') {
      const nfts = await prisma.nFT.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ nfts });
    }

    if (type === 'images') {
      const images = await prisma.imageGeneration.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ images });
    }

    return res.status(400).json({ message: 'Invalid content type' });

  } catch (error) {
    console.error('Error fetching user content:', error);
    return res.status(500).json({ message: 'Error fetching user content' });
  }
} 