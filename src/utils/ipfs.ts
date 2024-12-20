import { NFTStorage } from 'nft.storage';

// Add error checking for the token
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN;
if (!NFT_STORAGE_TOKEN) {
  throw new Error('NFT_STORAGE_TOKEN is not configured');
}

const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

/**
 * Converts an HTTP URL to IPFS URL format
 */
export async function uploadToIPFS(imageUrl: string): Promise<string> {
  try {
    // Fetch the image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const imageBlob = await response.blob();
    
    // Validate blob
    if (imageBlob.size === 0) {
      throw new Error('Empty image blob');
    }

    // Upload to IPFS via NFT.Storage
    const cid = await client.storeBlob(imageBlob);
    if (!cid) {
      throw new Error('Failed to get CID from NFT.Storage');
    }

    return `ipfs://${cid}`;
  } catch (error) {
    console.error('Detailed IPFS Upload Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('Failed to store image on IPFS');
  }
}

/**
 * Converts an IPFS URL to HTTP URL format
 */
export function ipfsToHttp(ipfsUrl: string): string {
  if (!ipfsUrl) return '';
  if (!ipfsUrl.startsWith('ipfs://')) return ipfsUrl;
  
  // Replace ipfs:// with the gateway URL
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://nftstorage.link/ipfs/${cid}`;
} 