import Image from 'next/image';
import { truncateAddress } from '../utils/formatting';
import ShareButton from './ShareButton';

interface NFTCardProps {
  imageUrl: string;
  title: string;
  creator: string;
  mintAddress: string;
}

export default function NFTCard({ imageUrl, title, creator, mintAddress }: NFTCardProps) {
  return (
    <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="aspect-square relative group">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ShareButton
            imageUrl={imageUrl}
            title={title}
            creator={creator}
            type="nft"
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
        <p className="text-gray-400 text-sm truncate">Created by {creator}</p>
      </div>
    </div>
  );
} 