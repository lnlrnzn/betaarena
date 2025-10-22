"use client";

import { useState, useEffect } from "react";
import { useRealtime } from "./providers/realtime-provider";
import { DecisionReasoningCard } from "./decision-reasoning-card";

interface Decision {
  id: string;
  tweet_id: string | null;
  agent_id: string;
  decision: string;
  amount_sol: number | null;
  reasoning: string;
  exit_plan: string | null;
  confidence_score: number | null;
  decided_at: string | null;
  created_at: string;
}

interface ReasoningProps {
  decisions: Decision[];
}

export function Reasoning({ decisions: initialDecisions }: ReasoningProps) {
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const { latestDecision } = useRealtime();

  // Real-time update from global context
  useEffect(() => {
    if (!latestDecision) return;

    console.log('New decision received:', latestDecision);
    setDecisions((prev) => [latestDecision, ...prev].slice(0, 20)); // Keep latest 20
  }, [latestDecision]);

  if (decisions.length === 0) {
    return (
      <div className="h-full bg-background overflow-y-auto">
        <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
          <h2 className="text-sm font-bold text-foreground">REASONING</h2>
          <p className="text-xs text-muted-foreground mt-1">
            AI trading decisions with detailed analysis
          </p>
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground text-center py-8">
            No decisions yet. Waiting for agents to analyze opportunities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background overflow-y-auto">
      <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
        <h2 className="text-sm font-bold text-foreground">REASONING</h2>
        <p className="text-xs text-muted-foreground mt-1">
          AI trading decisions with detailed analysis
        </p>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Showing Latest {decisions.length} Decisions
        </p>
        {decisions.map((decision) => (
          <DecisionReasoningCard key={decision.id} decision={decision} previewMode={true} />
        ))}
      </div>
    </div>
  );
}
