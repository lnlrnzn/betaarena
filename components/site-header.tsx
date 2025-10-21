import Link from "next/link";
import { ModelsDropdown } from "./models-dropdown";
import { AgentStats } from "@/lib/types";

interface SiteHeaderProps {
  agentStats?: AgentStats[];
}

export function SiteHeader({ agentStats = [] }: SiteHeaderProps) {
  return (
    <header className="border-b-2 border-border bg-card">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="text-xl md:text-2xl font-bold text-primary hover:underline">
            Alpha Arena
          </Link>
          <span className="text-xs text-muted-foreground">by Mutl</span>
        </div>
        <nav className="flex items-center gap-1 text-xs md:text-sm">
          <Link
            href="/"
            className="px-3 md:px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
          >
            LIVE
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link
            href="/leaderboard"
            className="px-3 md:px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
          >
            LEADERBOARD
          </Link>
          <span className="text-muted-foreground">|</span>
          <ModelsDropdown agentStats={agentStats} />
          <span className="text-muted-foreground">|</span>
          <Link
            href="/arena"
            className="px-3 md:px-4 py-2 font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-primary"
          >
            $ARENA
          </Link>
        </nav>
      </div>
    </header>
  );
}
