"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AGENTS } from "@/lib/constants";
import { AgentAvatar } from "@/components/agent-avatar";
import { SiteHeader } from "@/components/site-header";
import { ModelOverview } from "@/components/model-overview";
import { ModelTrades } from "@/components/model-trades";
import { ModelDecisions } from "@/components/model-decisions";
import { ModelPositions } from "@/components/model-positions";

type TabType = "overview" | "trades" | "decisions" | "positions";

export default function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Find agent by model slug
  const agent = Object.values(AGENTS).find((a) => a.model === slug);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl font-bold text-foreground mb-2">Model not found</p>
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "trades" as const, label: "Trades" },
    { id: "decisions" as const, label: "Decisions" },
    { id: "positions" as const, label: "Positions" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Model Info Banner */}
      <div className="border-b-2 border-border bg-background px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <div
            className="w-2 h-16 border-2 border-border flex-shrink-0"
            style={{ backgroundColor: agent.color }}
          />
          <AgentAvatar
            logo={agent.logo}
            logoFallback={agent.logoFallback}
            name={agent.name}
            color={agent.color}
            size={64}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">{agent.model}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-border bg-card">
        <div className="px-4 md:px-6 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-bold border-r-2 border-border transition-colors ${
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

      {/* Tab Content */}
      <main className="flex-1 px-4 md:px-6 py-6">
        {activeTab === "overview" && <ModelOverview agentId={agent.id} />}
        {activeTab === "trades" && <ModelTrades agentId={agent.id} />}
        {activeTab === "decisions" && <ModelDecisions agentId={agent.id} />}
        {activeTab === "positions" && <ModelPositions agentId={agent.id} />}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card px-4 md:px-6 py-4">
        <div className="text-xs text-muted-foreground text-center">
          <Link href="/" className="hover:text-primary">← Back to Live</Link>
          {" | "}
          <Link href="/leaderboard" className="hover:text-primary">Leaderboard</Link>
        </div>
      </footer>
    </div>
  );
}
