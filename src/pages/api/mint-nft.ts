import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { prisma } from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageUrl, wallet } = req.body;

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

    // Initialize Metaplex
    const metaplex = Metaplex.make(connection);

    // Prepare NFT metadata
    const metadata = {
      name: "AI Generated NFT",
      description: "NFT created using AI",
      image: imageUrl,
      seller_fee_basis_points: 500, // 5% royalty
    };

    // Return the metadata and instructions for frontend to handle
    res.status(200).json({ 
      metadata,
      connection: connection.rpcEndpoint
    });
    
  } catch (error) {
    console.error('Error preparing NFT mint:', error);
    res.status(500).json({ message: 'Error preparing NFT mint' });
  }
} 