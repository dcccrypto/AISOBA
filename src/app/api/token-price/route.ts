import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use Birdeye API with correct endpoint
    const birdeyeResponse = await fetch('https://api.birdeye.so/v2/token/25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH/price', {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
        'Accept': 'application/json',
      }
    });

    if (birdeyeResponse.ok) {
      const data = await birdeyeResponse.json();
      return NextResponse.json({
        price: data.data?.price || 0,
        change24h: data.data?.priceChange24h || 0
      });
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