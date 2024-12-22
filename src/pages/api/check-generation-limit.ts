import type { NextApiRequest, NextApiResponse } from 'next';
import { startOfDay, endOfDay } from 'date-fns/fp';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { wallet } = req.body;

  if (!wallet) {
    return res.status(400).json({
      success: false,
      message: 'Wallet address is required'
    });
  }

  try {
    // Get or create user
    let user = await prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { wallet },
      });
    }

    const now = new Date();
    
    // Check today's generations
    const todayGenerations = await prisma.imageGeneration.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(now.setHours(0, 0, 0, 0)), // Start of day
          lte: new Date(now.setHours(23, 59, 59, 999)), // End of day
        },
      },
    });

    const remainingGenerations = 5 - todayGenerations;
    const canGenerate = remainingGenerations > 0;

    return res.status(200).json({
      success: true,
      data: {
        canGenerate,
        remainingGenerations,
        userId: user.id,
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({ 
      success: false,
      message: 'Database connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 