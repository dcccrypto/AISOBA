import { NFTStorage } from 'nft.storage';

const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN! });

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

    // Upload to IPFS via NFT.Storage
    const cid = await client.storeBlob(imageBlob);
    return `ipfs://${cid}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
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