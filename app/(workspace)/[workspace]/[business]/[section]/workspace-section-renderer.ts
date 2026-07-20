import type { ReactNode } from "react";

import type { WorkspaceBusinessKey } from "@/lib/workspace-business-modules";
import type { WorkspaceRouteConfig } from "@/lib/workspace-config";

/**
 * 业务 section renderer 获得完成路由校验后的最小上下文。
 * 查询参数解析、领域查询、文案命名空间和 Client 选择都由业务入口自己负责。
 */
export type WorkspaceSectionRenderContext = {
  business: WorkspaceBusinessKey;
  config: WorkspaceRouteConfig;
  searchParams: Record<string, string | string[] | undefined>;
  section: string;
};

export type WorkspaceSectionRenderer = (
  context: WorkspaceSectionRenderContext,
) => Promise<ReactNode>;
