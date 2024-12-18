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

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    try {
      // Generate image using Replicate API
      const prediction = await replicate.predictions.create({
        version: "e0e293b97de2af9d7ad1851c13b14e01036fa7040b6dd39eec05d18f76dcc997",
        input: {
          prompt: prompt,
          model: "dev",
          go_fast: false,
          lora_scale: 1,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          guidance_scale: 3,
          output_quality: 80,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 28
        }
      });

      // Wait for the prediction to complete
      let imageUrl = null;
      while (!imageUrl) {
        const result = await replicate.predictions.get(prediction.id);
        if (result.status === 'succeeded') {
          imageUrl = result.output[0];
          break;
        } else if (result.status === 'failed') {
          throw new Error('Image generation failed');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Store generation record
      await prisma.imageGeneration.create({
        data: {
          userId: user.id,
          imageUrl: imageUrl,
          prompt: prompt,
        },
      });

      return res.status(200).json({ imageUrl });
    } catch (apiError) {
      console.error('Replicate API Error:', apiError);
      return res.status(500).json({ 
        message: 'Error generating image',
        error: apiError instanceof Error ? apiError.message : 'API Error'
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
} 