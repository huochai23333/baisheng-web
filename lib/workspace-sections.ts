export const workspaceSectionKeys = [
  "orders",
  "customers",
  "referrals",
  "team",
  "people",
  "records",
  "commission",
  "tasks",
  "reviews",
  "settings",
  "vip",
] as const;

export type WorkspaceSectionKey = (typeof workspaceSectionKeys)[number];

const workspaceSectionKeySet = new Set<string>(workspaceSectionKeys);

export function getWorkspaceSectionKey(section: string): WorkspaceSectionKey | null {
  return workspaceSectionKeySet.has(section) ? (section as WorkspaceSectionKey) : null;
}
