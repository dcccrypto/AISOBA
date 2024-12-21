import Link from 'next/link';
import SobaTickerBadge from './SobaTickerBadge';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[#ff6b00]/10">
      <div className="responsive-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="SOBA Verse Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
                SOBA Verse
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Create unique AI-generated SOBA chimpanzee PFPs and join the elite bastard community.
            </p>
            <div className="flex space-x-4">
              <SobaTickerBadge />
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#create" className="text-gray-400 hover:text-[#ff6b00] transition-colors text-sm">
                  Create PFP
                </a>
              </li>
              <li>
                <a href="https://jup.ag/swap/SOL-soba" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff6b00] transition-colors text-sm">
                  Get $SOBA
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="text-gray-400 hover:text-[#ff6b00] transition-colors text-sm">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Community</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://solbastard.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff6b00] transition-colors text-sm">
                  Sol Bastard
                </a>
              </li>
              <li>
                <a href="https://discord.gg/sobaverse" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff6b00] transition-colors text-sm">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://twitter.com/sobaverse" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff6b00] transition-colors text-sm">
                  Twitter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="/terms" className="text-gray-400 hover:text-[#ff6b00] transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-[#ff6b00] transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#ff6b00]/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SOBA Verse. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Powered by <a href="https://solbastard.com" target="_blank" rel="noopener noreferrer" className="text-[#ff6b00] hover:text-[#ff8533] transition-colors">Sol Bastard</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 