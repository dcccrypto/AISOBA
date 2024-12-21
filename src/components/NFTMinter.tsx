import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair
} from '@solana/web3.js';
import { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import { 
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
} from '@solana/spl-token';
import { applyOverlay } from '../utils/imageProcessing';

interface NFTMinterProps {
  imageUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
}

// Update the collection address constant with your new collection's address
const COLLECTION_ADDRESS = new PublicKey('JBvMgUVSD9oQiwcfQx932CCbheaRpmiSFoLpESwzGeyn');

export default function NFTMinter({ imageUrl, onClose, onSuccess }: NFTMinterProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(imageUrl);

  const overlayOptions = [
    { id: 1, path: '/nft/nftoverlay.png', name: 'Classic Frame' },
    { id: 2, path: '/nft/nftoverlay2.png', name: 'Modern Frame' },
    { id: 3, path: '/nft/nftoverlay3.png', name: 'Elegant Frame' },
    { id: 4, path: '/nft/nftoverlay4.png', name: 'Minimal Frame' },
    { id: 5, path: '/nft/nftoverlay5.png', name: 'Premium Frame' },
  ];

  // Updated frame overlay effect
  useEffect(() => {
    if (!selectedOverlay) {
      setPreviewImage(imageUrl);
      return;
    }

    const applyFrame = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      try {
        // Load both images
        const [image, frame] = await Promise.all([
          loadImage(imageUrl),
          loadImage(selectedOverlay)
        ]);

        // Set canvas size to match the original image
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw the original image
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        // Draw the frame
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

        // Update preview
        const newPreview = canvas.toDataURL('image/png');
        setPreviewImage(newPreview);
      } catch (error) {
        console.error('Error applying frame:', error);
        // Fallback to original image if frame application fails
        setPreviewImage(imageUrl);
      }
    };

    applyFrame();
  }, [selectedOverlay, imageUrl]);

  // Helper function to load images
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";  // Important for CORS
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'soba-chimp.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My SOBA Chimp',
          text: 'Check out my unique SOBA chimpanzee PFP!',
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        // Add toast notification here if you have one
        alert('Image URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleMint = async () => {
    setIsMinting(true);
    try {
      // Add your minting logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated minting
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error minting:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl bg-[#2a2a2a] rounded-lg shadow-xl">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh]">
          {/* Preview section */}
          <div className="md:w-1/2 p-6 flex-shrink-0">
            <div className="aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]">
              <img 
                src={previewImage} 
                alt="SOBA Chimp Preview" 
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Download and Share buttons */}
            <div className="flex gap-4 mt-4">
              <button 
                onClick={handleDownload}
                className="flex-1 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#ff6b00]/10 transition-colors"
              >
                Download
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#ff6b00]/10 transition-colors"
              >
                Share
              </button>
            </div>
          </div>

          {/* Frame selection section */}
          <div className="md:w-1/2 p-6 overflow-y-auto border-t md:border-t-0 md:border-l border-[#ff6b00]/10">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Select Frame
                </h2>
                <p className="text-gray-400">
                  Choose a frame for your SOBA chimp NFT
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {overlayOptions.map((overlay) => (
                  <button
                    key={overlay.id}
                    onClick={() => setSelectedOverlay(overlay.path)}
                    className={`p-4 rounded-lg border border-[#ff6b00]/10 hover:border-[#ff6b00]/30 bg-[#1a1a1a] text-white transition-colors ${
                      selectedOverlay === overlay.path ? 'border-[#ff6b00] bg-[#ff6b00]/10' : ''
                    }`}
                  >
                    <img
                      src={overlay.path}
                      alt={overlay.name}
                      className="w-full h-12 object-contain"
                    />
                    <p className="text-xs mt-1 text-center text-gray-400">
                      {overlay.name}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleMint}
                  disabled={isMinting}
                  className="w-full bg-[#ff6b00] hover:bg-[#ff8533] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {isMinting ? 'Minting...' : 'Mint NFT'}
                </button>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Gas fees will apply
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 