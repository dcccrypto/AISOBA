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

  return (
    <div className="card space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
          Design Your SOBA Chimp
        </h2>
        <div className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#ff6b00]/20 w-full sm:w-auto">
          <p className="text-sm flex items-center justify-center sm:justify-start gap-2">
            <svg className="w-4 h-4 text-[#ff6b00]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
            </svg>
            <span>{remainingGenerations} generations remaining today</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your SOBA chimpanzee's style, accessories, and attitude..."
          className="w-full h-32 bg-[#1a1a1a] rounded-lg p-4 resize-none focus:ring-2 focus:ring-[#ff6b00]/50 focus:outline-none transition-all"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              const randomPrompt = PREDEFINED_PROMPTS[Math.floor(Math.random() * PREDEFINED_PROMPTS.length)];
              setPrompt(randomPrompt);
            }}
            className="btn-secondary group relative overflow-hidden flex-1 sm:flex-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b00]/20 via-[#ff8533]/20 to-[#ff6b00]/20 group-hover:animate-shimmer" />
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b00] via-[#ff8533] to-[#ff6b00] rounded-lg blur opacity-30 group-hover:opacity-40 transition-all duration-300" />
            <span className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <svg 
                className="w-5 h-5 mr-2 group-hover:animate-spin-slow" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9.172 9.172a4 4 0 015.656 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
              Surprise Me!
              <div className="absolute -right-1 -top-1">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b00] opacity-30"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b00]"></span>
                </span>
              </div>
            </span>
          </button>

          <button
            onClick={generateImage}
            disabled={generating || !prompt || !publicKey}
            className="btn-primary flex-1 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b00]/20 to-[#ff6b00]/0 group-hover:animate-shimmer" />
            <span className="relative flex items-center justify-center">
              {generating ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  Generate
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20
                        animate-fadeIn transform-gpu">
          <p className="text-red-500 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {(downloadUrl || originalUrl) && (
        <div className="space-y-4">
          <div className="image-container aspect-square">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/80 z-20">
                <div className="loading-spinner w-8 h-8"></div>
              </div>
            )}
            <img 
              src={downloadUrl || originalUrl || ''} 
              alt="Generated artwork" 
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full
                          group-hover:translate-y-0 transition-transform duration-300 z-20
                          bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex-1 py-2"
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
                  className="btn-secondary flex-1 py-2"
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
          </div>
        </div>
      )}
    </div>
  );
} 