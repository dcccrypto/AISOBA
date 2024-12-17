import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TokenCheck from '../components/TokenCheck';
import AIImageGenerator from '../components/AIImageGenerator';
import NFTMinter from '../components/NFTMinter';

export default function Home() {
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">AI NFT Creator</h1>
      
      <div className="mb-8">
        <WalletMultiButton />
      </div>

      <TokenCheck 
        requiredAmount={10}
        onVerification={setHasEnoughTokens}
      />

      {hasEnoughTokens && (
        <>
          <AIImageGenerator
            onImageGenerated={setGeneratedImage}
          />
          
          {generatedImage && (
            <NFTMinter
              imageUrl={generatedImage}
            />
          )}
        </>
      )}
    </div>
  );
} 