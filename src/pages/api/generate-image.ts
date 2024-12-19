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
      const enhancedPrompt = `soba ape ${prompt.trim()}`;

      const output = await replicate.run(
        "dcccrypto/sdxl-soba:92c16aaef4850f7a1c918e03d9c7d6dd84d87ead418d5dd3afbc3b6e16f61af3",
        {
          input: {
            prompt: enhancedPrompt,
            negative_prompt: "lowres, text, watermark, logo, signature, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck",
            width: 1024,
            height: 1024,
            num_outputs: 1,
            scheduler: "K_EULER",
            num_inference_steps: 50,
            guidance_scale: 7.5,
            prompt_strength: 0.8,
            refine: "expert_ensemble_refiner",
            high_noise_frac: 0.8,
            apply_watermark: false,
            lora_scale: 0.6
          }
        }
      );

      // Handle different output types
      let imageUrl: string;
      if (typeof output === 'string') {
        imageUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      } else if (output && typeof output === 'object' && 'output' in output) {
        // Handle case where output might be a prediction object
        const outputArray = (output as { output: string[] }).output;
        if (!outputArray || outputArray.length === 0) {
          throw new Error('No image URL in model output');
        }
        imageUrl = outputArray[0];
      } else {
        throw new Error('Invalid output format from image generation');
      }

      // Validate the URL
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Invalid image URL generated');
      }

      // Create the database record
      const imageGeneration = await prisma.imageGeneration.create({
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