import { useQuery } from '@tanstack/react-query';

interface TokenPrice {
  price: number;
  change24h: number;
}

const SOBA_TOKEN_ADDRESS = "25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH";

export default function SobaTickerBadge() {
  const { data: tokenPrice, isLoading } = useQuery<TokenPrice>({
    queryKey: ['tokenPrice'],
    queryFn: async () => {
      const response = await fetch(
        `https://data.solanatracker.io/price?token=${SOBA_TOKEN_ADDRESS}&priceChanges=true`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_SOLANA_TRACKER_API_KEY || '',
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch price');
      const data = await response.json();
      
      return {
        price: data.price || 0,
        change24h: data.priceChanges?.['24h'] || 0
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    initialData: { price: 0, change24h: 0 }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse bg-[#2a2a2a] rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
        Loading...
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  }).format(tokenPrice.price);

  const changeColor = tokenPrice.change24h >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-[#2a2a2a] rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 flex items-center space-x-2 sm:space-x-3 border border-[#ff6b00]/10">
      <span className="text-xs sm:text-sm font-medium text-white">$SOBA</span>
      <span className="text-xs sm:text-sm text-gray-300">{formattedPrice}</span>
      <span className={`text-xs sm:text-sm ${changeColor}`}>
        {tokenPrice.change24h >= 0 ? '+' : ''}{tokenPrice.change24h.toFixed(2)}%
      </span>
    </div>
  );
} 