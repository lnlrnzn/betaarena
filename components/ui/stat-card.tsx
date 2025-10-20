import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-6 bg-card border-2 border-border shadow-md",
        className
      )}
      {...props}
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <span
              className={cn("text-sm font-semibold", {
                "text-accent-foreground": changeType === "positive",
                "text-destructive": changeType === "negative",
                "text-muted-foreground": changeType === "neutral",
              })}
            >
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
