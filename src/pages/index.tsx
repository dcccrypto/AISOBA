import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TokenCheck from '../components/TokenCheck';
import AIImageGenerator from '../components/AIImageGenerator';
import NFTMinter from '../components/NFTMinter';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function Home() {
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  return (
    <Layout>
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
        {/* Hero Section */}
        <div className="responsive-container py-20">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              AI NFT Creator
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Create unique NFTs powered by artificial intelligence
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-[#1a1a1a]/50 py-20">
          <div className="responsive-container">
            <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg bg-[#2a2a2a] border border-[#ff6b00]/10">
                <div className="w-12 h-12 bg-[#ff6b00]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#ff6b00] text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
                <p className="text-gray-400">
                  Connect your Solana wallet to get started with creating your unique AI-generated NFT.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-[#2a2a2a] border border-[#ff6b00]/10">
                <div className="w-12 h-12 bg-[#ff6b00]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#ff6b00] text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Generate Art</h3>
                <p className="text-gray-400">
                  Describe your vision and let our AI create stunning artwork based on your prompt.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-[#2a2a2a] border border-[#ff6b00]/10">
                <div className="w-12 h-12 bg-[#ff6b00]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#ff6b00] text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Mint NFT</h3>
                <p className="text-gray-400">
                  Choose your favorite frame and mint your artwork as an NFT on the Solana blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="responsive-container py-20">
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
    </Layout>
  );
} 