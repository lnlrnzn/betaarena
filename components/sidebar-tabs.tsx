"use client";

import { useState } from "react";
import { LiveTrades } from "./live-trades";
import { Reasoning } from "./reasoning";
import { LiveTools } from "./live-tools";
import { LiveTweets } from "./live-tweets";
import { AGENTS } from "@/lib/constants";

type TabType = "trades" | "reasoning" | "tools" | "tweets";

interface SidebarTabsProps {
  trades: any[];
  decisions: any[];
  activities: any[];
  tweets: any[];
}

export function SidebarTabs({ trades, decisions, activities, tweets }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("trades");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  const tabs = [
    { id: "trades" as const, label: "Trades" },
    { id: "reasoning" as const, label: "Reasoning" },
    { id: "tools" as const, label: "Tools" },
    { id: "tweets" as const, label: "Tweets" },
  ];

  const agents = [
    { id: "all", name: "All Agents", shortName: "All Agents", color: "#888" },
    ...Object.values(AGENTS),
  ];

  return (
    <div className="h-full lg:border-l-2 border-border bg-background flex flex-col overflow-hidden">
      {/* Agent Filter */}
      <div className="flex-shrink-0 border-b-2 border-border bg-background px-3 md:px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">FILTER:</span>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="flex-1 text-xs bg-card text-foreground border-2 border-border px-2 py-1.5 font-bold hover:bg-muted transition-colors cursor-pointer"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.shortName} {agent.id !== "all" ? "▼" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Headers */}
      <div className="flex-shrink-0 border-b-2 border-border bg-card">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] px-3 md:px-4 py-3 text-xs font-bold border-r-2 border-border last:border-r-0 transition-colors whitespace-nowrap ${
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

      {/* Tab Content - Fixed height with internal scrolling */}
      <div className="flex-1 min-h-0 relative">
        {activeTab === "trades" && (
          <div className="absolute inset-0">
            <LiveTrades trades={trades} agentFilter={selectedAgent} />
          </div>
        )}
        {activeTab === "reasoning" && (
          <div className="absolute inset-0">
            <Reasoning decisions={decisions} agentFilter={selectedAgent} />
          </div>
        )}
        {activeTab === "tools" && (
          <div className="absolute inset-0">
            <LiveTools activities={activities} agentFilter={selectedAgent} />
          </div>
        )}
        {activeTab === "tweets" && (
          <div className="absolute inset-0">
            <LiveTweets initialTweets={tweets} />
          </div>
        )}
      </div>
    </div>
  );
}
