import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { ImageGeneration } from '@prisma/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import NFTMinter from './NFTMinter';
import ShareButton from './ShareButton';

interface PaginatedResponse {
  images: ImageGenerationWithMintStatus[];
  nextPage: number | null;
  hasMore: boolean;
  total: number;
}

interface ImageGenerationWithMintStatus extends ImageGeneration {
  isMinted: boolean;
  httpUrl: string;
}

export default function GeneratedImagesGallery() {
  const { publicKey } = useWallet();
  const [selectedImage, setSelectedImage] = useState<ImageGenerationWithMintStatus | null>(null);
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedResponse>({
    queryKey: ['generatedImages', publicKey?.toString()],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/user/generated-images?page=${pageParam}&wallet=${publicKey?.toString()}`);
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse) => 
      lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: !!publicKey,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleImageClick = (image: ImageGenerationWithMintStatus) => {
    setSelectedImage(image);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
        Your Generated Images
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data?.pages.map((page: PaginatedResponse, index: number) =>
              page.images.map((image: ImageGenerationWithMintStatus) => (
                <div
                  key={`${image.id}-${index}`}
                  className="relative group cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = image.httpUrl;
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <p className="font-semibold mb-2">
                        {image.isMinted ? 'Already Minted' : 'Click to Mint'}
                      </p>
                      <p className="text-sm line-clamp-2">{image.prompt}</p>
                    </div>
                  </div>
                </div>
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

      {/* Minting Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-2xl w-full mx-4 relative">
            <div className="flex justify-between items-center mb-4">
              <ShareButton
                imageUrl={selectedImage.imageUrl}
                type="creation"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                className="w-full rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = selectedImage.httpUrl;
                }}
              />

              <div className="space-y-4">
                <p className="text-gray-300">{selectedImage.prompt}</p>
                
                {!selectedImage.isMinted && (
                  <NFTMinter
                    imageUrl={selectedImage.imageUrl}
                    onClose={() => setSelectedImage(null)}
                    onSuccess={() => {
                      toast.success('NFT minted successfully!');
                      setSelectedImage(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 