import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageUrl, wallet, frameType } = req.body;

    if (!imageUrl || !wallet || !frameType) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        details: {
          imageUrl: !imageUrl,
          wallet: !wallet,
          frameType: !frameType
        }
      });
    }

    // Validate wallet address
    try {
      new PublicKey(wallet);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid wallet address' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize Solana connection
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' 
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com'
    );

    // Add metadata URI generation
    const metadataUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/metadata/${wallet}/${Date.now()}`;
    
    const metadata = {
      name: "SOBA Chimp",
      symbol: "SOBA",
      description: "Unique SOBA Chimp NFT with custom frame",
      image: imageUrl,
      uri: metadataUri,
      external_url: "https://sobaverse.art",
      attributes: [
        {
          trait_type: "Frame",
          value: frameType || "Basic Frame"
        }
      ],
      properties: {
        files: [{ uri: imageUrl, type: "image/png" }],
        category: "image",
        creators: [
          {
            address: wallet,
            share: 100
          }
        ],
        collection: {
          name: "SOBA Chimps",
          family: "SOBA"
        }
      },
      seller_fee_basis_points: 500,
    };

    return res.status(200).json({ metadata });
  } catch (error) {
    console.error('Error preparing NFT mint:', error);
    return res.status(500).json({ 
      message: 'Error preparing NFT mint',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 