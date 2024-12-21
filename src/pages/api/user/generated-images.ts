import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

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
    const totalItems = await prisma.imageGeneration.count({
      where: { userId: user.id },
    });

    // Get paginated images
    const images = await prisma.imageGeneration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (pageNumber - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    });

    // Check if images are minted
    const imagesWithMintStatus = await Promise.all(
      images.map(async (image) => {
        const nft = await prisma.nFT.findFirst({
          where: {
            userId: user.id,
            imageUrl: image.imageUrl,
          },
        });

        return {
          ...image,
          isMinted: !!nft,
        };
      })
    );

    const hasMore = totalItems > pageNumber * ITEMS_PER_PAGE;

    return res.status(200).json({
      images: imagesWithMintStatus,
      nextPage: hasMore ? pageNumber + 1 : null,
      hasMore,
      total: totalItems,
    });

  } catch (error) {
    console.error('Error fetching generated images:', error);
    return res.status(500).json({ message: 'Error fetching generated images' });
  }
} 