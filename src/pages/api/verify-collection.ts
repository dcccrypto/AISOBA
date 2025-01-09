import { NextApiRequest, NextApiResponse } from 'next';
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  createVerifySizedCollectionItemInstruction,
  UpdateMetadataAccountArgsV2,
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';

const COLLECTION_ADDRESS = new PublicKey('JBvMgUVSD9oQiwcfQx932CCbheaRpmiSFoLpESwzGeyn');
const COLLECTION_AUTHORITY = new PublicKey('BdvamG8zJbo9t5F7jwhhpusoe4rb6mgrAkScqnMychr2');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mintAddress } = req.body;
    if (!mintAddress) {
      return res.status(400).json({ message: 'Mint address is required' });
    }

    // Check for collection authority key
    const collectionAuthorityKey = process.env.COLLECTION_AUTHORITY_KEY;
    if (!collectionAuthorityKey) {
      throw new Error('Collection authority key not configured');
    }

    // Create keypair from array format key
    const authorityKeyArray = [103,185,143,236,3,86,7,225,146,109,53,33,203,133,56,119,76,222,27,211,231,237,61,138,35,100,206,101,31,218,149,221,158,10,93,39,222,64,86,174,167,58,203,228,127,248,241,193,66,103,130,6,231,202,60,130,142,25,53,200,238,86,218,115];
    const authorityKeypair = Keypair.fromSecretKey(Uint8Array.from(authorityKeyArray));

    // Verify the keypair matches the expected authority
    if (authorityKeypair.publicKey.toBase58() !== COLLECTION_AUTHORITY.toBase58()) {
      throw new Error('Collection authority key mismatch');
    }

    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, 'confirmed');
    const mint = new PublicKey(mintAddress);

    // Get PDAs
    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [collectionMetadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        COLLECTION_ADDRESS.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [collectionMasterEdition] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        COLLECTION_ADDRESS.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Create update authority transfer instruction
    const updateAuthorityInstruction = createUpdateMetadataAccountV2Instruction(
      {
        metadata,
        updateAuthority: authorityKeypair.publicKey,
      },
      {
        updateMetadataAccountArgsV2: {
          data: null,
          updateAuthority: COLLECTION_AUTHORITY,
          primarySaleHappened: null,
          isMutable: null,
        }
      }
    );

    // Create verify collection instruction
    const verifyInstruction = createVerifySizedCollectionItemInstruction({
      metadata,
      collectionAuthority: COLLECTION_AUTHORITY,
      payer: COLLECTION_AUTHORITY,
      collectionMint: COLLECTION_ADDRESS,
      collection: collectionMetadata,
      collectionMasterEditionAccount: collectionMasterEdition,
    });

    // Add compute budget instructions for higher priority
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 600000
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 100000
    });

    const tx = new Transaction()
      .add(modifyComputeUnits)
      .add(addPriorityFee)
      .add(updateAuthorityInstruction)
      .add(verifyInstruction);

    tx.feePayer = COLLECTION_AUTHORITY;
    
    // Get fresh blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;

    // Send and confirm transaction with retries
    let retries = 5;
    let lastError;

    while (retries > 0) {
      try {
        const txId = await sendAndConfirmTransaction(
          connection,
          tx,
          [authorityKeypair],
          {
            commitment: 'confirmed',
            skipPreflight: true,
            maxRetries: 3
          }
        );

        return res.status(200).json({
          success: true,
          txId,
        });
      } catch (error) {
        console.log(`Retry ${6 - retries} failed:`, error);
        lastError = error;
        retries--;
        if (retries === 0) break;
        await new Promise(resolve => setTimeout(resolve, 1000 * (6 - retries)));
      }
    }

    throw lastError || new Error('Failed to verify collection after all retries');

  } catch (error) {
    console.error('Error verifying collection:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify collection',
    });
  }
} 