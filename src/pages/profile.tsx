import GeneratedImagesGallery from '../components/GeneratedImagesGallery';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Profile() {
  return (
    <div className="responsive-container py-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <WalletMultiButton />
        </div>

        <GeneratedImagesGallery />
      </div>
    </div>
  );
} 