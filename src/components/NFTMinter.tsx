import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  ComputeBudgetProgram,
  sendAndConfirmRawTransaction
} from '@solana/web3.js';
import { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createVerifyCollectionInstruction,
  createCreateMasterEditionV3Instruction,
  createVerifySizedCollectionItemInstruction,
  DataV2,
  Creator as MetaplexCreator
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

// Update collection constants
const COLLECTION_ADDRESS = new PublicKey("JBvMgUVSD9oQiwcfQx932CCbheaRpmiSFoLpESwzGeyn");
const COLLECTION_AUTHORITY = new PublicKey("BdvamG8zJbo9t5F7jwhhpusoe4rb6mgrAkScqnMychr2");

// Update the interfaces at the top of the file
interface Creator {
  address: string;
  share: number;
}

interface ConfirmationValue {
  err: string | null;
}

interface TransactionConfirmation {
  value: ConfirmationValue;
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
    creators: Creator[];
    collection: {
      name: "SOBA Chimps";
      family: "SOBA";
      address: "JBvMgUVSD9oQiwcfQx932CCbheaRpmiSFoLpESwzGeyn";
    };
  };
  seller_fee_basis_points: number;
}

// Add this type at the top with other interfaces
interface MetaplexMetadata {
  name: string;
  symbol: string;
  description: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: {
    address: string;
    verified: boolean;
    share: number;
  }[];
  collection: {
    verified: boolean;
    key: string;
  };
  uses: null;
}

// Add this interface for the creator type
interface NFTCreatorResponse {
  address: string;
  share: number;
}

// Add retry logic for failed transactions
const sendTransactionWithRetry = async (
  connection: Connection,
  signedTx: Transaction,
  maxRetries = 3
): Promise<string> => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const txId = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3
      });
      return txId;
    } catch (error) {
      console.error(`Transaction attempt ${i + 1} failed:`, error);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  throw lastError;
};

// Add helper functions for PDA derivation
const getMetadataPDA = (mint: PublicKey): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
};

const getMasterEditionPDA = (mint: PublicKey): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('edition'),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
};

