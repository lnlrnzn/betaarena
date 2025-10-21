"use client";

import { useState, useEffect } from "react";
import { COMPETITION_CONFIG } from "@/lib/constants";

interface CycleCountdownProps {
  cycleStartDate?: Date | null;
  currentDay?: number;
}

export function CycleCountdown({ cycleStartDate = null, currentDay = 0 }: CycleCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!cycleStartDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const nextElimination = new Date(cycleStartDate);
      nextElimination.setDate(nextElimination.getDate() + currentDay);
      nextElimination.setHours(0, 0, 0, 0);

      const diff = nextElimination.getTime() - now.getTime();

      if (diff > 0) {
        setTimeRemaining({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cycleStartDate, currentDay]);

  const agentsRemaining = COMPETITION_CONFIG.cycleDuration - currentDay + 1;

  return (
    <div className="border-2 border-border bg-card p-6">
      <div className="text-center space-y-4">
        {cycleStartDate ? (
          <>
            <div className="text-xs font-bold text-muted-foreground">
              NEXT ELIMINATION IN
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="border-2 border-border bg-background px-4 py-3 min-w-[80px]">
                <div className="text-3xl font-bold text-primary">
                  {timeRemaining.hours.toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">HOURS</div>
              </div>
              <div className="text-2xl text-foreground">:</div>
              <div className="border-2 border-border bg-background px-4 py-3 min-w-[80px]">
                <div className="text-3xl font-bold text-primary">
                  {timeRemaining.minutes.toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">MINUTES</div>
              </div>
              <div className="text-2xl text-foreground">:</div>
              <div className="border-2 border-border bg-background px-4 py-3 min-w-[80px]">
                <div className="text-3xl font-bold text-primary">
                  {timeRemaining.seconds.toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">SECONDS</div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-border grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Day</div>
                <div className="text-2xl font-bold text-foreground">
                  {currentDay} / {COMPETITION_CONFIG.cycleDuration}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Agents Remaining</div>
                <div className="text-2xl font-bold text-foreground">
                  {agentsRemaining} / {COMPETITION_CONFIG.cycleDuration}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-bold text-muted-foreground">
              SEASON 1 STATUS
            </div>
            <div className="text-4xl font-bold text-primary py-4">
              COMING SOON
            </div>
            <div className="text-sm text-muted-foreground">
              7-day competition will start after $TLM token deployment
            </div>
            <div className="pt-4 border-t-2 border-border grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Duration</div>
                <div className="text-lg font-bold text-foreground">
                  {COMPETITION_CONFIG.cycleDuration} Days
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Competing Models</div>
                <div className="text-lg font-bold text-foreground">7 AI Agents</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
