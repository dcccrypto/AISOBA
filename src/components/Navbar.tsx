import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#ff6b00]/10">
      <div className="responsive-container py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SOBA Verse Logo" className="h-6 sm:h-8 w-auto" />
            <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              SOBA Verse
            </span>
          </Link>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <WalletMultiButtonDynamic />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-[#ff6b00] transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
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

        {/* Mobile menu */}
        <div
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } flex-col space-y-4 pt-4 md:hidden border-t border-[#ff6b00]/10 mt-4`}
        >
          <Link
            href="/how-it-works"
            className="text-gray-300 hover:text-[#ff6b00] transition-colors px-2 py-1"
            onClick={() => setIsMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/gallery"
            className="text-gray-300 hover:text-[#ff6b00] transition-colors px-2 py-1"
            onClick={() => setIsMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link
            href="/profile"
            className="text-gray-300 hover:text-[#ff6b00] transition-colors px-2 py-1"
            onClick={() => setIsMenuOpen(false)}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
} 