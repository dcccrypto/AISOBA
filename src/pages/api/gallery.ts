import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

const ITEMS_PER_PAGE = 12;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { page = '1' } = req.query;
    const pageNumber = parseInt(page as string);

    // Get total count of verified NFTs
    const totalItems = await prisma.nFT.count({
      where: { verified: true },
    });

    // Get paginated verified NFTs
    const nfts = await prisma.nFT.findMany({
      where: { verified: true },
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
    console.error('Error fetching gallery:', error);
    return res.status(500).json({ message: 'Error fetching gallery' });
  }
} 