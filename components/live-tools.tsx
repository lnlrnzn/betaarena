"use client";

import { useState, useEffect } from "react";
import { useRealtime } from "./providers/realtime-provider";
import { AGENTS } from "@/lib/constants";
import { AgentAvatar } from "./agent-avatar";

interface Activity {
  id: string;
  agent_id: string;
  activity_type: string;
  description: string;
  timestamp: string;
  metadata: any;
  target_agent_id: string | null;
  target_resource: string | null;
}

interface LiveToolsProps {
  activities: Activity[];
  agentFilter: string;
}

function formatRelativeTime(timestamp: string) {
  // Use UTC timestamps to avoid timezone issues
  const now = Date.now(); // Current time in milliseconds (UTC)
  // Ensure timestamp is treated as UTC by appending 'Z' if missing
  const utcTimestamp = timestamp.endsWith('Z') ? timestamp : timestamp + 'Z';
  const activityTime = new Date(utcTimestamp).getTime(); // Parse as UTC timestamp
  const diffMs = now - activityTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Helper function to deduplicate activities by ID
function deduplicateActivities(activities: Activity[]): Activity[] {
  const seen = new Set<string>();
  return activities.filter(activity => {
    if (seen.has(activity.id)) {
      return false;
    }
    seen.add(activity.id);
    return true;
  });
}

export function LiveTools({ activities: initialActivities, agentFilter }: LiveToolsProps) {
  const [activities, setActivities] = useState<Activity[]>(deduplicateActivities(initialActivities));
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { latestActivity } = useRealtime();

  const toggleExpand = (activityId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  };

  // Real-time update from global context
  useEffect(() => {
    if (!latestActivity) return;

    console.log('New activity received:', latestActivity);
    setActivities((prev) => {
      // Check if activity already exists to prevent duplicates
      if (prev.some(activity => activity.id === latestActivity.id)) {
        return prev;
      }
      return [latestActivity, ...prev].slice(0, 100); // Keep latest 100
    });
  }, [latestActivity]);

  // Filter activities by agent
  const filteredActivities = agentFilter === "all"
    ? activities
    : activities.filter(activity => activity.agent_id === agentFilter);

  return (
    <div className="h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
        <h2 className="text-sm font-bold text-foreground">LIVE TOOLS</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time agent tool usage and activities
        </p>
      </div>

      {/* Activities List */}
      <div className="p-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            {agentFilter === "all"
              ? "No activities yet. Waiting for agents to use tools..."
              : "No activities for this agent yet."}
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Showing {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
              {agentFilter !== "all" && (
                <span className="ml-1">
                  for {Object.values(AGENTS).find(a => a.id === agentFilter)?.shortName}
                </span>
              )}
            </p>
            {filteredActivities.map((activity) => {
              const agent = Object.values(AGENTS).find((a) => a.id === activity.agent_id);
              const agentColor = agent?.color || "#666";
              const agentName = agent?.shortName || "Unknown";
              const isLongText = activity.description.length > 100;
              const isExpanded = expandedCards.has(activity.id);

              return (
                <div
                  key={activity.id}
                  className="border-2 border-border bg-card p-3 space-y-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    {/* Agent Avatar & Color Strip */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className="w-1 h-12 border-2 border-border"
                        style={{ backgroundColor: agentColor }}
                      />
                      <AgentAvatar
                        logo={agent?.logo || ""}
                        logoFallback={agent?.logoFallback || ""}
                        name={agent?.name || "Unknown"}
                        color={agentColor}
                        size={32}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Agent Name & Tool */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">
                          {agentName}
                        </span>
                        <span className="text-xs text-muted-foreground">used</span>
                        <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground border-2 border-border">
                          TOOL
                        </span>
                      </div>

                      {/* Description */}
                      <div>
                        <p className={`text-xs text-foreground break-words ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {activity.description}
                        </p>

                        {isLongText && (
                          <button
                            onClick={() => toggleExpand(activity.id)}
                            className="text-xs text-primary hover:underline mt-1 flex items-center gap-1 font-bold"
                          >
                            {isExpanded ? (
                              <>
                                Show less ▲
                              </>
                            ) : (
                              <>
                                Show more ▼
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Target Info (if available) */}
                      {activity.target_agent_id && (
                        <div className="text-xs text-muted-foreground">
                          Target: {Object.values(AGENTS).find(a => a.id === activity.target_agent_id)?.shortName || activity.target_agent_id}
                        </div>
                      )}
                      {activity.target_resource && (
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          Resource: {activity.target_resource}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {formatRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
