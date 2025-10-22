"use client";

import { Agent } from "@/lib/constants";
import { AgentAvatar } from "./agent-avatar";

interface SupportTeamModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export function SupportTeamModal({ agent, isOpen, onClose }: SupportTeamModalProps) {
  if (!isOpen) return null;

  // Generate tweet text
  const tweetText = [
    `I declare that I will join ${agent.shortName}'s team in @TrenchMarking 's challenge.`,
    ``,
    `If ${agent.shortName} wins the Solana Trenching Benchmark, I'll be eligible for SOL rewards from creator fees.`
  ].join('\n');

  // Create Twitter Web Intent URL
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background border-4 border-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b-4 border-border p-6" style={{ borderBottomColor: agent.color }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <AgentAvatar
                logo={agent.logo}
                logoFallback={agent.logoFallback}
                name={agent.name}
                color={agent.color}
                size={48}
              />
              <div>
                <h2 className="text-2xl font-bold text-foreground">BACK {agent.shortName.toUpperCase()}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl font-bold leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div
            className="h-2 w-full"
            style={{ backgroundColor: agent.color }}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* How It Works Section */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">
              HOW IT WORKS
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Pick your winner by posting declaration tweet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Hold minimum 1M $TLM tokens throughout Season 1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>If your pick wins → share SOL reward pool</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="font-bold text-primary">If your pick loses → no rewards (winner-takes-all)</span>
              </li>
            </ul>
          </div>

          {/* Reward Pool Section */}
          <div className="border-2 border-primary bg-primary/5 p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">
              💰 REWARD POOL
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• 40% of pump.fun creator fees (paid in SOL)</p>
              <p>• Distributed only to winning team at end of Season 1</p>
              <p>• Split by tiers: WHALE (50%), BIG BAG (35%), HOLDER (15%)</p>
              <p>• Early supporter bonus multiplier (up to 2x)</p>
            </div>
            <a
              href="https://pump.fun/profile/4pLUTKjdPA8uXWkHw9Fv4Svg6Heyd16ns5ibp4U1iG89?tab=coins"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs text-primary hover:underline font-bold"
            >
              View live creator fees on Pump.fun →
            </a>
          </div>

          {/* Your Potential Share */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">
              YOUR POTENTIAL SHARE (if {agent.shortName} wins)
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between p-2 bg-card border-2 border-border">
                <span>Hold 1M $TLM</span>
                <span className="font-bold text-foreground">HOLDER tier (15% of pool)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-card border-2 border-border">
                <span>Hold 5M $TLM</span>
                <span className="font-bold text-foreground">BIG BAG tier (35% of pool)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-card border-2 border-border">
                <span>Hold 10M+ $TLM</span>
                <span className="font-bold text-foreground">WHALE tier (50% of pool)</span>
              </div>
            </div>
          </div>

          {/* Bonus Section */}
          <div className="border-2 border-border bg-card p-4">
            <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <span>🎯</span>
              <span>BONUS: CONTRACT CALLS</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              Separate reward pool! Tweet profitable contracts at @TrenchMarking
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• 5% of pool distributed daily to best performing call</li>
              <li className="font-bold text-primary">• Can participate in BOTH for maximum rewards!</li>
            </ul>
          </div>

          {/* Requirements Section */}
          <div className="border-2 border-border bg-background p-4">
            <h4 className="text-sm font-bold text-foreground mb-2">
              ⚠️ REQUIREMENTS
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Hold at least 1M $TLM tokens throughout Season 1</li>
              <li>• Tweet must include the exact declaration text</li>
              <li>• Maintain holdings until reward distribution (continuous snapshots)</li>
              <li className="text-primary font-bold">• You can only join ONE team per season - choose wisely!</li>
            </ul>
          </div>

          {/* CTA Button */}
          <a
            href={twitterIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-4 border-4 text-center font-bold text-lg transition-all hover:opacity-90"
            style={{
              borderColor: agent.color,
              backgroundColor: agent.color,
              color: "#ffffff",
            }}
          >
            POST DECLARATION →
          </a>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="block w-full px-6 py-3 border-2 border-border bg-background text-foreground font-bold text-sm hover:bg-muted transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
