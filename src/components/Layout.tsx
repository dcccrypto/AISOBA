import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import RewardsNotification from './RewardsNotification';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="bg-gradient-to-r from-[#ff6b00] to-[#ff8533] text-white">
        <div className="responsive-container py-2">
          <a 
            href="https://solbastard.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span>🔥 Powered by Sol Bastard - Join the exclusive bastard community</span>
            <span className="flex items-center gap-1">
              Learn more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>
      </div>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CookieConsent />
      <RewardsNotification />
    </div>
  );
} 