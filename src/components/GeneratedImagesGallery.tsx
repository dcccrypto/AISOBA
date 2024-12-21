import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import ShareButton from './ShareButton';
import { toast } from 'react-hot-toast';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  createdAt: string;
  creator: string;
  frameType: string;
  mintAddress?: string;
}

interface APIResponse {
  images: GeneratedImage[];
  nextPage: number | null;
  totalCount: number;
}

export default function GeneratedImagesGallery() {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<APIResponse, Error>({
    queryKey: ['generatedImages'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      try {
        const response = await fetch(`/api/images?page=${pageParam}&limit=12`);
        if (!response.ok) throw new Error('Failed to fetch images');
        const data: APIResponse = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: 60000,
    gcTime: 300000,
    retry: 3,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading images. Please try again later.</p>
      </div>
    );
  }

  const allImages = data?.pages.flatMap(page => page.images) ?? [];

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-[#2a2a2a] rounded-lg"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image) => (
              <div
                key={image.id}
                className="relative group aspect-square bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.imageUrl}
                  alt={`Generated SOBA PFP ${image.id}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">View Details</span>
                </div>
              </div>
            ))}
          </div>

          {hasNextPage && (
            <div ref={ref} className="flex justify-center py-8">
              {isFetchingNextPage ? (
                <div className="loading-spinner" />
              ) : (
                <button
                  onClick={() => fetchNextPage()}
                  className="btn-secondary px-6 py-2"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Image Details Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-3xl w-full mx-auto relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <ShareButton
                  imageUrl={selectedImage.imageUrl}
                  type="creation"
                />
                <div>
                  <h3 className="text-lg font-medium text-white">SOBA PFP #{selectedImage.id}</h3>
                  <p className="text-sm text-gray-400">
                    Created {new Date(selectedImage.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="aspect-square rounded-lg overflow-hidden mb-4">
              <img
                src={selectedImage.imageUrl}
                alt={`SOBA PFP #${selectedImage.id}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Creator</span>
                <p className="text-white font-medium truncate">{selectedImage.creator}</p>
              </div>
              <div>
                <span className="text-gray-400">Frame Type</span>
                <p className="text-white font-medium">{selectedImage.frameType}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 