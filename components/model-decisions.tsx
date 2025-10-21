"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DecisionCard } from "./decision-card";

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

interface ModelDecisionsProps {
  activities: Activity[];
  agentId: string;
}

export function ModelDecisions({ activities: initialActivities, agentId }: ModelDecisionsProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  // Real-time subscription for new activities/decisions
  useEffect(() => {
    const channel = supabase
      .channel(`activities-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'agent_activities',
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          console.log('Activity update received:', payload);

          if (payload.eventType === 'INSERT') {
            const newActivity = payload.new as Activity;
            setActivities((prev) => [newActivity, ...prev].slice(0, 100)); // Keep latest 100
          } else if (payload.eventType === 'UPDATE') {
            const updatedActivity = payload.new as Activity;
            setActivities((prev) =>
              prev.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedActivity = payload.old as Activity;
            setActivities((prev) => prev.filter((activity) => activity.id !== deletedActivity.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No decisions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-border bg-card px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">Decision Timeline</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Detailed reasoning and analysis for each trading decision made by this model
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <DecisionCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
