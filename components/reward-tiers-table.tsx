import { REWARD_TIERS, DECLARATION_MULTIPLIERS } from "@/lib/constants";

export function RewardTiersTable() {
  const tiers = Object.values(REWARD_TIERS);
  const multipliers = Object.values(DECLARATION_MULTIPLIERS);

  return (
    <div className="space-y-6">
      {/* Tiers Table */}
      <div className="border-2 border-border bg-background overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-bold text-foreground">
                TIER
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-foreground">
                TOKEN REQUIREMENT
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-foreground">
                POOL SHARE
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr
                key={tier.name}
                className={`border-b border-border ${
                  index === 0 ? "bg-primary/10" : "hover:bg-muted"
                } transition-colors`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="text-xl">👑</span>
                    )}
                    <span className="text-sm font-bold text-foreground">
                      {tier.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">
                    {tier.minTokens.toLocaleString()}+ tokens
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tier.description}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {(tier.poolShare * 100).toFixed(0)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Early Bird Multipliers */}
      <div className="border-2 border-border bg-card p-6">
        <h3 className="text-sm font-bold text-foreground mb-4">
          EARLY BIRD MULTIPLIERS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {multipliers.map((mult) => (
            <div
              key={mult.label}
              className="border-2 border-border bg-background p-4 text-center"
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {mult.multiplier}x
              </div>
              <div className="text-xs font-bold text-foreground mb-1">
                {mult.label}
              </div>
              <div className="text-xs text-muted-foreground">
                Day{mult.days.length > 1 ? "s" : ""} {mult.days.join("-")}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Declare your team early to maximize your reward multiplier
        </div>
      </div>

      {/* Distribution Explanation */}
      <div className="border-2 border-primary bg-primary/5 p-4">
        <div className="text-xs font-bold text-foreground mb-2">
          ℹ️ HOW DISTRIBUTION WORKS
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Each tier splits its pool share proportionally by token holdings</p>
          <p>• Example: 3 Mega Whales with 15M, 20M, 25M tokens split the 50% pool as 25%, 33.3%, 41.7%</p>
          <p>• Early declaration multiplier is applied to your final reward</p>
          <p>• Daily snapshots verify holdings throughout the 7-day cycle</p>
        </div>
      </div>
    </div>
  );
}
