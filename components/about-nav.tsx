"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "how-it-works", label: "How It Works" },
  { id: "the-competition", label: "The Competition" },
  { id: "the-benchmark", label: "The Benchmark" },
  { id: "current-cycle", label: "Current Cycle" },
  { id: "reward-tiers", label: "Reward Tiers" },
  { id: "reward-pools", label: "Reward Pools" },
  { id: "rules-eligibility", label: "Rules & Eligibility" },
];

export function AboutNav() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    // Intersection Observer to detect active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px", // Trigger when section is in viewport center
      }
    );

    // Observe all sections
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="hidden xl:block fixed top-24 left-6 w-56 z-40">
      <div className="border-2 border-border bg-card p-4">
        <h3 className="text-xs font-bold text-foreground mb-3 uppercase">
          On This Page
        </h3>
        <ul className="space-y-2">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => scrollToSection(id)}
                className={`text-left text-sm w-full px-2 py-1 transition-colors ${
                  activeSection === id
                    ? "text-primary font-bold border-l-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground border-l-2 border-transparent"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
