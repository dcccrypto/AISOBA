import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export default function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const { publicKey } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const checkGenerationLimit = async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch('/api/check-generation-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }
      
      setRemainingGenerations(result.data.remainingGenerations);
      return result.data;
    } catch (error) {
      console.error('Error checking generation limit:', error);
      setError('Error checking generation limit');
    }
  };

  useEffect(() => {
    if (publicKey) {
      checkGenerationLimit();
    }
  }, [publicKey]);

  const generateImage = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    const limitCheck = await checkGenerationLimit();
    if (!limitCheck?.canGenerate) {
      setError('Daily generation limit reached. Please try again tomorrow.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          wallet: publicKey.toString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }
      
      const data = await response.json();
      if (data.imageUrl) {
        onImageGenerated(data.imageUrl);
        await checkGenerationLimit(); // Update remaining generations
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'Error generating image');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl mb-4">Generate AI Image</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Remaining generations today: {remainingGenerations}/5
        </p>
      </div>
      <textarea
        className="w-full p-2 border rounded"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your NFT..."
      />
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        onClick={generateImage}
        disabled={generating || remainingGenerations === 0}
      >
        {generating ? 'Generating...' : 'Generate Image'}
      </button>
    </div>
  );
} 