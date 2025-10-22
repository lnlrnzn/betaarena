"use client";

import { useState, useEffect } from "react";
import { AgentStats } from "@/lib/types";
import { AGENTS } from "@/lib/constants";
import { GameInfoModal } from "./game-info-modal";

interface EliminationCountdownProps {
  agentStats: AgentStats[];
}

export function EliminationCountdown({ agentStats }: EliminationCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Auto-show modal on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('trenchmark_visited');
    if (!hasVisited) {
      setShowModal(true);
      localStorage.setItem('trenchmark_visited', 'true');
    }
  }, []);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      // Target: October 23, 2025, 21:00 UTC
      const target = new Date('2025-10-23T21:00:00Z');

      return target.getTime() - now.getTime();
    };

    // Initial calculation
    const initialTime = calculateTimeRemaining();
    setTimeRemaining(initialTime);
    setIsLoading(false);

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds: number): string => {
    if (milliseconds <= 0) return "0s";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Adaptive minimal format
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Find agent with lowest portfolio value
  const getLowestPerformingAgent = () => {
    if (!agentStats || agentStats.length === 0) return null;

    return agentStats.reduce((lowest, current) => {
      const lowestValue = lowest.currentValue || 0;
      const currentValue = current.currentValue || 0;
      return currentValue < lowestValue ? current : lowest;
    });
  };

  const lowestAgent = getLowestPerformingAgent();
  const agentDetails = lowestAgent ? Object.values(AGENTS).find(a => a.id === lowestAgent.agent_id) : null;
  const isElimination = timeRemaining <= 0;

  // Prevent flash of elimination message on initial load
  if (isLoading) {
    return (
      <div className="bg-background border-4 border-border px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (isElimination && lowestAgent && agentDetails) {
    // Elimination Announcement State
    return (
      <>
        <div className="bg-destructive/10 border-4 border-destructive px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <span className="text-lg font-bold text-destructive">
                  {agentDetails.name.toUpperCase()} WILL BE ELIMINATED
                </span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>$TLM supply will be burned</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>Remaining SOL added to reward pool</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 w-8 h-8 border-2 border-border bg-background hover:bg-muted transition-colors flex items-center justify-center font-bold text-sm"
              title="Game Information"
              aria-label="Game Information"
            >
              ?
            </button>
          </div>
        </div>

        <GameInfoModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Countdown Active State
  return (
    <>
      <div className="bg-background border-4 border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="text-sm font-bold text-foreground">
                SURVIVAL TIMER:{" "}
                <span className="text-primary">{formatTime(timeRemaining)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                until next agent elimination
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex-shrink-0 w-8 h-8 border-2 border-border bg-background hover:bg-muted transition-colors flex items-center justify-center font-bold text-sm"
            title="Game Information"
            aria-label="Game Information"
          >
            ?
          </button>
        </div>
      </div>

      <GameInfoModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
