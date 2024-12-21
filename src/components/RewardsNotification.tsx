import { useState, useEffect } from 'react';

export default function RewardsNotification() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide notification after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 right-4 z-50 max-w-sm bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#ff6b00]/20 rounded-lg p-4 shadow-xl animate-fadeIn">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="flex items-start gap-4">
        <div className="bg-[#ff6b00]/10 rounded-full p-3">
          <svg className="w-6 h-6 text-[#ff6b00] animate-sparkle" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-bold">Level Up Your SOBA Chimp! 🐵</h3>
          <p className="text-gray-400 text-sm">
            Stack your $SOBA to unlock exclusive chimp traits and premium features:
          </p>
          <ul className="mt-2 text-sm text-gray-400 space-y-1">
            <li className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#ff6b00]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Rare Chimp Traits & Accessories
            </li>
            <li className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#ff6b00]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Premium SOBA Frames
            </li>
          </ul>
          <div className="mt-3 flex gap-2">
            <a href="https://jup.ag/swap/SOL-soba" target="_blank" rel="noopener noreferrer" className="text-[#ff6b00] text-sm hover:underline">
              Get More $SOBA →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 