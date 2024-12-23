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
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createVerifyCollectionInstruction
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

// Update the interfaces at the top of the file
interface MetaplexMetadata {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Array<{
    address: PublicKey;
    verified: boolean;
    share: number;
  }> | null;
  collection: null;
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

  const prepareNFTData = async () => {
    try {
      // Ensure image is properly uploaded and accessible
      const imageResponse = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ imageUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { url: finalImageUrl } = await imageResponse.json();
      
      // Ensure metadata uses the correct image URL
      const metadataResponse = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: finalImageUrl, // Use the uploaded image URL
          wallet: publicKey?.toBase58(),
          frameType: selectedOverlay
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to prepare metadata');
      }

      const { metadata } = await metadataResponse.json();

      return {
        finalImageUrl,
        metadata: {
          ...metadata,
          collection: {
            key: COLLECTION_ADDRESS,
            verified: false // Will be verified in the transaction
          }
        }
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

    const selectedFrame = overlayOptions.find(o => o.path === selectedOverlay);
    if (!selectedFrame) {
      toast.error('Invalid frame selected');
      return;
    }

    if (sobaBalance < selectedFrame.required) {
      toast.error(`Insufficient SOBA balance. Required: ${selectedFrame.required.toLocaleString()} SOBA`);
      return;
    }

    setIsMinting(true);
    console.log('Starting mint process...');

    try {
      // Verify collection first
      if (!(await verifyCollectionMetadata(connection, COLLECTION_ADDRESS))) {
        toast.error('Collection verification failed');
        return;
      }

      // Get latest blockhash first to ensure fresh transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      console.log('Latest blockhash:', blockhash);

      console.log('Preparing NFT data...');
      const { finalImageUrl, metadata } = await prepareNFTData();
      console.log('NFT data prepared:', { finalImageUrl, metadata });

      const mint = Keypair.generate();
      console.log('Generated mint keypair:', mint.publicKey.toBase58());

      // Calculate minimum lamports for rent exemption
      const rentExemptionAmount = await getMinimumBalanceForRentExemptMint(connection);
      console.log('Rent exemption amount:', rentExemptionAmount);

      // Generate the metadata address
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );
      console.log('Metadata address:', metadataAddress.toBase58());

      // Get associated token account address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint.publicKey,
        publicKey
      );
      console.log('Associated token address:', associatedTokenAddress.toBase58());

      // Create transaction with proper ordering
      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Add instructions in correct order
      transaction.add(
        // 1. Create mint account
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports: rentExemptionAmount,
          programId: TOKEN_PROGRAM_ID,
        }),
        
        // 2. Initialize mint
        createInitializeMintInstruction(
          mint.publicKey,
          0,
          publicKey,
          publicKey
        ),
        
        // 3. Create associated token account
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mint.publicKey
        ),
        
        // 4. Mint token
        createMintToInstruction(
          mint.publicKey,
          associatedTokenAddress,
          publicKey,
          1
        ),
        
        // 5. Create metadata
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
              collectionDetails: null,
            },
          }
        ),
        
        // 6. Verify collection
        createVerifyCollectionInstruction({
          metadata: metadataAddress,
          collectionAuthority: COLLECTION_AUTHORITY,
          payer: publicKey,
          collectionMint: COLLECTION_ADDRESS,
          collection: getMetadataPDA(COLLECTION_ADDRESS),
          collectionMasterEditionAccount: getMasterEditionPDA(COLLECTION_ADDRESS)
        })
      );

      // Sign with mint account first
      transaction.sign(mint);
      console.log('Transaction signed by mint account');

      // Then get wallet signature
      const signedTx = await signTransaction(transaction);
      console.log('Transaction signed by wallet');

      // Send with proper commitment
      const txId = await sendTransactionWithRetry(connection, signedTx);
      console.log('Transaction sent:', txId);

      // Wait for confirmation with timeout
      const confirmation = await Promise.race([
        connection.confirmTransaction({
          signature: txId,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        }, 'confirmed'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction confirmation timeout')), 
            process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' ? 120000 : 60000
          )
        )
      ]) as TransactionConfirmation;

      if (confirmation.value?.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('Transaction confirmed:', confirmation);

      // Record NFT in database
      await recordNFT(mint.publicKey.toBase58(), finalImageUrl);
      console.log('NFT recorded in database');

      // Update mint status if imageId exists
      if (imageId) {
        await updateMintStatus(mint.publicKey.toBase58());
        console.log('Mint status updated');
      }

      onSuccess(mint.publicKey.toBase58());
      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Detailed mint error:', error);
      if (error instanceof Error) {
        toast.error(`Failed to mint NFT: ${error.message}`);
      } else {
        toast.error('Failed to mint NFT: Unknown error');
      }
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