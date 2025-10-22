/**
 * Team/Supporter utilities for prediction market
 */

/**
 * Format large numbers for display (followers, community size)
 */
export function formatStake(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format token amounts for display
 */
export function formatTokens(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M $TLM`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K $TLM`;
  }
  return `${num} $TLM`;
}

/**
 * Get supporter badge based on criteria
 */
export function getSupporterBadge(
  followersCount: number,
  joinedDay: number
): {
  emoji: string;
  label: string;
  color: string;
} | null {
  // Whale badge (>500K followers)
  if (followersCount > 500000) {
    return {
      emoji: '🐋',
      label: 'WHALE',
      color: '#3b82f6' // blue
    };
  }

  // Early supporter badge (Day 1-2)
  if (joinedDay <= 2) {
    return {
      emoji: '⚡',
      label: 'EARLY',
      color: '#eab308' // yellow
    };
  }

  return null;
}
