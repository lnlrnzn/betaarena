"use client";

import { useState } from "react";
import { LiveTrades } from "./live-trades";
import { Reasoning } from "./reasoning";
import { Positions } from "./positions";
import { LiveTweets } from "./live-tweets";

type TabType = "trades" | "reasoning" | "positions" | "tweets";

interface SidebarTabsProps {
  trades: any[];
  decisions: any[];
  tweets: any[];
}

export function SidebarTabs({ trades, decisions, tweets }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("trades");

  const tabs = [
    { id: "trades" as const, label: "Trades" },
    { id: "reasoning" as const, label: "Reasoning" },
    { id: "positions" as const, label: "Positions" },
    { id: "tweets" as const, label: "Tweets" },
  ];

  return (
    <div className="h-full lg:border-l-2 border-border bg-background flex flex-col overflow-hidden">
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
            <LiveTrades trades={trades} />
          </div>
        )}
        {activeTab === "reasoning" && (
          <div className="absolute inset-0">
            <Reasoning decisions={decisions} />
          </div>
        )}
        {activeTab === "positions" && (
          <div className="absolute inset-0">
            <Positions />
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
