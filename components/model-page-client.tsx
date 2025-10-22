"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Agent } from "@/lib/constants";
import { ModelOverview } from "./model-overview";
import { ModelTrades } from "./model-trades";
import { ModelDecisions } from "./model-decisions";
import { ModelPositions } from "./model-positions";
import { ModelTeam } from "./model-team";

type TabType = "overview" | "trades" | "decisions" | "positions" | "team";

interface ModelPageClientProps {
  agent: Agent;
  modelData: {
    stats: any;
    trades: any[];
    decisions: any[];
    positions: any;
    teamStats: any;
    teamMembers: any[];
  };
}

export function ModelPageClient({ agent, modelData }: ModelPageClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;

  // Set initial tab based on URL parameter or default to overview
  const [activeTab, setActiveTab] = useState<TabType>(
    (tabParam && ["overview", "trades", "decisions", "positions", "team"].includes(tabParam))
      ? tabParam
      : "overview"
  );

  // Update tab when URL parameter changes
  useEffect(() => {
    if (tabParam && ["overview", "trades", "decisions", "positions", "team"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "trades" as const, label: "Trades" },
    { id: "decisions" as const, label: "Decisions" },
    { id: "positions" as const, label: "Positions" },
    { id: "team" as const, label: "Team" },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="border-b-2 border-border bg-card">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="px-4 md:px-6 flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold border-r-2 border-border transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="flex-1 px-4 md:px-6 py-6">
        {activeTab === "overview" && <ModelOverview stats={modelData.stats} />}
        {activeTab === "trades" && <ModelTrades trades={modelData.trades} agentId={agent.id} />}
        {activeTab === "decisions" && <ModelDecisions decisions={modelData.decisions} agentId={agent.id} />}
        {activeTab === "positions" && <ModelPositions positions={modelData.positions} />}
        {activeTab === "team" && (
          <ModelTeam
            agentId={agent.id}
            agent={agent}
            initialStats={modelData.teamStats}
            initialMembers={modelData.teamMembers}
          />
        )}
      </main>
    </>
  );
}
