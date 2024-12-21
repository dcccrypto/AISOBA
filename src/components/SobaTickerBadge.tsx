import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TokenPrice {
  price: number;
  change24h: number;
}

async function fetchTokenPrice(): Promise<TokenPrice> {
  try {
    // Jupiter API for more reliable price data
    const response = await fetch('https://price.jup.ag/v4/price?ids=soba');
    const data = await response.json();
    
    if (!data.data.soba) {
      throw new Error('Price data not available');
    }

    // Calculate 24h change using Jupiter's data
    const price = data.data.soba.price;
    
    // Fallback to coingecko for 24h change
    const cgResponse = await fetch('https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH&vs_currencies=usd&include_24hr_change=true');
    const cgData = await cgResponse.json();
    const change24h = cgData['25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH']?.usd_24h_change || 0;

    return {
      price,
      change24h
    };
  } catch (error) {
    console.error('Error fetching price:', error);
    return {
      price: 0,
      change24h: 0
    };
  }
}

export default function SobaTickerBadge() {
  const { data: priceData, isLoading } = useQuery({
    queryKey: ['sobaPrice'],
    queryFn: fetchTokenPrice,
    refetchInterval: 30000, // Refetch every 30 seconds
    initialData: { price: 0, change24h: 0 }
  });

  const formatPrice = (price: number) => {
    if (price < 0.0001) return '<$0.0001';
    return `$${price.toFixed(4)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

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
        {isLoading ? (
          <span className="text-white animate-pulse">Loading...</span>
        ) : (
          <>
            <span className="text-white">
              {formatPrice(priceData.price)}
            </span>
            <span className={`text-sm ${priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatChange(priceData.change24h)}
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