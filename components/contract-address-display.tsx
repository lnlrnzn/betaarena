"use client";

import { useState } from "react";
import { TLM_TOKEN } from "@/lib/constants";

export function ContractAddressDisplay() {
  const [copied, setCopied] = useState(false);

  const contractAddress = TLM_TOKEN.contractAddress || "NOT YET DEPLOYED";
  const isDeployed = TLM_TOKEN.contractAddress !== null;

  const handleCopy = async () => {
    if (!isDeployed) return;

    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="border-4 border-primary bg-card p-6">
      <div className="text-center space-y-4">
        <div className="text-xs font-bold text-muted-foreground">
          CONTRACT ADDRESS
        </div>

        <div className="relative">
          <div
            className={`font-mono text-base md:text-xl font-bold px-4 py-3 border-2 border-border ${
              isDeployed
                ? "bg-background text-foreground cursor-pointer hover:bg-muted"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            } transition-colors break-all`}
            onClick={handleCopy}
          >
            {contractAddress}
          </div>
          {copied && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
              COPIED!
            </div>
          )}
        </div>

        {isDeployed ? (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <a
              href={`https://pump.fun/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border-2 border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground font-bold transition-colors"
            >
              PUMP.FUN →
            </a>
            <a
              href={`https://dexscreener.com/solana/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border-2 border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground font-bold transition-colors"
            >
              DEXSCREENER →
            </a>
            <a
              href={`https://birdeye.so/token/${contractAddress}?chain=solana`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border-2 border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground font-bold transition-colors"
            >
              BIRDEYE →
            </a>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Token will be deployed on Pump.fun before Season 1 starts
          </div>
        )}

        <div className="pt-4 border-t-2 border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Symbol</div>
              <div className="text-sm font-bold text-foreground">{TLM_TOKEN.symbol}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Supply</div>
              <div className="text-sm font-bold text-foreground">
                {(TLM_TOKEN.totalSupply / 1_000_000_000).toFixed(0)}B
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Network</div>
              <div className="text-sm font-bold text-foreground">Solana</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Decimals</div>
              <div className="text-sm font-bold text-foreground">{TLM_TOKEN.decimals}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
