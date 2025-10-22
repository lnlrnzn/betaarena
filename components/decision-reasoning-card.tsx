"use client";

import { useRouter } from "next/navigation";
import { AGENTS } from "@/lib/constants";

interface DecisionData {
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

interface DecisionReasoningCardProps {
  decision: DecisionData;
  previewMode?: boolean; // If true, show only 2 lines and make clickable
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

function extractPreview(reasoning: string, lines: number = 2): string {
  const allLines = reasoning.split('\n');
  const preview = allLines.slice(0, lines).join('\n');
  return preview;
}

export function DecisionReasoningCard({ decision, previewMode = false }: DecisionReasoningCardProps) {
  const router = useRouter();
  const agent = Object.values(AGENTS).find((a) => a.id === decision.agent_id);
  const agentColor = agent?.color || "#666";
  const agentName = agent?.shortName || "Unknown";
  const agentModel = agent?.model || "unknown";

  // Decision card styling based on decision type
  const decisionStyles: Record<string, { badgeClass: string; borderClass: string; label: string }> = {
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

  const style = decisionStyles[decision.decision.toLowerCase()] || decisionStyles.pass;

  const handleClick = () => {
    if (previewMode) {
      router.push(`/models/${agentModel}?tab=decisions`);
    }
  };

  return (
    <div
      className={`border-2 ${style.borderClass} bg-card transition-shadow ${
        previewMode ? "cursor-pointer hover:shadow-md" : ""
      }`}
      onClick={handleClick}
    >
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
          {decision.amount_sol && (
            <span className="text-xs font-bold text-foreground truncate">
              {decision.amount_sol} SOL
            </span>
          )}
          {decision.confidence_score !== null && decision.confidence_score !== undefined && (
            <span className="text-xs text-muted-foreground">
              {(decision.confidence_score * 100).toFixed(0)}%
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {formatTimestamp(decision.decided_at || decision.created_at)}
        </span>
      </div>

      {/* Reasoning */}
      <div className="p-3">
        <div className="text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap break-words">
          {previewMode ? extractPreview(decision.reasoning) : decision.reasoning}
        </div>

        {previewMode && (
          <p className="mt-2 text-xs text-primary font-bold">
            Click to see full analysis →
          </p>
        )}

        {/* Exit Plan (full mode only) */}
        {!previewMode && decision.exit_plan && (
          <div className="mt-3 pt-3 border-t-2 border-border">
            <p className="text-xs font-bold text-foreground mb-1">Exit Plan:</p>
            <p className="text-xs text-foreground font-mono whitespace-pre-wrap break-words">
              {decision.exit_plan}
            </p>
          </div>
        )}

        {/* Tweet Link (full mode only) */}
        {!previewMode && decision.tweet_id && (
          <div className="mt-3 pt-3 border-t-2 border-border">
            <a
              href={`https://x.com/i/status/${decision.tweet_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline font-bold"
            >
              View Tweet →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
