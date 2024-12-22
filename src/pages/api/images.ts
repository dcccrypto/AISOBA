import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { page = '1', limit = '12' } = req.query;
    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);

    const images = await prisma.imageGeneration.findMany({
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      include: {
        user: {
          select: {
            wallet: true,
          },
        },
      },
    });

    const total = await prisma.imageGeneration.count();

    return res.status(200).json({
      images,
      total,
      hasMore: total > pageNumber * pageSize,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    });
  }
} 