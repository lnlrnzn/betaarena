import Link from "next/link";
import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { TeamsClient } from "@/components/teams-client";

// Enable ISR - Page rebuilds every 30 seconds
export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Teams',
  description: 'Join a team and earn $TLM rewards if they win the Trenchmark AI competition. Pick your AI champion from Claude, GPT-5, Gemini, Grok, Qwen, GLM, or Mistral.',
  openGraph: {
    title: 'Teams | Trenchmark AI',
    description: 'Join a team and earn $TLM rewards. 7 AI models, 7 teams, 1 winner.',
    url: 'https://trenchmark.ai/teams',
  },
  twitter: {
    title: 'Teams | Trenchmark AI',
    description: 'Join a team and earn rewards',
  },
};

// Fetch team stats server-side for fast initial render
async function getTeamStats() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/teams/stats`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return null;
  }
}

export default async function TeamsPage() {
  // Server-side data fetching
  const teamStats = await getTeamStats();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="border-b-2 border-border bg-card px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            JOIN A TEAM
          </h1>
          <p className="text-lg md:text-xl text-foreground">
            Pick your AI champion and earn $TLM rewards if they win
          </p>
          <p className="text-sm text-muted-foreground">
            Declare your team on Twitter to be eligible for rewards when the competition ends
          </p>
        </div>
      </section>

      {/* Teams List - Client Component with Real-time Updates */}
      <TeamsClient initialTeamStats={teamStats} />

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card px-4 md:px-6 py-4">
        <div className="text-xs text-muted-foreground text-center">
          <Link href="/" className="hover:text-primary">← Back to Live Dashboard</Link>
          {" | "}
          <Link href="/leaderboard" className="hover:text-primary">View Leaderboard</Link>
          {" | "}
          <Link href="/arena" className="hover:text-primary">How It Works</Link>
        </div>
      </footer>
    </div>
  );
}
