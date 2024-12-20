import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { saveAs } from 'file-saver';

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export default function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const { publicKey } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const checkGenerationLimit = async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch('/api/check-generation-limit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }
      
      setRemainingGenerations(result.data.remainingGenerations);
      return result.data;
    } catch (error) {
      console.error('Error checking generation limit:', error);
      setError('Error checking generation limit');
      return null;
    }
  };

  useEffect(() => {
    if (publicKey) {
      checkGenerationLimit();
    }
  }, [publicKey]);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, 'ai-generated-image.webp');
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image');
    }
  };

  const generateImage = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          wallet: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 504 && retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          console.log(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
          await generateImage();
          return;
        }

        throw new Error(errorData.message || 'Failed to generate image');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate image');
      }

      setDownloadUrl(data.imageUrl);
      onImageGenerated(data.imageUrl);
      setRetryCount(0);

    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card hover:shadow-orange-500/20">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
            Generate AI Image
          </h2>
          <div className="px-4 py-2 rounded-full bg-[#1a1a1a]/50 border border-[#ff6b00]/20">
            <p className="text-sm">
              Remaining: <span className="text-[#ff6b00] font-bold">{remainingGenerations}/5</span>
            </p>
          </div>
        </div>

        <div className="relative">
          <textarea
            className="input-primary min-h-[120px] resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your NFT... Be creative!"
          />
          <div className="absolute bottom-3 right-3 text-gray-400 text-sm">
            {prompt.length}/500
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <button
          className="btn-primary group relative"
          onClick={generateImage}
          disabled={generating || remainingGenerations === 0}
        >
          <span className="flex items-center justify-center">
            {generating ? (
              <>
                <div className="loading-spinner mr-2" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Generate Image
              </>
            )}
          </span>
        </button>

        {downloadUrl && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleDownload(downloadUrl)}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Image</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 