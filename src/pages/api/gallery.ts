import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const nfts = await prisma.nFT.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            wallet: true,
          },
        },
      },
    });

    return res.status(200).json({ nfts });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return res.status(500).json({ message: 'Error fetching gallery' });
  }
} 