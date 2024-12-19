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
}

// Update the collection address constant with your new collection's address
const COLLECTION_ADDRESS = new PublicKey('JBvMgUVSD9oQiwcfQx932CCbheaRpmiSFoLpESwzGeyn');

export default function NFTMinter({ imageUrl }: NFTMinterProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        const overlaidImage = await applyOverlay(imageUrl);
        setProcessedImageUrl(overlaidImage);
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Failed to process image');
        setProcessedImageUrl(imageUrl);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [imageUrl]);

  const mintNFT = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    setMinting(true);
    setError(null);

    try {
      const metadataResponse = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          wallet: publicKey.toString(),
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to prepare NFT metadata');
      }

      const { metadata } = await metadataResponse.json();

      // Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      
      // Get the minimum lamports required for the mint
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      
      // Get metadata account address
      const metadataPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0];

      // Get associated token account address
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );

      // Get collection metadata account
      const collectionMetadataPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          COLLECTION_ADDRESS.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0];

      // Create NFT mint transaction
      const transaction = new Transaction();
      
      // Add recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        // Initialize mint
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          0,
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        ),
        // Create associated token account
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAccount,
          publicKey,
          mintKeypair.publicKey
        ),
        // Mint one token
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAccount,
          publicKey,
          1
        ),
        // Create metadata account
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataPDA,
            mint: mintKeypair.publicKey,
            mintAuthority: publicKey,
            payer: publicKey,
            updateAuthority: publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: metadata.name,
                symbol: 'AINFT',
                uri: metadata.image,
                sellerFeeBasisPoints: metadata.seller_fee_basis_points,
                creators: [{
                  address: publicKey,
                  verified: true,
                  share: 100,
                }],
                collection: {
                  key: COLLECTION_ADDRESS,
                  verified: false, // Will be verified in a separate tx by collection authority
                },
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
        )
      );

      // Sign with the mint keypair
      transaction.partialSign(mintKeypair);

      // Sign and send transaction
      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);

      // Record the mint in database
      const recordResponse = await fetch('/api/record-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mintAddress: mintKeypair.publicKey.toString(),
          imageUrl,
          wallet: publicKey.toString(),
        }),
      });

      if (!recordResponse.ok) {
        throw new Error('Failed to record NFT in database');
      }

      // Verify the NFT as part of the collection
      const verifyResponse = await fetch('/api/verify-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mintAddress: mintKeypair.publicKey.toString(),
        }),
      });

      if (!verifyResponse.ok) {
        console.warn('Failed to verify NFT in collection:', await verifyResponse.text());
      }

      console.log('NFT minted successfully into collection:', COLLECTION_ADDRESS.toString());
    } catch (error) {
      console.error('Error minting NFT:', error);
      setError(error instanceof Error ? error.message : 'Error minting NFT');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="card hover:shadow-orange-500/20">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
            Mint as NFT
          </h2>
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="px-3 py-1 text-sm rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
          >
            {isPreviewMode ? 'Show Original' : 'Preview NFT'}
          </button>
        </div>

        <div className="relative group">
          {isProcessing ? (
            <div className="w-full h-64 flex items-center justify-center bg-gray-800 rounded-lg">
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="relative">
              <div className="image-preview overflow-hidden rounded-lg">
                <img 
                  src={isPreviewMode ? processedImageUrl : imageUrl} 
                  alt={isPreviewMode ? "NFT preview" : "Original artwork"} 
                  className="w-full h-auto transform transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {isPreviewMode && (
                <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full">
                  <p className="text-xs text-white">NFT Preview</p>
                </div>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center p-4">
            <p className="text-white text-sm">
              {isPreviewMode ? 'Preview of your NFT with overlay' : 'Click Preview NFT to see how it will look'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <button
          onClick={mintNFT}
          disabled={minting || isProcessing || !processedImageUrl}
          className="btn-primary group relative"
        >
          <span className="flex items-center justify-center">
            {minting ? (
              <>
                <div className="loading-spinner mr-2" />
                Minting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 00-2 0v1H8a1 1 0 000 2h1v1a1 1 0 002 0v-1h1a1 1 0 000-2h-1V9z" />
                </svg>
                Mint NFT
              </>
            )}
          </span>
        </button>

        {isPreviewMode && (
          <p className="text-sm text-gray-400 text-center">
            This is how your NFT will look after minting. The overlay will be permanently applied.
          </p>
        )}
      </div>
    </div>
  );
} 