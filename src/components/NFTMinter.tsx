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
import { toast } from 'react-hot-toast';

interface NFTMinterProps {
  imageUrl: string;
  imageId?: string;
  onClose: () => void;
  onSuccess: (mintAddress: string) => void;
  className?: string;
}

// Update the collection address constant with your new collection's address
const COLLECTION_ADDRESS = new PublicKey('JBvMgUVSD9oQiwcfQx932CCbheaRpmiSFoLpESwzGeyn');

// Add these interfaces at the top of the file
interface NFTCreator {
  address: string;
  share: number;
}

interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  uri: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
    creators: NFTCreator[];
    collection: {
      name: string;
      family: string;
    };
  };
  seller_fee_basis_points: number;
}

// Add this interface at the top with other interfaces
interface MetaplexMetadata {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: {
    address: PublicKey;
    verified: boolean;
    share: number;
  }[] | null;
  collection: null;
  uses: null;
}

// Add this interface for the creator type
interface NFTCreatorResponse {
  address: string;
  share: number;
}

export default function NFTMinter({ imageUrl, imageId = "", onClose, onSuccess, className = "" }: NFTMinterProps) {
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

  const updateMintStatus = async (mintAddress: string) => {
    if (!imageId) return;

    try {
      const response = await fetch('/api/update-mint-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          mintAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mint status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating mint status:', error);
      throw error;
    }
  };

  const recordNFT = async (mintAddress: string, imageUrl: string) => {
    try {
      const response = await fetch('/api/record-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAddress,
          imageUrl,
          wallet: publicKey?.toBase58(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record NFT');
      }

      return await response.json();
    } catch (error) {
      console.error('Error recording NFT:', error);
      throw error;
    }
  };

  const prepareNFTData = async (): Promise<{ finalImageUrl: string; metadata: MetaplexMetadata }> => {
    try {
      // Upload image to Vercel Blob
      const combinedImageBlob = await fetch(previewImage).then(r => r.blob());
      const formData = new FormData();
      formData.append('file', combinedImageBlob);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { url: finalImageUrl } = await uploadResponse.json();

      // Get metadata from API
      const metadataResponse = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          wallet: publicKey?.toBase58(),
          frameType: selectedOverlay ? overlayOptions.find(o => o.path === selectedOverlay)?.name : 'Basic Frame',
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to prepare metadata');
      }

      const { metadata: fullMetadata } = await metadataResponse.json();

      // Convert the full metadata to Metaplex format
      const metaplexMetadata: MetaplexMetadata = {
        name: fullMetadata.name,
        symbol: fullMetadata.symbol,
        uri: fullMetadata.uri,
        sellerFeeBasisPoints: fullMetadata.seller_fee_basis_points,
        creators: fullMetadata.properties.creators.map((creator: NFTCreatorResponse) => ({
          address: new PublicKey(creator.address),
          verified: false,
          share: creator.share,
        })),
        collection: null,
        uses: null,
      };

      return {
        finalImageUrl,
        metadata: metaplexMetadata,
      };
    } catch (error) {
      console.error('Error preparing NFT data:', error);
      throw error;
    }
  };

  const handleMint = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!selectedOverlay) {
      toast.error('Please select a frame');
      return;
    }

    setIsMinting(true);
    console.log('Starting mint process...');

    try {
      console.log('Preparing NFT data...');
      const { finalImageUrl, metadata } = await prepareNFTData();
      console.log('NFT data prepared:', { finalImageUrl, metadata });

      const mint = Keypair.generate();
      console.log('Generated mint keypair:', mint.publicKey.toBase58());

      // Calculate minimum lamports for rent exemption
      const rentExemptionAmount = await getMinimumBalanceForRentExemptMint(connection);

      // Generate the metadata address
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      // Get associated token account address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint.publicKey,
        publicKey
      );

      // Create metadata instruction with the properly structured metadata
      const createMetadataIx = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataAddress,
          mint: mint.publicKey,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: metadata,
            isMutable: true,
            collectionDetails: null,
          },
        }
      );

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports: rentExemptionAmount,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mint.publicKey,
          0,
          publicKey,
          publicKey
        ),
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mint.publicKey
        ),
        createMintToInstruction(
          mint.publicKey,
          associatedTokenAddress,
          publicKey,
          1
        ),
        createMetadataIx
      );

      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction with mint account
      transaction.sign(mint);

      // Request wallet signature
      const signedTx = await signTransaction(transaction);

      // Send transaction
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);

      // Record NFT in database
      await recordNFT(mint.publicKey.toBase58(), finalImageUrl);

      // Update mint status if imageId exists
      if (imageId) {
        await updateMintStatus(mint.publicKey.toBase58());
      }

      onSuccess(mint.publicKey.toBase58());
      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Detailed mint error:', error);
      toast.error('Failed to mint NFT');
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