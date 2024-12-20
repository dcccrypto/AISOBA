import { NFTStorage } from 'nft.storage';

const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN! });

export async function uploadToIPFS(imageUrl: string): Promise<string> {
  try {
    // Fetch the image from Replicate's URL
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();

    // Upload to IPFS via NFT.Storage
    const cid = await client.storeBlob(imageBlob);
    
    // Return the IPFS URL
    return `ipfs://${cid}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to store image on IPFS');
  }
}

export function ipfsToHttp(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) return ipfsUrl;
  
  // Replace ipfs:// with the gateway URL
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://nftstorage.link/ipfs/${cid}`;
} 