import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from '../components/Layout';
import { Tab } from '@headlessui/react';
import NFTCard from '../components/NFTCard';
import { toast } from 'react-hot-toast';

interface NFT {
  id: string;
  imageUrl: string;
  mintAddress: string;
  title: string;
  createdAt: string;
}

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
}

export default function Profile() {
  const { publicKey } = useWallet();
  const [selectedTab, setSelectedTab] = useState(0);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchUserContent();
    }
  }, [publicKey, selectedTab]);

  const fetchUserContent = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const type = selectedTab === 0 ? 'nfts' : 'images';
      const response = await fetch(`/api/user-content?wallet=${publicKey.toString()}&type=${type}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch content');
      }

      if (type === 'nfts') {
        setNfts(data.nfts);
      } else {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching user content:', error);
      toast.error('Failed to load your content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="responsive-container py-12">
        {!publicKey ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
            <p className="text-gray-400">Connect your wallet to view your profile</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-[#ff6b00]/10 flex items-center justify-center">
                <span className="text-2xl text-[#ff6b00]">
                  {publicKey.toString().slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{publicKey.toString().slice(0, 8)}...</h1>
                <p className="text-gray-400">Member since {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <Tab.Group onChange={setSelectedTab}>
              <Tab.List className="flex space-x-4 border-b border-[#ff6b00]/10">
                <Tab className={({ selected }) =>
                  `px-4 py-2 font-medium focus:outline-none ${
                    selected 
                      ? 'text-[#ff6b00] border-b-2 border-[#ff6b00]' 
                      : 'text-gray-400 hover:text-[#ff6b00]'
                  }`
                }>
                  My NFTs
                </Tab>
                <Tab className={({ selected }) =>
                  `px-4 py-2 font-medium focus:outline-none ${
                    selected 
                      ? 'text-[#ff6b00] border-b-2 border-[#ff6b00]' 
                      : 'text-gray-400 hover:text-[#ff6b00]'
                  }`
                }>
                  Generated Images
                </Tab>
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel>
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <div className="loading-spinner" />
                    </div>
                  ) : nfts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {nfts.map((nft) => (
                        <NFTCard
                          key={nft.id}
                          imageUrl={nft.imageUrl}
                          title={nft.title}
                          creator={publicKey.toString()}
                          mintAddress={nft.mintAddress}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-400">No NFTs found</p>
                    </div>
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <div className="loading-spinner" />
                    </div>
                  ) : images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {images.map((image) => (
                        <div key={image.id} className="bg-[#2a2a2a] rounded-lg overflow-hidden">
                          <div className="aspect-square relative">
                            <img
                              src={image.imageUrl}
                              alt={image.prompt}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-gray-400">{image.prompt}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(image.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-400">No generated images found</p>
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </div>
    </Layout>
  );
} 