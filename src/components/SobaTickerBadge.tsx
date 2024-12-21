import { useQuery } from '@tanstack/react-query';

interface TokenPrice {
  price: number;
  change24h: number;
}

export default function SobaTickerBadge() {
  const { data: tokenPrice, isLoading } = useQuery<TokenPrice>({
    queryKey: ['tokenPrice'],
    queryFn: async () => {
      const response = await fetch('/api/token-price');
      if (!response.ok) throw new Error('Failed to fetch price');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    initialData: { price: 0, change24h: 0 }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-800 rounded px-3 py-1">
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
    <div className="bg-gray-800 rounded px-3 py-1 flex items-center space-x-2">
      <span>{formattedPrice}</span>
      <span className={changeColor}>
        {tokenPrice.change24h >= 0 ? '+' : ''}{tokenPrice.change24h.toFixed(2)}%
      </span>
    </div>
  );
} 