import { useQuery } from '@tanstack/react-query';

interface TokenPrice {
  price: number;
  change24h: number;
}

export default function SobaTickerBadge() {
  const { data: tokenPrice, isLoading } = useQuery<TokenPrice>({
    queryKey: ['tokenPrice'],
    queryFn: async () => {
      const response = await fetch(
        'https://public-api.birdeye.so/defi/v3/token/market-data?address=25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH',
        {
          method: 'GET',
          headers: {
            'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
            'accept': 'application/json',
            'x-chain': 'solana'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch price');
      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          price: data.data.price || 0,
          change24h: data.data.priceChange24h || 0
        };
      }
      
      throw new Error('Invalid data format');
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    initialData: { price: 0, change24h: 0 }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse bg-[#2a2a2a] rounded-lg px-4 py-2 text-sm">
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
    <div className="bg-[#2a2a2a] rounded-lg px-4 py-2 flex items-center space-x-3 border border-[#ff6b00]/10">
      <span className="text-sm font-medium text-white">$SOBA</span>
      <span className="text-sm text-gray-300">{formattedPrice}</span>
      <span className={`text-sm ${changeColor}`}>
        {tokenPrice.change24h >= 0 ? '+' : ''}{tokenPrice.change24h.toFixed(2)}%
      </span>
    </div>
  );
} 