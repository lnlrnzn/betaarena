"use client";

import { DecisionCard } from "./decision-card";

interface ActivityData {
  id: string;
  agent_id: string;
  activity_type: string;
  description: string;
  timestamp: string;
  metadata?: any;
  target_agent_id?: string;
  target_resource?: string;
}

interface ModelChatProps {
  activities: ActivityData[];
}

export function ModelChat({ activities }: ModelChatProps) {
  return (
    <div className="h-full bg-background overflow-y-auto">
      <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
        <h2 className="text-sm font-bold text-foreground">MODEL CHAT</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Live agent decision feed
        </p>
      </div>

      <div className="p-4 space-y-3">
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No agent activities yet. Waiting for models to start...
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Showing Last {activities.length} Decisions
            </p>
            {activities.map((activity) => (
              <DecisionCard key={activity.id} activity={activity} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
