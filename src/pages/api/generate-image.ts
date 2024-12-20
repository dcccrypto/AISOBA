import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Replicate from 'replicate';
import { Prediction } from 'replicate';
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
    maxDuration: 300 // Set maximum duration to 5 minutes
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

    // Increase the timeout for the Replicate API call
    const TIMEOUT_MS = 300000; // 5 minutes
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS);
    });

    // Add response headers to prevent timeouts
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=300');

    try {
      // Enhanced prompt with more descriptive elements and style cues
      const enhancedPrompt = `soba, highly detailed, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, ${prompt.trim()}, trending on artstation, masterpiece, best quality, ultra realistic, photorealistic, award winning, breathtaking`;

      // Add negative prompt to avoid common issues
      const negativePrompt = "lowres, text, watermark, logo, signature, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, bad hands, bad feet, bad anatomy";

      // Add status update before starting the prediction
      console.log('Starting image generation...');
      
      // Create prediction using Replicate API with proper typing
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
        }) as Promise<Prediction>,
        timeoutPromise
      ]) as Prediction;

      console.log('Prediction started, waiting for completion...');

      // Add more detailed error handling
      if (!prediction || !prediction.id) {
        throw new Error('Failed to start prediction');
      }

      // Wait for the prediction with timeout and proper typing
      let finalPrediction = await Promise.race([
        replicate.wait(prediction),
        timeoutPromise
      ]) as ReplicatePrediction;

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
      console.error('Detailed API Error:', {
        error: apiError,
        stack: apiError.stack,
        message: apiError.message
      });
      
      // More specific error message
      let errorMessage = 'Image generation timed out. Please try again.';
      
      if (apiError.message?.includes('timed out')) {
        errorMessage = 'The image generation is taking longer than expected. Please try again.';
      }

      return res.status(504).json({
        success: false,
        message: errorMessage,
        retryable: true
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