import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TokenCheck from '../components/TokenCheck';
import AIImageGenerator from '../components/AIImageGenerator';
import NFTMinter from '../components/NFTMinter';
import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function Home() {
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      <div className="responsive-container py-12">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
            AI NFT Creator
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Create unique NFTs powered by artificial intelligence
          </p>
        </div>
        
        <div className="flex justify-center mb-12">
          <WalletMultiButtonDynamic className="!px-6 !py-3 !rounded-lg !text-lg" />
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <TokenCheck 
            requiredAmount={10}
            onVerification={setHasEnoughTokens}
          />

          {hasEnoughTokens && (
            <div className="space-y-8 animate-fadeIn">
              <AIImageGenerator
                onImageGenerated={setGeneratedImage}
              />
              
              {generatedImage && (
                <NFTMinter
                  imageUrl={generatedImage}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 