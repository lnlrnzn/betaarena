"use client";

import { useState } from "react";
import Link from "next/link";
import { ModelsDropdown } from "./models-dropdown";
import { ThemeToggle } from "./theme-toggle";
import { AgentStats } from "@/lib/types";

interface SiteHeaderProps {
  agentStats?: AgentStats[];
}

export function SiteHeader({ agentStats = [] }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [copied, setCopied] = useState(false);
  const contractAddress = "3XAWJDr47NPzUfFgj3M6TamhRkJJQzgR86gizssBpump";

  const handleCopyContract = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <header className="border-b-2 border-border bg-card">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="text-xl md:text-2xl font-bold text-primary hover:underline">
              Alpha Arena
            </Link>
            <span className="hidden sm:inline text-xs text-muted-foreground">by Mutl</span>
          </div>

          {/* Contract Address - Desktop Center */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">CA:</span>
            <button
              onClick={handleCopyContract}
              className="font-mono text-foreground hover:text-primary transition-colors relative group"
              title="Click to copy"
            >
              {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold whitespace-nowrap">
                  COPIED!
                </span>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              href="/"
              className="px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
            >
              LIVE
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/leaderboard"
              className="px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
            >
              LEADERBOARD
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/teams"
              className="px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
            >
              TEAMS
            </Link>
            <span className="text-muted-foreground">|</span>
            <ModelsDropdown agentStats={agentStats} />
            <span className="text-muted-foreground">|</span>
            <Link
              href="/tlm"
              className="px-4 py-2 font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-primary"
            >
              $TLM
            </Link>
            <span className="text-muted-foreground">|</span>
            <ThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t-2 border-border space-y-2">
            {/* Contract Address - Mobile */}
            <div className="px-4 py-2 border-2 border-border bg-background">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">CA:</span>
                <button
                  onClick={handleCopyContract}
                  className="font-mono text-xs text-foreground hover:text-primary transition-colors relative flex-1 text-right"
                  title="Click to copy"
                >
                  {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
                  {copied && (
                    <span className="absolute -top-8 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold whitespace-nowrap">
                      COPIED!
                    </span>
                  )}
                </button>
              </div>
            </div>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 font-medium text-foreground hover:bg-muted transition-colors"
            >
              LIVE
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 font-medium text-foreground hover:bg-muted transition-colors"
            >
              LEADERBOARD
            </Link>
            <Link
              href="/teams"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 font-medium text-foreground hover:bg-muted transition-colors"
            >
              TEAMS
            </Link>
            <div className="px-4 py-2">
              <ModelsDropdown agentStats={agentStats} />
            </div>
            <Link
              href="/tlm"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-primary text-center"
            >
              $TLM
            </Link>
            <div className="px-4 py-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Theme:</span>
              <ThemeToggle />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
