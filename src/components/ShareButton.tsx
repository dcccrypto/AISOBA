import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ShareButtonProps {
  imageUrl: string;
  title?: string;
  creator?: string;
  type: 'creation' | 'nft';
}

export default function ShareButton({ imageUrl, title, creator, type }: ShareButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getShareText = () => {
    const baseText = type === 'nft' 
      ? `Check out my NFT${title ? ` "${title}"` : ''} on SOBA Verse`
      : `Check out my AI-generated art on SOBA Verse`;
    
    return encodeURIComponent(`${baseText} #SOBAVerse #AIArt #NFT #Solana`);
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${getShareText()}&url=${encodeURIComponent(imageUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${getShareText()}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success('Link copied to clipboard!');
      setIsDropdownOpen(false);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Share"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] rounded-lg shadow-lg z-50">
          <div className="py-1">
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on Twitter
            </a>
            
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.67 2.95-1.26 3.56-1.48 3.96-1.48.09 0 .28.02.41.09.11.06.19.14.22.24.03.11.04.21.02.3z"/>
              </svg>
              Share on Telegram
            </a>

            <button
              onClick={copyToClipboard}
              className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 