import type {
  WorkspaceBusinessKey,
  WorkspaceNavSegment,
} from "@/lib/workspace-config";

export type AdminShellNavLink = {
  groupKey?: WorkspaceBusinessKey;
  groupLabel?: string;
  href: string;
  icon: WorkspaceNavSegment;
  label: string;
};

export type AdminShellNavGroup = {
  items: readonly AdminShellNavLink[];
  key: WorkspaceBusinessKey;
  label: string;
};
