import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  // Add CORS headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Use Birdeye API with correct endpoint
    const birdeyeResponse = await fetch('https://api.birdeye.so/v2/token/25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH/price', {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
        'Accept': 'application/json',
      },
      // Add cache control
      next: { revalidate: 30 } // Revalidate every 30 seconds
    });

    if (birdeyeResponse.ok) {
      const data = await birdeyeResponse.json();
      return NextResponse.json({
        price: data.data?.price || 0,
        change24h: data.data?.priceChange24h || 0
      }, { headers: response.headers });
    }

    // Fallback to Raydium API
    const raydiumResponse = await fetch('https://api.raydium.io/v2/main/price');
    if (!raydiumResponse.ok) throw new Error('Raydium API failed');

    const raydiumData = await raydiumResponse.json();
    return NextResponse.json({
      price: raydiumData['25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH'] || 0,
      change24h: 0
    }, { headers: response.headers });

  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json({
      price: 0,
      change24h: 0
    }, { headers: response.headers });
  }
} 