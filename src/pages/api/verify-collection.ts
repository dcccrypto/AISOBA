import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  Keypair,
  SystemProgram
} from '@solana/web3.js';
import { 
  createVerifyCollectionInstruction,
  VerifyCollectionInstructionAccounts,
  createVerifySizedCollectionItemInstruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID 
} from '@metaplex-foundation/mpl-token-metadata';
import bs58 from 'bs58';

const prisma = new PrismaClient();
const COLLECTION_ADDRESS = new PublicKey('BUj8NP6QESpG9JPVN2ca87ZbSZtuJ3JgUCCNCarKBG7r');

// Load collection authority from environment variable
const getCollectionAuthority = () => {
  try {
    const privateKeyString = process.env.COLLECTION_AUTHORITY_PRIVATE_KEY;
    if (!privateKeyString) {
      throw new Error('Collection authority private key not found in environment variables');
    }
    
    // Parse the array string into actual numbers
    const privateKeyArray = JSON.parse(privateKeyString);
    
    // Validate the private key array
    if (!Array.isArray(privateKeyArray) || privateKeyArray.length !== 64) {
      throw new Error('Invalid private key format: must be an array of 64 numbers');
    }
    
    // Convert to Uint8Array for Keypair
    const privateKeyUint8 = new Uint8Array(privateKeyArray);
    const keypair = Keypair.fromSecretKey(privateKeyUint8);
    
    // Validate the keypair was created successfully
    if (!keypair.publicKey || !keypair.secretKey) {
      throw new Error('Failed to create valid keypair from private key');
    }
    
    return keypair;
  } catch (error) {
    console.error('Error parsing collection authority private key:', error);
    throw error; // Throw the original error for better debugging
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const collectionAuthority = getCollectionAuthority();
    
    // Validate collection authority was initialized correctly
    if (!collectionAuthority || !collectionAuthority.publicKey) {
      throw new Error('Invalid collection authority');
    }

    const { mintAddress } = req.body;
    if (!mintAddress) {
      return res.status(400).json({ message: 'Mint address is required' });
    }

    // First find the NFT by mintAddress
    const nft = await prisma.nFT.findFirst({
      where: { mintAddress },
    });

    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    // Initialize connection with commitment
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' 
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Get PDAs
    const mintPublicKey = new PublicKey(mintAddress);
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [collectionMetadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        COLLECTION_ADDRESS.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Get the master edition PDA for the collection
    const [collectionMasterEditionPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        COLLECTION_ADDRESS.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Create verification instruction
    const verifyInstruction = createVerifySizedCollectionItemInstruction(
      {
        metadata: metadataPDA,
        collectionAuthority: collectionAuthority.publicKey,
        payer: collectionAuthority.publicKey,
        collectionMint: COLLECTION_ADDRESS,
        collection: collectionMetadataPDA,
        collectionMasterEditionAccount: collectionMasterEditionPDA,
        collectionAuthorityRecord: undefined
      } as VerifyCollectionInstructionAccounts
    );

    // Create and sign transaction with proper versioning
    const transaction = new Transaction();
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = collectionAuthority.publicKey;
    
    // Add the verify instruction
    transaction.add(verifyInstruction);

    // Sign transaction properly
    transaction.sign(collectionAuthority);
    const serializedTx = transaction.serialize();

    // Send and confirm with proper options
    const signature = await connection.sendRawTransaction(serializedTx, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 5
    });

    // Wait for confirmation with specific commitment
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }

    // Update NFT record using the id
    await prisma.nFT.update({
      where: { id: nft.id },
      data: { verified: true },
    });

    res.status(200).json({ 
      success: true, 
      signature,
      message: 'NFT verified in collection'
    });

  } catch (error) {
    console.error('Error verifying collection:', error);
    res.status(500).json({ 
      message: 'Error verifying collection',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  }
} 