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

interface ModelDecisionsProps {
  decisions: Decision[];
  agentId: string;
}

export function ModelDecisions({ decisions: initialDecisions, agentId }: ModelDecisionsProps) {
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const { latestDecision } = useRealtime();

  // Real-time update from global context (filter for this agent only)
  useEffect(() => {
    if (!latestDecision) return;
    if (latestDecision.agent_id !== agentId) return; // Filter for this agent

    console.log('Decision update received:', latestDecision);
    setDecisions((prev) => [latestDecision, ...prev].slice(0, 100)); // Keep latest 100
  }, [latestDecision, agentId]);

  if (decisions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No decisions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-border bg-card px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">Decision Timeline</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Detailed reasoning and analysis for each trading decision made by this model
        </p>
      </div>

      <div className="space-y-3">
        {decisions.map((decision) => (
          <DecisionReasoningCard key={decision.id} decision={decision} previewMode={false} />
        ))}
      </div>
    </div>
  );
}