// Update collection verification function
const verifyCollectionMetadata = async (connection: Connection, mintAddress: PublicKey) => {
  try {
    const metadataPDA = getMetadataPDA(mintAddress);
    const accountInfo = await connection.getAccountInfo(metadataPDA);
    
    if (!accountInfo) {
      throw new Error('Metadata account not found');
    }

    const collectionMetadataPDA = getMetadataPDA(COLLECTION_ADDRESS);
    const collectionAccountInfo = await connection.getAccountInfo(collectionMetadataPDA);
    
    if (!collectionAccountInfo) {
      throw new Error('Collection metadata account not found');
    }

    return true;
  } catch (error) {
    console.error('Collection verification failed:', error);
    return false;
  }
};

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

  const applyOverlay = async (imageUrl: string): Promise<HTMLCanvasElement | null> => {
    if (!selectedOverlay) {
      // If no overlay, still return a canvas with the original image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      const image = await loadImage(imageUrl);
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      return canvas;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

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
      ctx.drawImage(image, 0, 0);
      
      // Draw the frame
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

      return canvas;
    } catch (error) {
      console.error('Error applying overlay:', error);
      return null;
    }
  };

  const prepareNFTData = async () => {
    try {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      if (!imageId) {
        throw new Error('Image ID is required');
      }

      // Process image first
      const processedCanvas = await applyOverlay(imageUrl);
      if (!processedCanvas) {
        throw new Error('Failed to process image');
      }

      // Convert canvas to blob with proper type
      const blob = await new Promise<Blob>((resolve, reject) => {
        processedCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/png',
          1.0
        );
      });

      // Create a File object from the blob
      const file = new File([blob], 'image.png', { type: 'image/png' });
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageId', imageId);

      console.log('Uploading image...', { imageId });
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const { imageUrl: finalImageUrl } = await uploadResponse.json();
      console.log('Upload successful:', finalImageUrl);

      // On-chain metadata (DataV2 format)
      const onChainMetadata: DataV2 = {
        name: "SOBA Chimp",
        symbol: "SOBA",
        uri: finalImageUrl,
        sellerFeeBasisPoints: 500,
        creators: [
          {
            address: COLLECTION_AUTHORITY,
            verified: false,
            share: 5
          },
          {
            address: publicKey,
            verified: true,
            share: 95
          }
        ],
        collection: {
          verified: false,
          key: COLLECTION_ADDRESS
        },
        uses: null
      };

      // Display metadata for off-chain storage
      const displayMetadata = {
        name: "SOBA Chimp",
        symbol: "SOBA",
        description: "Unique SOBA Chimp NFT with custom frame",
        image: finalImageUrl,
        external_url: "https://sobaverse.art",
        attributes: [
          {
            trait_type: "Frame",
            value: selectedOverlay || "Basic Frame"
          }
        ],
        properties: {
          files: [{ 
            uri: finalImageUrl,
            type: "image/png",
            cdn: true
          }],
          category: "image",
          creators: [
            {
              address: COLLECTION_AUTHORITY.toBase58(),
              share: 5
            },
            {
              address: publicKey.toBase58(),
              share: 95
            }
          ],
          collection: {
            name: "SOBA Chimps",
            family: "SOBA",
            address: COLLECTION_ADDRESS.toBase58()
          }
        },
        seller_fee_basis_points: 500
      };

      return { finalImageUrl, metadata: onChainMetadata, displayMetadata };
    } catch (error) {
      console.error('Error in prepareNFTData:', error);
      throw error;
    }
  };

  const handleMint = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsMinting(true);
    
    try {
      const mint = Keypair.generate();
      const { metadata, displayMetadata } = await prepareNFTData();
      
      const metadataAddress = getMetadataPDA(mint.publicKey);
      const masterEditionAddress = getMasterEditionPDA(mint.publicKey);
      const associatedTokenAddress = await getAssociatedTokenAddress(mint.publicKey, publicKey);

      // Add compute budget instructions with higher priority
      const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 600000  // Increased from 300000
      });
      const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 100000  // Increased from 50000
      });

      // Get fresh blockhash with confirmed commitment
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      
      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      transaction.add(
        modifyComputeUnits,
        addPriorityFee,
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports: await getMinimumBalanceForRentExemptMint(connection),
          programId: TOKEN_PROGRAM_ID
        }),
        createInitializeMintInstruction(mint.publicKey, 0, publicKey, publicKey),
        createAssociatedTokenAccountInstruction(publicKey, associatedTokenAddress, publicKey, mint.publicKey),
        createMintToInstruction(mint.publicKey, associatedTokenAddress, publicKey, 1),
        createCreateMetadataAccountV3Instruction(
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
              collectionDetails: null
            }
          }
        ),
        createCreateMasterEditionV3Instruction(
          {
            edition: masterEditionAddress,
            mint: mint.publicKey,
            updateAuthority: publicKey,
            mintAuthority: publicKey,
            payer: publicKey,
            metadata: metadataAddress,
          },
          {
            createMasterEditionArgs: {
              maxSupply: 0
            }
          }
        )
      );

      // Sign and send transaction with higher priority
      transaction.sign(mint);
      const signedTx = await signTransaction(transaction);
      
      const txId = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true, // Skip preflight to avoid blockhash expiry during simulation
        preflightCommitment: 'confirmed',
        maxRetries: 5
      });

      // Wait for confirmation with exponential backoff
      let retries = 5;
      let delay = 1000; // Start with 1 second delay
      while (retries > 0) {
        try {
          await connection.confirmTransaction({
            signature: txId,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed');
          break;
        } catch (error) {
          console.log(`Retry ${6 - retries} failed, retrying in ${delay}ms...`);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Double the delay for next retry
        }
      }

      // Verify collection through backend
      const verifyResponse = await fetch('/api/verify-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mintAddress: mint.publicKey.toBase58() 
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify collection');
      }

      // Update database
      await fetch('/api/update-mint-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageId,
          mintAddress: mint.publicKey.toBase58() 
        })
      });

      onSuccess(mint.publicKey.toBase58());
      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Mint error:', error);
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