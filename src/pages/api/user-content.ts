import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { ipfsToHttp } from '../../utils/ipfs';
import type { Prisma } from '@prisma/client';

// Define the type for NFT selection and result
type NFTSelect = {
  id: boolean;
  imageUrl: boolean;
  title: boolean;
  mintAddress: boolean;
  verified: boolean;
  createdAt: boolean;
}

type NFTResult = {
  id: string;
  imageUrl: string;
  title: string | null;
  mintAddress: string | null;
  verified: boolean;
  createdAt: Date;
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

type ImageGenerationResult = {
  id: string;
  imageUrl: string;
  httpUrl: string | null;
  prompt: string;
  createdAt: Date;
  userId: string;
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

      const formattedNFTs = nfts.map((nft: NFTResult) => ({
        id: nft.id,
        imageUrl: nft.imageUrl,
        title: nft.title,
        mintAddress: nft.mintAddress,
        verified: nft.verified,
        createdAt: nft.createdAt,
      }));

      return res.status(200).json({ nfts: formattedNFTs });
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

      const formattedImages = images.map((image: ImageGenerationResult) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        httpUrl: image.httpUrl,
        prompt: image.prompt,
        createdAt: image.createdAt,
        userId: image.userId,
      }));

      return res.status(200).json({ images: formattedImages });
    }

    return res.status(400).json({ message: 'Invalid content type' });

  } catch (error) {
    console.error('Error fetching user content:', error);
    return res.status(500).json({ message: 'Error fetching user content' });
  }
} 