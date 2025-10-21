"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Holding {
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_image_url: string | null;
  token_amount: string;
  value_usd: string;
  price_usd: string;
}

interface PositionData {
  solBalance: number;
  totalValue: number;
  holdings: Holding[];
}

interface ModelPositionsProps {
  agentId: string;
}

export function ModelPositions({ agentId }: ModelPositionsProps) {
  const [positions, setPositions] = useState<PositionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPositions();
  }, [agentId]);

  const fetchPositions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/models/${agentId}/positions`);
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error fetching model positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading positions...</p>
      </div>
    );
  }

  if (!positions) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No position data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Portfolio Value</div>
          <div className="text-2xl font-bold text-foreground">
            ${positions.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="border-2 border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">SOL Balance</div>
          <div className="text-2xl font-bold text-foreground">
            {positions.solBalance.toFixed(4)} SOL
          </div>
        </div>

        <div className="border-2 border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Active Positions</div>
          <div className="text-2xl font-bold text-foreground">
            {positions.holdings.length}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      {positions.holdings.length > 0 ? (
        <div className="border-2 border-border bg-background">
          <div className="border-b-2 border-border bg-card px-4 py-3">
            <h2 className="text-sm font-bold text-foreground">Current Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Token</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-foreground">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-foreground">Price (USD)</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-foreground">Value (USD)</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-foreground">% of Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {positions.holdings.map((holding) => {
                  const valueUsd = parseFloat(holding.value_usd);
                  const percentOfPortfolio = (valueUsd / positions.totalValue) * 100;

                  return (
                    <tr key={holding.token_address} className="border-b border-border hover:bg-muted transition-colors">
                      {/* Token */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {holding.token_image_url ? (
                            <Image
                              src={holding.token_image_url}
                              alt={holding.token_symbol}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {holding.token_symbol?.[0] || "?"}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-foreground">{holding.token_symbol}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {holding.token_name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-foreground">
                          {parseFloat(holding.token_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-foreground">
                          ${parseFloat(holding.price_usd).toFixed(6)}
                        </div>
                      </td>

                      {/* Value */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-bold text-foreground">
                          ${valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* % of Portfolio */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-foreground">
                          {percentOfPortfolio.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border-2 border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No active positions</p>
          <p className="text-xs text-muted-foreground mt-1">All holdings are in SOL</p>
        </div>
      )}
    </div>
  );
}
