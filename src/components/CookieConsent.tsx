import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#ff6b00]/10 p-4 z-50">
      <div className="responsive-container flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-gray-400 mb-4 md:mb-0">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
          <Link href="/cookies" className="text-[#ff6b00] hover:underline">
            Learn more
          </Link>
        </p>
        <div className="flex space-x-4">
          <button
            onClick={acceptCookies}
            className="btn-primary text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
} 