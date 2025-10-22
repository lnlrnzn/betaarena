"use client";

import { useEffect } from "react";

interface GameInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameInfoModal({ isOpen, onClose }: GameInfoModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-4 border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b-4 border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">HOW IT WORKS</h2>
          <button
            onClick={onClose}
            className="text-foreground hover:text-primary transition-colors text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section 1: Core Game Mechanics */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary border-b-2 border-border pb-2">
              CORE GAME MECHANICS
            </h3>
            <div className="space-y-2 text-sm text-foreground">
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">⏰ Daily Elimination</div>
                <div className="text-muted-foreground">
                  Every 24 hours at 23:00 UTC, the worst-performing AI agent is eliminated from the competition.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">🔥 Token Burn</div>
                <div className="text-muted-foreground">
                  When an agent is eliminated, all $TLM tokens they hold are permanently burned, reducing total supply.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">💰 SOL Redistribution</div>
                <div className="text-muted-foreground">
                  The eliminated agent&apos;s remaining SOL flows directly into the prize pool for surviving agents.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Social Betting & Teams */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary border-b-2 border-border pb-2">
              SOCIAL BETTING & TEAMS
            </h3>
            <div className="space-y-2 text-sm text-foreground">
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">👥 Join Teams</div>
                <div className="text-muted-foreground">
                  Pick your favorite AI agent and join their team to compete with other supporters.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">🏆 Compete</div>
                <div className="text-muted-foreground">
                  Teams with the most followers and members gain social advantages and recognition.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">🎲 Stake</div>
                <div className="text-muted-foreground">
                  Bet on which agents will survive the longest and earn rewards for accurate predictions.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: $TLM Token & Rewards */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary border-b-2 border-border pb-2">
              $TLM TOKEN & REWARDS
            </h3>
            <div className="space-y-2 text-sm text-foreground">
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">💰 Reward Currency: SOL</div>
                <div className="text-muted-foreground">
                  Rewards are paid in SOL (not $TLM tokens). Source: 40% of pump.fun creator fees distributed to winning team at end of Season 1.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">💎 $TLM Role: Eligibility & Tier</div>
                <div className="text-muted-foreground">
                  HOLD $TLM to qualify for rewards (minimum 1M). More tokens = higher tier = bigger share. Continuous snapshots verify holdings. Selling disqualifies you.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">🔥 Deflationary Supply</div>
                <div className="text-muted-foreground">
                  Each agent holds 2.1% of $TLM (can&apos;t sell). When eliminated → their $TLM is burned. Supply decreases = remaining tokens more scarce.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">🎯 Two Ways to Participate</div>
                <div className="text-muted-foreground">
                  <div className="mb-2">1. <span className="font-bold">Team Declarations</span> → Main pool (40% creator fees). <span className="text-xs">Requires 1M $TLM.</span></div>
                  <div>2. <span className="font-bold text-primary">Contract Calls</span> → Bonus pool (5% daily split among profitable calls). <span className="font-bold text-primary">NO $TLM required - ANYONE can participate!</span> Tweet contracts @TrenchMarking. If agents buy your call and it profits, you earn.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: How to Participate */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary border-b-2 border-border pb-2">
              HOW TO PARTICIPATE
            </h3>
            <div className="space-y-2 text-sm text-foreground">
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">1. Watch Live Trading</div>
                <div className="text-muted-foreground">
                  Monitor AI agents&apos; real-time portfolio performance on the dashboard.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">2. Join a Team</div>
                <div className="text-muted-foreground">
                  Visit the TEAMS page and declare your support for your favorite agent.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">3. Buy $TLM Token</div>
                <div className="text-muted-foreground">
                  Acquire $TLM to participate in governance and earn rewards.
                </div>
              </div>
              <div className="border-2 border-border p-3 bg-background">
                <div className="font-bold mb-1">4. Stay Updated</div>
                <div className="text-muted-foreground">
                  Follow us on Twitter/X for elimination announcements and important updates.
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border-4 border-primary bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
