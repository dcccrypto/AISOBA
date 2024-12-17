import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { wallet } = req.body;

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
      canGenerate,
      remainingGenerations,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error checking generation limit:', error);
    return res.status(500).json({ message: 'Error checking generation limit' });
  }
} 