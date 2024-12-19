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
      console.log('Starting image generation with prompt:', enhancedPrompt);

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

      console.log('Raw output from Replicate:', JSON.stringify(output, null, 2));

      // Handle different output types
      let imageUrl: string;

      if (!output) {
        console.error('No output received from Replicate');
        throw new Error('No output received from image generation');
      }

      // Direct array response
      if (Array.isArray(output)) {
        console.log('Output is an array:', output);
        if (output.length === 0) {
          throw new Error('Empty array received from image generation');
        }
        imageUrl = output[0];
      } 
      // Prediction object response
      else if (typeof output === 'object' && output !== null) {
        console.log('Output is an object:', output);
        // Case 1: { output: string[] }
        if ('output' in output && Array.isArray(output.output)) {
          if (!output.output || output.output.length === 0) {
            throw new Error('No image URL in model output array');
          }
          imageUrl = output.output[0];
        }
        // Case 2: { url: string }
        else if ('url' in output && typeof output.url === 'string') {
          imageUrl = output.url;
        }
        // Case 3: Single object with string property
        else {
          const firstValue = Object.values(output)[0];
          if (typeof firstValue === 'string' && firstValue.startsWith('http')) {
            imageUrl = firstValue;
          } else {
            console.error('Unexpected object structure:', output);
            throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
          }
        }
      }
      // Direct string response
      else if (typeof output === 'string') {
        console.log('Output is a string URL:', output);
        imageUrl = output;
      }
      // Unknown response type
      else {
        console.error('Invalid output type:', typeof output);
        throw new Error(`Invalid output type: ${typeof output}`);
      }

      // Validate the URL
      if (!imageUrl) {
        throw new Error('No image URL extracted from output');
      }

      if (typeof imageUrl !== 'string') {
        console.error('Invalid imageUrl type:', typeof imageUrl, 'Value:', imageUrl);
        throw new Error(`Invalid image URL type: ${typeof imageUrl}`);
      }

      if (!imageUrl.startsWith('http')) {
        console.error('Invalid URL format:', imageUrl);
        throw new Error(`Invalid image URL format: ${imageUrl}`);
      }

      console.log('Final validated image URL:', imageUrl);

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
      const errorDetails = apiError instanceof Error ? apiError.stack : JSON.stringify(apiError);
      return res.status(500).json({ 
        message: 'Failed to generate image. Please try again.',
        error: errorMessage,
        details: errorDetails
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