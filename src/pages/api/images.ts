import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

const ITEMS_PER_PAGE = 12

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || ITEMS_PER_PAGE
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.generatedImage.count()

    // Fetch images with pagination
    const images = await prisma.generatedImage.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        imageUrl: true,
        createdAt: true,
        creator: true,
        frameType: true,
        mintAddress: true,
      }
    })

    // Calculate if there's a next page
    const hasMore = skip + images.length < totalCount
    const nextPage = hasMore ? page + 1 : null

    return res.status(200).json({
      images,
      nextPage,
      totalCount,
    })
  } catch (error) {
    console.error('Error fetching images:', error)
    return res.status(500).json({ 
      message: 'Error fetching images',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
} 