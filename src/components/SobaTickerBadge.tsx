import { useState, useEffect } from 'react';

interface TokenPrice {
  price: number;
  change24h: number;
}

export default function SobaTickerBadge() {
  const [priceData, setPriceData] = useState<TokenPrice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrice = async () => {
    try {
      // Replace with your actual price API endpoint
      const response = await fetch('https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH&vs_currencies=usd&include_24hr_change=true');
      const data = await response.json();
      const tokenData = data['25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH'];
      
      setPriceData({
        price: tokenData.usd,
        change24h: tokenData.usd_24h_change
      });
    } catch (error) {
      console.error('Error fetching price:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a 
        href="https://jup.ag/swap/SOL-soba"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#1a1a1a] border border-[#ff6b00]/20 rounded-full px-4 py-2 hover:bg-[#2a2a2a] transition-all group"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[#ff6b00] font-bold">$SOBA</span>
        {loading ? (
          <span className="text-white animate-pulse">Loading...</span>
        ) : (
          <>
            <span className="text-white">${priceData?.price.toFixed(4)}</span>
            <span className={`text-sm ${priceData?.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceData?.change24h >= 0 ? '+' : ''}{priceData?.change24h.toFixed(1)}%
            </span>
          </>
        )}
        <svg className="w-4 h-4 text-[#ff6b00] group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </a>
    </div>
  );
} 