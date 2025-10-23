'use client';

import { getBonusTierName, getBonusTierColor } from '@/lib/bonus-calculator';

interface BonusMultiplierBadgeProps {
  multiplier: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function BonusMultiplierBadge({
  multiplier,
  size = 'md',
  showLabel = false,
}: BonusMultiplierBadgeProps) {
  const color = getBonusTierColor(multiplier);
  const tierName = getBonusTierName(multiplier);

  // Color styles based on tier
  const colorClasses: Record<string, string> = {
    gold: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-yellow-500/50',
    silver: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 shadow-gray-400/50',
    bronze: 'bg-gradient-to-r from-orange-400 to-amber-600 text-white shadow-orange-400/50',
    standard: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-gray-600/50',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  // Get color class with fallback to standard
  const colorClass = colorClasses[color] || colorClasses.standard;

  return (
    <div className="inline-flex items-center gap-2 group relative">
      <span
        className={`
          inline-flex items-center justify-center
          font-bold rounded-full shadow-lg
          transition-transform hover:scale-110
          ${colorClass}
          ${sizeClasses[size]}
        `}
      >
        {multiplier}x
      </span>
      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {tierName}
        </span>
      )}
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-foreground text-background text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap shadow-xl border-2 border-border">
          {tierName}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
        </div>
      </div>
    </div>
  );
}
