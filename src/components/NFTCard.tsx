import Image from 'next/image';
import { truncateAddress } from '../utils/formatting';

interface NFTCardProps {
  imageUrl: string;
  title?: string;
  creator: string;
  mintAddress?: string;
}

export default function NFTCard({ imageUrl, title, creator, mintAddress }: NFTCardProps) {
  return (
    <div className="bg-[#2a2a2a] rounded-lg overflow-hidden border border-[#ff6b00]/10 hover:border-[#ff6b00]/30 transition-all">
      <div className="aspect-square relative">
        <Image
          src={imageUrl}
          alt={title || 'NFT'}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-2">{title || 'AI Generated NFT'}</h3>
        <p className="text-sm text-gray-400">
          Created by {truncateAddress(creator)}
        </p>
        {mintAddress && (
          <p className="text-sm text-gray-400 mt-1">
            Mint: {truncateAddress(mintAddress)}
          </p>
        )}
      </div>
    </div>
  );
} 