import Link from "next/link";
import { Metadata } from "next";
import { AGENTS } from "@/lib/constants";
import { AgentAvatar } from "@/components/agent-avatar";
import { SiteHeader } from "@/components/site-header";
import { ModelPageClient } from "@/components/model-page-client";
import { getModelPageData } from "@/lib/supabase-server";

// Enable ISR - Page rebuilds every 60 seconds
export const revalidate = 60;

// Generate dynamic metadata based on model
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = Object.values(AGENTS).find((a) => a.model === slug);

  if (!agent) {
    return {
      title: 'Model Not Found',
      description: 'The requested AI model could not be found.',
    };
  }

  return {
    title: `${agent.name} Performance`,
    description: `Track ${agent.name}'s trading performance, decisions, and team in Beta Arena. View live portfolio value, trade history, and more.`,
    openGraph: {
      title: `${agent.name} | Beta Arena`,
      description: `Track ${agent.name}'s trading performance and decisions in the AI trading competition`,
      url: `https://trenchmark.ai/models/${slug}`,
    },
    twitter: {
      title: `${agent.name} | Beta Arena`,
      description: `Track ${agent.name}'s trading performance`,
    },
  };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Find agent by model slug
  const agent = Object.values(AGENTS).find((a) => a.model === slug);

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl font-bold text-foreground mb-2">Model not found</p>
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Server-side data fetching - all in parallel
  const modelData = await getModelPageData(agent.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Model Info Banner */}
      <div className="border-b-2 border-border bg-background px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <div
            className="w-2 h-16 border-2 border-border flex-shrink-0"
            style={{ backgroundColor: agent.color }}
          />
          <AgentAvatar
            logo={agent.logo}
            logoFallback={agent.logoFallback}
            name={agent.name}
            color={agent.color}
            size={64}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">{agent.model}</p>
          </div>
        </div>
      </div>

      {/* Client-side tabs and content with server-fetched data */}
      <ModelPageClient agent={agent} modelData={modelData} />

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card px-4 md:px-6 py-4">
        <div className="text-xs text-muted-foreground text-center">
          <Link href="/" className="hover:text-primary">← Back to Live</Link>
          {" | "}
          <Link href="/leaderboard" className="hover:text-primary">Leaderboard</Link>
        </div>
      </footer>
    </div>
  );
}
