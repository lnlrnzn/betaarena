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
}

export function ModelDecisions({ activities }: ModelDecisionsProps) {

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
