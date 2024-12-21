import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use Birdeye API with correct endpoint and headers
    const birdeyeResponse = await fetch('https://public-api.birdeye.so/defi/v3/token/market-data?address=25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH', {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
        'Accept': 'application/json',
        'x-chain': 'solana'
      }
    });

    if (birdeyeResponse.ok) {
      const data = await birdeyeResponse.json();
      if (data.success) {
        return NextResponse.json({
          price: data.data?.price || 0,
          change24h: data.data?.priceChange24h || 0
        });
      }
    }

    // Fallback to Raydium API
    const raydiumResponse = await fetch('https://api.raydium.io/v2/main/price');
    if (!raydiumResponse.ok) throw new Error('Raydium API failed');

    const raydiumData = await raydiumResponse.json();
    return NextResponse.json({
      price: raydiumData['25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH'] || 0,
      change24h: 0
    });

  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json({
      price: 0,
      change24h: 0
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 