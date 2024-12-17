import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Replicate from 'replicate';

const prisma = new PrismaClient();
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, wallet } = req.body;
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate image using your specific model
    const output = await replicate.run(
      "your-model-id-here", // Replace with your specific model ID
      {
        input: {
          prompt: prompt
        }
      }
    );

    // Store generation record
    await prisma.imageGeneration.create({
      data: {
        userId: user.id,
        imageUrl: output as string,
        prompt: prompt,
      },
    });

    res.status(200).json({ imageUrl: output });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ message: 'Error generating image' });
  }
} 