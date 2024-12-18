import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

// Create a single PrismaClient instance
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

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

  // Set CORS headers for the actual request
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
    // Test database connection
    await prisma.$connect();
    
    // Get or create user
    let user = await prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { wallet },
      });
    }

    // Check today's generations
    const todayGenerations = await prisma.imageGeneration.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
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
    return res.status(500).json({ 
      success: false,
      message: 'Database connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting from database:', e);
    }
  }
} 