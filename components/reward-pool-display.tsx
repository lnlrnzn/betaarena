'use client';

import { useEffect, useState } from 'react';

interface RewardPoolData {
  sol: number;
  usd: number;
  solPrice: number;
  timestamp: string;
}

export function RewardPoolDisplay() {
  const [poolData, setPoolData] = useState<RewardPoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPoolData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPoolData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPoolData = async () => {
    try {
      const response = await fetch('/api/reward-pool');
      if (!response.ok) throw new Error('Failed to fetch reward pool');
      const data = await response.json();
      setPoolData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="border-4 border-border bg-card p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-muted rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !poolData) {
    return (
      <div className="border-4 border-border bg-card p-4">
        <div className="text-sm text-muted-foreground">
          💰 Reward Pool unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="border-4 border-primary bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-muted-foreground mb-1">
            💰 TOTAL REWARD POOL
          </div>
          <div className="text-2xl md:text-3xl font-bold text-foreground">
            ${formatNumber(poolData.usd, 0)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatNumber(poolData.sol, 2)} SOL
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            SOL Price
          </div>
          <div className="text-lg font-bold text-primary">
            ${formatNumber(poolData.solPrice, 2)}
          </div>
        </div>
      </div>
    </div>
  );
}
