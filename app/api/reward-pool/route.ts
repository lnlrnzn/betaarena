import { NextResponse } from 'next/server';

export const revalidate = 60; // Cache for 60 seconds

const CREATOR_WALLET = '4pLUTKjdPA8uXWkHw9Fv4Svg6Heyd16ns5ibp4U1iG89';

export async function GET() {
  try {
    // Fetch wallet data from Solanatracker API
    const response = await fetch(
      `https://data.solanatracker.io/wallet/${CREATOR_WALLET}`,
      {
        headers: {
          'x-api-key': process.env.SOLANATRACKER_API_KEY || '',
        },
        cache: 'no-store', // Disable caching for testing
      }
    );

    if (!response.ok) {
      throw new Error(`Solanatracker API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('Solanatracker API response:', {
      totalSol: data.totalSol,
      total: data.total,
    });

    // Get SOL balance from the wallet
    const solBalance = data.totalSol || 0;

    // Calculate 40% for rewards
    const rewardsSol = solBalance * 0.4;

    // Calculate SOL price from total USD value and SOL balance
    const solPrice = solBalance > 0 ? (data.total || 0) / solBalance : 0;
    const rewardsUsd = rewardsSol * solPrice;

    console.log('Calculated values:', {
      solBalance,
      rewardsSol,
      solPrice,
      rewardsUsd,
    });

    return NextResponse.json({
      sol: rewardsSol,
      usd: rewardsUsd,
      solPrice: solPrice,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching reward pool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reward pool', message: error.message },
      { status: 500 }
    );
  }
}
