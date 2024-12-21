import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

const ITEMS_PER_PAGE = 9;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { page = '1', wallet } = req.query;
    const pageNumber = parseInt(page as string);

    if (!wallet) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { wallet: wallet as string },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get total count
    const totalItems = await prisma.nFT.count({
      where: { userId: user.id },
    });

    // Get paginated NFTs
    const nfts = await prisma.nFT.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (pageNumber - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        user: {
          select: {
            wallet: true,
          },
        },
      },
    });

    const formattedNfts = nfts.map((nft) => ({
      id: nft.id,
      imageUrl: nft.imageUrl,
      title: nft.title || 'Untitled',
      mintAddress: nft.mintAddress || '',
      creator: nft.user.wallet,
    }));

    const hasMore = totalItems > pageNumber * ITEMS_PER_PAGE;

    return res.status(200).json({
      nfts: formattedNfts,
      nextPage: hasMore ? pageNumber + 1 : null,
      hasMore,
      total: totalItems,
    });

  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    return res.status(500).json({ message: 'Error fetching user NFTs' });
  }
} 