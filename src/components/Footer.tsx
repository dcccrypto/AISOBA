import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[#ff6b00]/10">
      <div className="responsive-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
              SOBA Verse
            </h3>
            <p className="text-gray-400 text-sm">
              Create unique SOBA chimpanzee PFPs and join the elite bastard community on Solana.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com/sobaverse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#ff6b00] hover:text-[#ff8533] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="https://discord.gg/sobaverse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#ff6b00] hover:text-[#ff8533] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#create" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Create PFP
                </a>
              </li>
              <li>
                <a href="https://jup.ag/swap/SOL-soba" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Get $SOBA
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://solbastard.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Sol Bastard
                </a>
              </li>
              <li>
                <a href="https://discord.gg/sobaverse" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://twitter.com/sobaverse" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Twitter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terms" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-[#ff6b00] transition-colors">
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