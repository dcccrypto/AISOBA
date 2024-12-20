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
    bodyParser: {
      sizeLimit: '10mb'
    },
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
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { prompt, wallet } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        message: 'Prompt is required' 
      });
    }

    if (!wallet) {
      return res.status(400).json({ 
        success: false,
        message: 'Wallet address is required' 
      });
    }

    // Test database connection
    await prisma.$connect();

    const user = await prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Add timeout for Replicate API
    const TIMEOUT_MS = 120000; // 2 minutes
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS);
    });

    try {
      // Enhanced prompt with more descriptive elements and style cues
      const enhancedPrompt = `soba, highly detailed, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, ${prompt.trim()}, trending on artstation, masterpiece, best quality, ultra realistic, photorealistic, award winning, breathtaking`;

      // Add negative prompt to avoid common issues
      const negativePrompt = "lowres, text, watermark, logo, signature, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, bad hands, bad feet, bad anatomy";

      // Create prediction using Replicate API
      const prediction = await Promise.race([
        replicate.predictions.create({
          version: "92c16aaef4850f7a1c918e03d9c7d6dd84d87ead418d5dd3afbc3b6e16f61af3",
          input: {
            prompt: enhancedPrompt,
            negative_prompt: negativePrompt,
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
            lora_scale: 0.8
          }
        }),
        timeoutPromise
      ]);

      console.log('Prediction created:', JSON.stringify(prediction, null, 2));

      // Wait for the prediction with timeout
      let finalPrediction = await Promise.race([
        replicate.wait(prediction),
        timeoutPromise
      ]);

      console.log('Final prediction:', JSON.stringify(finalPrediction, null, 2));

      // Add type checking for the prediction response
      if (!isReplicatePrediction(finalPrediction)) {
        throw new Error('Invalid prediction response format');
      }

      if (finalPrediction.status === 'failed') {
        const errorMessage = finalPrediction.error || 'Model prediction failed';
        console.error('Prediction failed:', errorMessage);
        return res.status(400).json({ 
          success: false,
          message: errorMessage
        });
      }

      if (!finalPrediction.output || !Array.isArray(finalPrediction.output)) {
        throw new Error('Model did not return a valid output');
      }

      const imageUrl = finalPrediction.output[0];

      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        throw new Error('Model returned an invalid image URL');
      }

      // Create the database record
      await prisma.imageGeneration.create({
        data: {
          userId: user.id,
          imageUrl,
          prompt,
        },
      });

      return res.status(200).json({ 
        success: true,
        imageUrl 
      });

    } catch (apiError: any) {
      console.error('API Error details:', JSON.stringify(apiError, null, 2));
      
      // Extract error message from Replicate API error object
      let errorMessage = 'Failed to generate image';
      
      if (typeof apiError === 'object') {
        // Try to get the error message from common error object properties
        errorMessage = apiError.detail || 
                      apiError.message || 
                      apiError.error || 
                      'Failed to generate image';
      }

      return res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  } catch (error: any) {
    console.error('Server Error:', error);
    
    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? JSON.stringify(error, null, 2) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
} 