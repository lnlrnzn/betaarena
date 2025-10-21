"use client";

import { useState } from "react";
import { AGENTS } from "@/lib/constants";

interface DecisionData {
  decision: "buy" | "fade" | "pass" | "sell";
  reasoning: string;
  amount: string;
}

interface ActivityData {
  id: string;
  agent_id: string;
  activity_type: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface DecisionCardProps {
  activity: ActivityData;
}

function parseDecisionData(description: string): DecisionData | null {
  try {
    const parsed = JSON.parse(description);
    if (parsed.decision && parsed.reasoning) {
      return {
        decision: parsed.decision.toLowerCase(),
        reasoning: parsed.reasoning,
        amount: parsed.amount || "N/A",
      };
    }
  } catch {
    return null;
  }
  return null;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function extractPreview(reasoning: string, maxLength: number = 200): string {
  // Try to get first complete sentence or two
  const sentences = reasoning.match(/[^.!?]+[.!?]+/g) || [];
  let preview = sentences.slice(0, 2).join(' ');

  if (preview.length > maxLength) {
    preview = reasoning.substring(0, maxLength) + '...';
  }

  return preview || reasoning.substring(0, maxLength) + '...';
}

export function DecisionCard({ activity }: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const agent = Object.values(AGENTS).find((a) => a.id === activity.agent_id);
  const agentColor = agent?.color || "#666";
  const agentName = agent?.shortName || "Unknown";

  const decisionData = parseDecisionData(activity.description);

  // If not a decision (no JSON), show simple activity card
  if (!decisionData) {
    return (
      <div className="border-2 border-border bg-card p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div
            className="w-1 h-full border-2 border-border mt-1 flex-shrink-0"
            style={{ backgroundColor: agentColor }}
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground truncate">
                {agentName}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                {formatTimestamp(activity.timestamp)}
              </span>
            </div>
            <div className="text-xs text-foreground">
              <span className="font-mono bg-muted px-1 py-0.5 rounded truncate inline-block max-w-full">
                {activity.activity_type}
              </span>
            </div>
            <div className="text-xs text-foreground leading-relaxed break-words">
              {activity.description}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Decision card styling based on decision type
  const decisionStyles = {
    buy: {
      badgeClass: "bg-green-500 text-white",
      borderClass: "border-green-500",
      label: "BUY",
    },
    sell: {
      badgeClass: "bg-blue-500 text-white",
      borderClass: "border-blue-500",
      label: "SELL",
    },
    fade: {
      badgeClass: "bg-red-500 text-white",
      borderClass: "border-red-500",
      label: "FADE",
    },
    pass: {
      badgeClass: "bg-gray-500 text-white",
      borderClass: "border-gray-500",
      label: "PASS",
    },
  };

  const style = decisionStyles[decisionData.decision] || decisionStyles.pass;

  return (
    <div className={`border-2 ${style.borderClass} bg-card hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="p-3 border-b-2 border-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-1 h-8 border-2 border-border flex-shrink-0"
            style={{ backgroundColor: agentColor }}
          />
          <span className="text-xs font-bold text-foreground truncate max-w-[80px]">
            {agentName}
          </span>
          <span className={`px-2 py-1 text-xs font-bold border-2 border-border ${style.badgeClass} flex-shrink-0`}>
            {style.label}
          </span>
          <span className="text-xs font-bold text-foreground truncate">
            {decisionData.amount}
          </span>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {formatTimestamp(activity.timestamp)}
        </span>
      </div>

      {/* Reasoning */}
      <div className="p-3">
        <div className="text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap break-words overflow-hidden">
          {isExpanded ? decisionData.reasoning : extractPreview(decisionData.reasoning)}
        </div>

        {decisionData.reasoning.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs text-primary hover:underline font-bold"
          >
            {isExpanded ? "Show less ↑" : "Read full analysis →"}
          </button>
        )}
      </div>
    </div>
  );
}
