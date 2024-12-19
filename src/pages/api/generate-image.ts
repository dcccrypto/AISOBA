import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Replicate from 'replicate';
import { ReplicatePrediction, ReplicateError } from '../../types/replicate';

const prisma = new PrismaClient();
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
    externalResolver: true,
  },
};

// Type guard for ReplicatePrediction
function isReplicatePrediction(obj: any): obj is ReplicatePrediction {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'status' in obj &&
    typeof obj.status === 'string' &&
    ['starting', 'processing', 'succeeded', 'failed', 'canceled'].includes(obj.status)
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, wallet } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!wallet) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    try {
      const enhancedPrompt = `SOBART ${prompt.trim()}`;

      const prediction = await Promise.race([
        replicate.predictions.create({
          version: "05baef8ab97622bdac86cdd49b2fb52bfd3c7b5ae798a17b71b9725a5793ab88",
          input: {
            prompt: enhancedPrompt,
            model: "schnell",
            go_fast: true,
            lora_scale: 1.5,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            guidance_scale: 3,
            output_quality: 100,
            disable_safety_checker: true,
            prompt_strength: 0.8,
            extra_lora_scale: 1,
            num_inference_steps: 20
          }
        }) as Promise<ReplicatePrediction>,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Initial request timeout')), 10000)
        )
      ]);

      if (!isReplicatePrediction(prediction)) {
        throw new Error('Invalid prediction response');
      }

      let imageUrl: string | null = null;
      let attempts = 0;
      const maxAttempts = 60;
      const pollInterval = 2000;

      while (!imageUrl && attempts < maxAttempts) {
        try {
          const result = await Promise.race([
            replicate.predictions.get(prediction.id) as Promise<ReplicatePrediction>,
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Poll request timeout')), 5000)
            )
          ]);

          if (!isReplicatePrediction(result)) {
            throw new Error('Invalid polling response');
          }

          if (result.status === 'succeeded' && Array.isArray(result.output) && result.output.length > 0) {
            imageUrl = result.output[0];
            break;
          } else if (result.status === 'failed') {
            throw new Error(result.error || 'Image generation failed');
          } else if (result.status === 'canceled') {
            throw new Error('Image generation was canceled');
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }

      if (!imageUrl) {
        throw new Error('Image generation timed out after 60 seconds');
      }

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
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error';
      return res.status(500).json({ 
        message: 'Failed to generate image. Please try again.',
        error: errorMessage
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ 
      message: 'Server error. Please try again later.',
      error: errorMessage
    });
  } finally {
    await prisma.$disconnect();
  }
} 