import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function Navbar() {
  return (
    <nav className="bg-[#1a1a1a] border-b border-[#ff6b00]/10">
      <div className="responsive-container py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SOBA Verse Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              SOBA Verse
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/how-it-works" className="text-gray-300 hover:text-[#ff6b00] transition-colors">
              How It Works
            </Link>
            <Link href="/gallery" className="text-gray-300 hover:text-[#ff6b00] transition-colors">
              Gallery
            </Link>
            <Link href="/profile" className="text-gray-300 hover:text-[#ff6b00] transition-colors">
              Profile
            </Link>
            <WalletMultiButtonDynamic />
          </div>
        </div>
      </div>
    </nav>
  );
} 