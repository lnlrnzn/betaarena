/**
 * Calculate bonus multiplier based on when a user joined a team
 * relative to the cycle start date
 *
 * Bonus tiers:
 * - 0-24h: 2.0x multiplier
 * - 24-48h: 1.5x multiplier
 * - 48-96h: 1.3x multiplier
 * - 96h+: 1.0x multiplier (standard)
 */
export function calculateBonusMultiplier(
  declaredAt: Date | string,
  cycleStartDate: Date | string
): number {
  const declaredTime = typeof declaredAt === 'string' ? new Date(declaredAt) : declaredAt;
  const cycleStart = typeof cycleStartDate === 'string' ? new Date(cycleStartDate) : cycleStartDate;

  const hoursSinceStart = (declaredTime.getTime() - cycleStart.getTime()) / (1000 * 60 * 60);

  if (hoursSinceStart <= 24) return 2.0;
  if (hoursSinceStart <= 48) return 1.5;
  if (hoursSinceStart <= 96) return 1.3;
  return 1.0;
}

/**
 * Get the tier name for a given bonus multiplier
 */
export function getBonusTierName(multiplier: number): string {
  switch (multiplier) {
    case 2.0: return 'Early Bird (0-24h)';
    case 1.5: return 'Quick Joiner (24-48h)';
    case 1.3: return 'Active (48-96h)';
    default: return 'Standard (96h+)';
  }
}

/**
 * Get color class for bonus tier badge
 */
export function getBonusTierColor(multiplier: number): string {
  switch (multiplier) {
    case 2.0: return 'gold';
    case 1.5: return 'silver';
    case 1.3: return 'bronze';
    default: return 'standard';
  }
}
