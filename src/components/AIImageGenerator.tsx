import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { saveAs } from 'file-saver';
import { PREDEFINED_PROMPTS } from '../data/prompts';

interface GenerateImageResponse {
  success: boolean;
  imageUrl: string;
  originalUrl: string;
  message?: string;
}

interface AIImageGeneratorProps {
  onImageGenerated: (url: string) => void;
}

export default function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const { publicKey } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
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

  const handleDownload = async () => {
    try {
      // Try Vercel Blob URL first
      const urlToDownload = downloadUrl || originalUrl;
      if (!urlToDownload) {
        throw new Error('No image URL available');
      }

      const response = await fetch(urlToDownload);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      const timestamp = new Date().getTime();
      saveAs(blob, `soba-${timestamp}.png`);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
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
    setDownloadUrl(null);
    setOriginalUrl(null);
    setImageLoaded(false);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          wallet: publicKey.toString(),
        }),
      });

      const data = await response.json() as GenerateImageResponse;

      if (!data.success || !data.imageUrl) {
        throw new Error(data.message || 'Failed to generate image');
      }

      // Store both URLs, with null checks
      setDownloadUrl(data.imageUrl || null);
      setOriginalUrl(data.originalUrl || data.imageUrl || null);
      onImageGenerated(data.imageUrl);
      setRetryCount(0);
      
      // Refresh remaining generations
      await checkGenerationLimit();

    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        await generateImage();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * PREDEFINED_PROMPTS.length);
    setPrompt(PREDEFINED_PROMPTS[randomIndex]);
    // Smooth scroll to the textarea
    document.querySelector('textarea')?.scrollIntoView({ behavior: 'smooth' });
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

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleSurpriseMe}
            className="btn-secondary flex items-center gap-2"
            disabled={generating}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
            Surprise Me
          </button>
        </div>

        <div className="relative">
          <textarea
            className="input-primary min-h-[120px] resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your NFT... Be creative!"
            maxLength={500}
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

        {(downloadUrl || originalUrl) && (
          <div className="space-y-4">
            <div className="relative">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
                  <div className="loading-spinner" />
                </div>
              )}
              <img 
                src={downloadUrl || originalUrl || ''} 
                alt="Generated artwork" 
                className={`w-full rounded-lg shadow-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  // If Vercel Blob URL fails, try the original URL
                  if (originalUrl && e.currentTarget.src !== originalUrl) {
                    e.currentTarget.src = originalUrl;
                  } else {
                    setError('Failed to load image');
                  }
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 btn-primary"
                disabled={!imageLoaded}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </span>
              </button>
              
              <a 
                href={downloadUrl || originalUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-secondary"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Full Size
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 