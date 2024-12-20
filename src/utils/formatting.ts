/**
 * Truncates a blockchain address or long string to a shorter format
 * Example: "0x1234567890123456789012345678901234567890" -> "0x1234...7890"
 */
export function truncateAddress(address: string, startLength: number = 4, endLength: number = 4): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
} 