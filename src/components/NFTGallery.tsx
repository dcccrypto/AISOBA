import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import NFTCard from './NFTCard';

interface NFTGalleryProps {
  userOnly?: boolean;
}

interface NFT {
  id: string;
  imageUrl: string;
  title: string;
  mintAddress: string;
  creator: string;
}

interface PaginatedNFTResponse {
  nfts: NFT[];
  nextPage: number | null;
  hasMore: boolean;
  total: number;
}

export default function NFTGallery({ userOnly = false }: NFTGalleryProps) {
  const { publicKey } = useWallet();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedNFTResponse, Error>({
    queryKey: ['nfts', userOnly, publicKey?.toString()],
    queryFn: async ({ pageParam = 1 }) => {
      const endpoint = userOnly ? '/api/user/nfts' : '/api/gallery';
      const response = await fetch(
        `${endpoint}?page=${pageParam}${userOnly ? `&wallet=${publicKey?.toString()}` : ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: !userOnly || !!publicKey,
    staleTime: 60000,
    cacheTime: 300000,
  });

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.pages.map((page) =>
              page.nfts.map((nft: NFT) => (
                <NFTCard
                  key={nft.id}
                  imageUrl={nft.imageUrl}
                  title={nft.title}
                  creator={nft.creator}
                  mintAddress={nft.mintAddress}
                />
              ))
            )}
          </div>

          {hasNextPage && (
            <div ref={ref} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <div className="loading-spinner" />
              ) : (
                <button
                  onClick={() => fetchNextPage()}
                  className="btn-secondary"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 