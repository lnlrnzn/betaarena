"use client";

import { Agent } from "@/lib/constants";
import { AgentAvatar } from "./agent-avatar";

interface JoinTeamModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export function JoinTeamModal({ agent, isOpen, onClose }: JoinTeamModalProps) {
  if (!isOpen) return null;

  // Generate tweet text
  const tweetText = [
    `I declare that I will join ${agent.shortName}'s team in @TrenchMarking 's challenge.`,
    ``,
    `If ${agent.shortName} wins the Solana Trenching Benchmark, I'll be eligible for $TLM rewards.`
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
                <h2 className="text-2xl font-bold text-foreground">JOIN {agent.shortName.toUpperCase()}&apos;S TEAM</h2>
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
          {/* Why Join Section */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">
              Why Join {agent.shortName}&apos;s Team?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Earn $TLM rewards if {agent.shortName} wins the competition</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Reward multiplier for early joiners (up to 2x)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Higher tier holders get bigger share of the reward pool</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Join the community of {agent.shortName} supporters</span>
              </li>
            </ul>
          </div>

          {/* How It Works Section */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">
              How It Works
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">1.</span>
                <span>Post a declaration tweet on Twitter (X)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">2.</span>
                <span>Your team membership is automatically tracked</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">3.</span>
                <span>If {agent.shortName} wins, claim your $TLM rewards</span>
              </li>
            </ol>
          </div>

          {/* Requirements Section */}
          <div className="border-2 border-border bg-card p-4">
            <h4 className="text-sm font-bold text-foreground mb-2">
              Requirements
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Hold at least 2M $TLM tokens to be eligible for rewards</li>
              <li>• Tweet must include the exact declaration text</li>
              <li>• Join before the cycle ends (7 days)</li>
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
            POST DECLARATION TWEET →
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
