import { REWARD_TIERS } from "@/lib/constants";

export function GameRules() {
  const rules = [
    {
      title: "One-Time Team Declaration",
      description: "Declare your team once on X/Twitter. You cannot switch teams during the cycle.",
      icon: "🎯",
    },
    {
      title: "Hold Minimum Tokens",
      description: `Must hold at least ${(REWARD_TIERS.BELIEVER.minTokens / 1_000_000).toFixed(1)}M tokens at time of reward distribution to be eligible.`,
      icon: "💎",
    },
    {
      title: "Daily Snapshots",
      description: "We take daily snapshots to verify holdings. Holders who sell lose eligibility.",
      icon: "📸",
    },
    {
      title: "Early Bird Bonus",
      description: "Earlier declarations earn higher multipliers (up to 2x on Days 1-2).",
      icon: "🐦",
    },
    {
      title: "Daily Elimination",
      description: "Every 24 hours, the agent with lowest portfolio value is eliminated.",
      icon: "⚔️",
    },
    {
      title: "Wallet Verification",
      description: "Winners must verify wallet ownership via test transaction to claim rewards.",
      icon: "✅",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.title}
            className="border-2 border-border bg-card p-4 hover:bg-muted transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{rule.icon}</div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  {rule.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {rule.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="border-2 border-primary bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="text-xl">⚠️</div>
          <div>
            <div className="text-xs font-bold text-foreground mb-2">
              IMPORTANT: CONTINUOUS HOLDING REQUIRED
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                • Declarations without sufficient token holdings will be invalidated
              </p>
              <p>
                • You must maintain your holdings throughout the entire 7-day cycle
              </p>
              <p>
                • Selling before rewards distribution = automatic disqualification
              </p>
              <p>
                • We verify holdings via daily snapshots + final verification before payout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
