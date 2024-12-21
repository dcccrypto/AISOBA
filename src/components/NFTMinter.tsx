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
  getAccount,
  Account
} from '@solana/spl-token';
import { applyOverlay } from '../utils/imageProcessing';

interface NFTMinterProps {
  imageUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
}

// Update the collection address constant with your new collection's address
const COLLECTION_ADDRESS = new PublicKey('JBvMgUVSD9oQiwcfQx932CCbheaRpmiSFoLpESwzGeyn');

export default function NFTMinter({ imageUrl, onClose, onSuccess, className = "" }: NFTMinterProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(imageUrl);
  const [sobaBalance, setSobaBalance] = useState<number>(0);

  const overlayOptions = [
    { id: 1, path: '/nft/nftoverlay.png', name: 'Basic Frame', required: 0 },
    { id: 2, path: '/nft/nftoverlay2.png', name: 'Modern Frame', required: 200000 },
    { id: 3, path: '/nft/nftoverlay3.png', name: 'Elegant Frame', required: 300000 },
    { id: 4, path: '/nft/nftoverlay4.png', name: 'Minimal Frame', required: 400000 },
    { id: 5, path: '/nft/nftoverlay5.png', name: 'Premium Frame', required: 500000 },
    { id: 6, path: '/nft/nftoverlay6.png', name: 'Legendary Frame', required: 1000000 }
  ];

  // Check SOBA balance
  useEffect(() => {
    async function checkBalance() {
      if (!publicKey) return;
      
      try {
        const sobaTokenMint = new PublicKey('25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH');
        const tokenAccount = await getAssociatedTokenAddress(sobaTokenMint, publicKey);
        
        try {
          const account: Account = await getAccount(connection, tokenAccount);
          const balance = Number(account.amount) / 1e6;
          setSobaBalance(balance);
        } catch (e) {
          setSobaBalance(0);
        }
      } catch (error) {
        console.error('Error checking SOBA balance:', error);
        setSobaBalance(0);
      }
    }

    checkBalance();
  }, [publicKey, connection]);

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
    <div className={`bg-[#1a1a1a] rounded-lg border border-[#ff6b00]/10 ${className}`}>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Preview</h2>
            <div className="aspect-square relative rounded-lg overflow-hidden bg-[#2a2a2a]">
              <img
                src={previewImage}
                alt="NFT Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Frame selection section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Select Frame</h2>
              <p className="text-gray-400">Your SOBA Balance: {sobaBalance.toLocaleString()} $SOBA</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {overlayOptions.map((overlay) => {
                const canUse = sobaBalance >= overlay.required;
                return (
                  <button
                    key={overlay.id}
                    onClick={() => canUse && setSelectedOverlay(overlay.path)}
                    disabled={!canUse}
                    className={`p-4 rounded-lg border transition-colors ${
                      !canUse 
                        ? 'border-red-500/10 bg-red-500/5 opacity-50 cursor-not-allowed' 
                        : selectedOverlay === overlay.path
                        ? 'border-[#ff6b00] bg-[#ff6b00]/10'
                        : 'border-[#ff6b00]/10 hover:border-[#ff6b00]/30 bg-[#2a2a2a]'
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
                    <p className="text-xs mt-1 text-center text-gray-500">
                      {overlay.required.toLocaleString()} $SOBA
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleMint}
              disabled={isMinting}
              className="w-full btn-primary"
            >
              {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 