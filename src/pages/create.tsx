import { useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Create() {
  const { connected } = useWallet();
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  const frames = [
    { id: 'basic', name: 'Basic Frame', price: '0 $SOBA', class: 'border-[#ff6b00]' },
    { id: 'modern', name: 'Modern Frame', price: '200,000 $SOBA', class: 'border-blue-500' },
    { id: 'elegant', name: 'Elegant Frame', price: '300,000 $SOBA', class: 'border-purple-500' },
    { id: 'minimal', name: 'Minimal Frame', price: '400,000 $SOBA', class: 'border-green-500' },
  ];

  return (
    <Layout>
      <div className="responsive-container py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              Create Your SOBA PFP
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Select your preferred frame and mint your unique SOBA chimpanzee PFP.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Preview Section */}
            <div className="bg-[#2a2a2a] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Preview</h2>
              <div className="aspect-square rounded-lg overflow-hidden bg-[#1a1a1a] mb-4">
                <img 
                  src="/preview-image.jpg" 
                  alt="SOBA PFP Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-400">
                Your unique SOBA chimpanzee PFP will be generated upon minting.
              </p>
            </div>

            {/* Frame Selection Section */}
            <div className="bg-[#2a2a2a] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Select Frame</h2>
              <div className="grid grid-cols-2 gap-4">
                {frames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFrame === frame.id 
                        ? `${frame.class} bg-[#1a1a1a]` 
                        : 'border-transparent bg-[#1a1a1a]/50 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="text-white font-medium mb-1">{frame.name}</div>
                    <div className="text-sm text-gray-400">{frame.price}</div>
                  </button>
                ))}
              </div>

              {/* Action Section */}
              <div className="mt-8">
                {!connected ? (
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">Connect your wallet to continue</p>
                    <WalletMultiButton className="!bg-[#ff6b00] hover:!bg-[#ff8533] transition-colors" />
                  </div>
                ) : (
                  <button
                    disabled={!selectedFrame}
                    onClick={() => {/* Implement minting logic */}}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      selectedFrame
                        ? 'bg-[#ff6b00] hover:bg-[#ff8533] text-white'
                        : 'bg-gray-600 cursor-not-allowed text-gray-300'
                    }`}
                  >
                    {selectedFrame ? 'Mint SOBA PFP' : 'Select a Frame'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 