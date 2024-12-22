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

    // Prepare NFT metadata
    const metadata = {
      name: "SOBA Chimp",
      symbol: "SOBA",
      description: "Unique SOBA Chimp NFT with custom frame",
      image: imageUrl,
      uri: imageUrl,
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
    res.status(500).json({ message: 'Error preparing NFT mint' });
  }
} 