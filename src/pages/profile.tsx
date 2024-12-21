import { useState } from 'react';
import GeneratedImagesGallery from '../components/GeneratedImagesGallery';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import NFTGallery from '../components/NFTGallery';
import Layout from '../components/Layout';

type Tab = 'creations' | 'nfts';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>('creations');

  return (
    <Layout>
      <div className="responsive-container py-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              Your Profile
            </h1>
            <WalletMultiButton />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-800">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('creations')}
                className={`py-4 px-2 relative ${
                  activeTab === 'creations'
                    ? 'text-[#ff6b00]'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Creations
                {activeTab === 'creations' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b00]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('nfts')}
                className={`py-4 px-2 relative ${
                  activeTab === 'nfts'
                    ? 'text-[#ff6b00]'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                NFTs
                {activeTab === 'nfts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b00]" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {activeTab === 'creations' ? (
              <GeneratedImagesGallery />
            ) : (
              <NFTGallery userOnly={true} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 