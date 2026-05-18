import type { PlayerIdentity } from '@/features/identity/usePlayerIdentity';

/**
 * Extensible registry of Academy module stat panels.
 * To add a module: create a StatsComponent and push an entry here.
 */
export interface AcademyModuleContribution {
  slug: string;
  label: string;
  StatsComponent: React.ComponentType<{ identity: PlayerIdentity }>;
}

// Lazy-register via a mutable array so future modules don't need to touch
// this file directly — they just import and push.
export const ACADEMY_MODULE_CONTRIBUTIONS: AcademyModuleContribution[] = [];

export function registerAcademyModule(contribution: AcademyModuleContribution) {
  if (!ACADEMY_MODULE_CONTRIBUTIONS.find((c) => c.slug === contribution.slug)) {
    ACADEMY_MODULE_CONTRIBUTIONS.push(contribution);
  }
}
