import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TokenCheck from '../components/TokenCheck';
import AIImageGenerator from '../components/AIImageGenerator';
import NFTMinter from '../components/NFTMinter';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function Home() {
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showMinter, setShowMinter] = useState(false);

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
    setShowMinter(true);
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
        {/* Hero Section */}
        <div className="responsive-container py-20 relative">
          {/* Animated background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-[#ff6b00]/3 rounded-full blur-[80px] animate-blob-slow animation-delay-2000" />
            <div className="absolute top-1/2 -right-12 w-[250px] h-[250px] bg-[#ff8533]/3 rounded-full blur-[60px] animate-blob-medium animation-delay-4000" />
            <div className="absolute bottom-20 left-10 w-[350px] h-[350px] bg-[#ff6b00]/3 rounded-full blur-[70px] animate-blob-fast" />
          </div>

          <div className="relative">
            <div className="text-center mb-12">
              <div className="inline-block">
                <span className="inline-block text-sm font-medium text-[#ff6b00] bg-[#ff6b00]/10 px-4 py-1 rounded-full mb-4">
                  Powered by Sol Bastard 🔥
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
                Create Your SOBA Chimpanzee PFP
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                Generate unique SOBA chimpanzee profile pictures using AI. Join the elite 
                bastard community and stand out with your one-of-a-kind SOBA PFP.
              </p>
              <div className="flex justify-center gap-4">
                <a 
                  href="#create"
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Start Creating
                </a>
                <a 
                  href="https://jup.ag/swap/SOL-soba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-8 py-3 text-lg group"
                >
                  Get $SOBA
                  <svg className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Featured Creations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden shadow-2xl">
                  <div className="aspect-square bg-gradient-to-br from-[#ff6b00]/20 to-[#ff8533]/20 relative group">
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">SOBA Chimp #{i}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-[#1a1a1a]/50 py-20 relative">
          <div className="responsive-container relative z-10">
            <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  title: "Connect Wallet",
                  description: "Connect your Solana wallet and verify your $SOBA tokens to access the PFP generator.",
                  icon: "🔗"
                },
                {
                  step: 2,
                  title: "Customize Your Chimp",
                  description: "Describe your perfect SOBA chimpanzee and let our AI bring your vision to life.",
                  icon: "🎨"
                },
                {
                  step: 3,
                  title: "Mint Your PFP",
                  description: "Choose your favorite SOBA frame and mint your unique chimpanzee as an NFT.",
                  icon: "⚡"
                }
              ].map(({ step, title, description, icon }) => (
                <div key={step} className="p-6 rounded-lg bg-[#2a2a2a] border border-[#ff6b00]/10 hover:border-[#ff6b00]/30 transition-colors group">
                  <div className="w-12 h-12 bg-[#ff6b00]/10 group-hover:bg-[#ff6b00]/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <span className="text-2xl">{icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#ff6b00] transition-colors">{title}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div id="create" className="responsive-container py-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative z-10">
              <TokenCheck 
                requiredAmount={10}
                onVerification={setHasEnoughTokens}
              />
            </div>

            {hasEnoughTokens && (
              <div className="space-y-8 animate-fadeIn">
                <AIImageGenerator
                  onImageGenerated={handleImageGenerated}
                />
                
                {showMinter && generatedImage && (
                  <NFTMinter
                    imageUrl={generatedImage}
                    onClose={() => setShowMinter(false)}
                    onSuccess={() => {
                      toast.success('NFT minted successfully!');
                      setShowMinter(false);
                    }}
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