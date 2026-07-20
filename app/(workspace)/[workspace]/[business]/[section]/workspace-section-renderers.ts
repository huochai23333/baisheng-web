import type { WorkspaceBusinessPageEntry } from "@/lib/workspace-business-modules";

import { renderTourismSectionPage } from "./tourism-section-page";
import { renderWholesaleSectionPage } from "./wholesale-section-page";
import type { WorkspaceSectionRenderer } from "./workspace-section-renderer";

/** 每个业务入口必须显式注册 renderer，新增业务时不会回到 Page 里继续堆分支。 */
const workspaceSectionRenderers = {
  tourism: renderTourismSectionPage,
  wholesale: renderWholesaleSectionPage,
} satisfies Record<WorkspaceBusinessPageEntry, WorkspaceSectionRenderer>;

export function getWorkspaceSectionRenderer(
  entry: WorkspaceBusinessPageEntry,
): WorkspaceSectionRenderer {
  return workspaceSectionRenderers[entry];
}
