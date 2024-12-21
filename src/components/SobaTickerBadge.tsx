import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TokenPrice {
  price: number;
  change24h: number;
}

async function fetchTokenPrice(): Promise<TokenPrice> {
  try {
    const response = await fetch('/api/token-price');
    
    if (!response.ok) throw new Error('Failed to fetch price');
    
    const data = await response.json();
    return {
      price: data.price || 0,
      change24h: data.change24h || 0
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
    refetchInterval: 30000,
    initialData: { price: 0, change24h: 0 },
    retry: 2,
    staleTime: 15000,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const formatPrice = (price: number) => {
    if (price < 0.0001) return '<$0.0001';
    return `$${price.toFixed(4)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="inline-block">
      <a
        href="https://jup.ag/swap/soba-SOL"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-[#ff6b00]/10 hover:border-[#ff6b00]/20 transition-colors group"
      >
        {isLoading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          <>
            <span className="font-medium text-white">
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