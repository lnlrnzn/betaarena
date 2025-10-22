"use client";

import { useState } from "react";
import Link from "next/link";
import { AGENTS } from "@/lib/constants";
import { AgentAvatar } from "./agent-avatar";

interface ModelsDropdownProps {
  agentStats?: Array<{
    agent_id: string;
    currentValue: number;
    changePercent: number;
  }>;
}

export function ModelsDropdown({ agentStats = [] }: ModelsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get rank for each agent
  const rankedAgents = [...agentStats].sort((a, b) => b.currentValue - a.currentValue);

  const getRank = (agentId: string) => {
    const index = rankedAgents.findIndex((a) => a.agent_id === agentId);
    return index >= 0 ? index + 1 : null;
  };

  const models = Object.values(AGENTS).map((agent) => ({
    ...agent,
    rank: getRank(agent.id),
  }));

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger */}
      <button
        className="px-3 md:px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
      >
        MODELS ▼
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-0 w-64 bg-card border-2 border-border shadow-lg z-50">
          <div className="border-b-2 border-border px-3 py-2 bg-background">
            <span className="text-xs font-bold text-foreground">SELECT MODEL</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {models.map((model) => (
              <Link
                key={model.id}
                href={`/models/${model.model}`}
                className="flex items-center gap-3 px-3 py-2 border-b border-border hover:bg-muted transition-colors"
              >
                <AgentAvatar
                  logo={model.logo}
                  logoFallback={model.logoFallback}
                  name={model.name}
                  color={model.color}
                  size={32}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">
                    {model.shortName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {model.model}
                  </div>
                </div>
                {model.rank && (
                  <div className="flex-shrink-0">
                    <div className="px-2 py-1 bg-primary text-primary-foreground border border-border text-xs font-bold">
                      #{model.rank}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
