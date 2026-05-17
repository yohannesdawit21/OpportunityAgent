/** IDs from backend SEED_OPPORTUNITIES — if these appear after "live" analyze, the agent did not run. */
export const SEED_OPPORTUNITY_IDS = new Set([
  'lumina-senior-pe',
  'nebula-ml-intern',
  'neuralflow-lead-react',
  'metaverse-designer',
]);

export function isSeedOpportunityList(
  opportunities: { id: string }[],
): boolean {
  if (opportunities.length === 0) return false;
  return opportunities.every((o) => SEED_OPPORTUNITY_IDS.has(o.id));
}
