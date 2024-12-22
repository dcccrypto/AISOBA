import { NextResponse } from 'next/server';

const SOBA_TOKEN_ADDRESS = "25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH";

export async function GET() {
  try {
    if (!process.env.SOLANA_TRACKER_API_KEY) {
      console.warn('SOLANA_TRACKER_API_KEY not set');
      return NextResponse.json({
        price: 0,
        change24h: 0,
        volume24h: 0,
      });
    }

    const response = await fetch(
      `https://data.solanatracker.io/price?token=${SOBA_TOKEN_ADDRESS}&priceChanges=true`,
      {
        headers: {
          'Accept': 'application/json',
          'x-api-key': process.env.SOLANA_TRACKER_API_KEY,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`Solana Tracker API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      price: data.price || 0,
      change24h: data.priceChanges?.['24h'] || 0,
      volume24h: data.volume24h || 0,
    });
  } catch (error) {
    console.error('Error fetching token price:', error);
    return NextResponse.json({
      price: 0,
      change24h: 0,
      volume24h: 0,
    });
  }
} 