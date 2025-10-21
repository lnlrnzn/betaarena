"use client";

import { useState } from "react";
import { LiveTrades } from "./live-trades";
import { ModelChat } from "./model-chat";
import { Positions } from "./positions";
import { ReadmeText } from "./readme-text";

type TabType = "trades" | "modelchat" | "positions" | "readme";

interface SidebarTabsProps {
  trades: any[];
  activities: any[];
}

export function SidebarTabs({ trades, activities }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("trades");

  const tabs = [
    { id: "trades" as const, label: "Trades" },
    { id: "modelchat" as const, label: "Modelchat" },
    { id: "positions" as const, label: "Positions" },
    { id: "readme" as const, label: "Readme.txt" },
  ];

  return (
    <div className="h-full border-l-2 border-border bg-background flex flex-col overflow-hidden">
      {/* Tab Headers */}
      <div className="flex-shrink-0 border-b-2 border-border bg-card">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-xs font-bold border-r-2 border-border last:border-r-0 transition-colors ${
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
        {activeTab === "modelchat" && (
          <div className="absolute inset-0">
            <ModelChat activities={activities} />
          </div>
        )}
        {activeTab === "positions" && (
          <div className="absolute inset-0">
            <Positions />
          </div>
        )}
        {activeTab === "readme" && (
          <div className="absolute inset-0">
            <ReadmeText />
          </div>
        )}
      </div>
    </div>
  );
}
