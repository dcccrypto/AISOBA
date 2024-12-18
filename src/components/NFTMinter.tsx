import { useState } from 'react';
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

interface NFTMinterProps {
  imageUrl: string;
}

// Add collection address constant
const COLLECTION_ADDRESS = new PublicKey('BUj8NP6QESpG9JPVN2ca87ZbSZtuJ3JgUCCNCarKBG7r');

export default function NFTMinter({ imageUrl }: NFTMinterProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mb-8">
      <h2 className="text-2xl mb-4">Mint as NFT</h2>
      <div className="mb-4">
        <img 
          src={imageUrl} 
          alt="Generated artwork" 
          className="max-w-sm rounded shadow-lg"
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        onClick={mintNFT}
        disabled={minting || !publicKey}
      >
        {minting ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  );
} 