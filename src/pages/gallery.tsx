import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import NFTCard from '../components/NFTCard';
import { toast } from 'react-hot-toast';

interface NFT {
  id: string;
  imageUrl: string;
  mintAddress: string;
  title: string;
  user: {
    wallet: string;
  };
}

export default function Gallery() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch gallery');
      }

      setNfts(data.nfts);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="responsive-container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
            Community Gallery
          </h1>
          <p className="text-gray-400">
            Explore amazing AI-generated NFTs created by the SOBA Verse community
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner" />
          </div>
        ) : nfts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                imageUrl={nft.imageUrl}
                title={nft.title}
                creator={nft.user.wallet}
                mintAddress={nft.mintAddress}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">No NFTs found in the gallery</p>
          </div>
        )}
      </div>
    </Layout>
  );
} 