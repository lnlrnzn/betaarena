"use client";

import { useState, useEffect } from "react";
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
  agentId: string;
}

export function ModelDecisions({ agentId }: ModelDecisionsProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [agentId]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/models/${agentId}/decisions`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching model decisions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading decisions...</p>
      </div>
    );
  }

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
