"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="px-3 md:px-4 py-2 font-medium text-foreground">
        <span className="w-4 h-4 inline-block"></span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 md:px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <span className="text-base">☀️</span>
      ) : (
        <span className="text-base">🌙</span>
      )}
    </button>
  );
}
