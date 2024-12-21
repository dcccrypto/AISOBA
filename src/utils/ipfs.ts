import { NFTStorage } from 'nft.storage';

// Add proper token validation
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN;
if (!NFT_STORAGE_TOKEN || NFT_STORAGE_TOKEN.includes('...')) {
  throw new Error('Valid NFT_STORAGE_TOKEN is required');
}

// Initialize client with proper configuration
const client = new NFTStorage({ 
  token: NFT_STORAGE_TOKEN.trim(),
  endpoint: new URL('https://api.nft.storage')
});

/**
 * Converts an HTTP URL to IPFS URL format
 */
export async function uploadToIPFS(imageUrl: string): Promise<string> {
  try {
    // Fetch the image with proper headers
    const response = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const imageBlob = await response.blob();
    if (imageBlob.size === 0) {
      throw new Error('Empty image blob');
    }

    // Upload with proper error handling
    const cid = await client.storeBlob(new Blob([imageBlob], { type: imageBlob.type }));
    if (!cid) {
      throw new Error('Failed to get CID from NFT.Storage');
    }

    return `ipfs://${cid}`;
  } catch (error) {
    console.error('Detailed IPFS Upload Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      token: NFT_STORAGE_TOKEN ? 'Token exists' : 'No token found'
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