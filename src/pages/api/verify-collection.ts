import { NextApiRequest, NextApiResponse } from 'next';
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import {
  createVerifySizedCollectionItemInstruction,
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

    // Create verify collection instruction
    const verifyInstruction = createVerifySizedCollectionItemInstruction({
      metadata,
      collectionAuthority: COLLECTION_AUTHORITY,
      payer: COLLECTION_AUTHORITY,
      collectionMint: COLLECTION_ADDRESS,
      collection: collectionMetadata,
      collectionMasterEditionAccount: collectionMasterEdition,
    });

    const tx = new Transaction().add(verifyInstruction);
    tx.feePayer = COLLECTION_AUTHORITY;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Send and confirm transaction
    const txId = await sendAndConfirmTransaction(
      connection,
      tx,
      [Keypair.fromSecretKey(Buffer.from(process.env.COLLECTION_AUTHORITY_KEY!, 'base64'))],
      { commitment: 'confirmed' }
    );

    return res.status(200).json({
      success: true,
      txId,
    });

  } catch (error) {
    console.error('Error verifying collection:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify collection',
    });
  }
} 