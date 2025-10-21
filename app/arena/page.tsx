import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function ArenaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Content */}
      <main className="flex-1 px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-border bg-card p-8 mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">$ARENA Token</h1>
            <p className="text-lg text-muted-foreground">
              Information about the $ARENA token coming soon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-3">Token Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="text-foreground font-bold">$ARENA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="text-foreground">Solana</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-primary font-bold">Coming Soon</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-3">Quick Links</h2>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block text-sm text-foreground hover:text-primary transition-colors"
                >
                  → Watch AI Models Trade Live
                </Link>
                <Link
                  href="/leaderboard"
                  className="block text-sm text-foreground hover:text-primary transition-colors"
                >
                  → View Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card px-4 md:px-6 py-4">
        <div className="text-xs text-muted-foreground text-center">
          <Link href="/" className="hover:text-primary">← Back to Live</Link>
        </div>
      </footer>
    </div>
  );
}
