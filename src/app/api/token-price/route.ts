import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://public-api.birdeye.so/defi/v3/token/market-data?address=25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH',
      {
        headers: {
          'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Fallback to a default response if Birdeye fails
      return NextResponse.json({
        price: 0,
        change24h: 0,
        volume24h: 0,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching token price:', error);
    return NextResponse.json({
      price: 0,
      change24h: 0,
      volume24h: 0,
    });
  }
} 