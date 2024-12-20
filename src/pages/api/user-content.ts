import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';
import { ipfsToHttp } from '../../utils/ipfs';

// Define the type for NFT selection
type NFTSelect = {
  id: boolean;
  imageUrl: boolean;
  title: boolean;
  mintAddress: boolean;
  verified: boolean;
  createdAt: boolean;
}

// Define types for better type safety
type ImageGenerationSelect = {
  id: boolean;
  imageUrl: boolean;
  httpUrl: boolean;
  prompt: boolean;
  createdAt: boolean;
  userId: boolean;
}

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
        select: {
          id: true,
          imageUrl: true,
          title: true,
          mintAddress: true,
          verified: true,
          createdAt: true
        } as NFTSelect
      });
      const processedNfts = nfts.map(nft => ({
        ...nft,
        imageUrl: ipfsToHttp(nft.imageUrl),
      }));
      return res.status(200).json({ nfts: processedNfts });
    }

    if (type === 'images') {
      const images = await prisma.imageGeneration.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          imageUrl: true,
          httpUrl: true,
          prompt: true,
          createdAt: true,
          userId: true
        } as ImageGenerationSelect
      });

      const processedImages = images.map(image => ({
        ...image,
        imageUrl: image.httpUrl || ipfsToHttp(image.imageUrl),
      }));
      return res.status(200).json({ images: processedImages });
    }

    return res.status(400).json({ message: 'Invalid content type' });

  } catch (error) {
    console.error('Error fetching user content:', error);
    return res.status(500).json({ message: 'Error fetching user content' });
  }
} 