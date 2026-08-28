import { notFound, redirect } from "next/navigation";

import { getServerSupabaseClient } from "@/lib/supabase-server";
import { redirectToWorkspaceAccessLimited } from "@/lib/server-auth";
import {
  getCurrentWorkspaceBusinessAccess,
  workspaceBusinessAccessIncludes,
} from "@/lib/workspace-business-access";
import { getWorkspaceBusinessModule } from "@/lib/workspace-business-modules";
import {
  getWorkspaceConfigByRouteSegment,
  isEnabledWorkspaceBusinessKey,
  isRegisteredWorkspaceBusinessKey,
} from "@/lib/workspace-config";
import { BUSINESS_UNAVAILABLE_PATH } from "@/lib/workspace-business-availability";

import type { SectionPageProps } from "./types";
import { getWorkspaceSectionRenderer } from "./workspace-section-renderers";

export { generateWorkspaceSectionMetadata as generateMetadata } from "./section-metadata";

/**
 * 动态 Page 只负责路由和工作区业务访问校验。
 * 领域查询、查询参数、命名空间和 Client 选择由已注册的业务 renderer 接管。
 */
export default async function WorkspaceSectionPage({
  params,
  searchParams,
}: SectionPageProps) {
  const [{ business, section, workspace }, resolvedSearchParams] =
    await Promise.all([params, searchParams]);
  const config = getWorkspaceConfigByRouteSegment(workspace);

  if (!config || !isRegisteredWorkspaceBusinessKey(business)) notFound();

  if (!isEnabledWorkspaceBusinessKey(business)) {
    redirect(`${BUSINESS_UNAVAILABLE_PATH}?business=${business}`);
  }

  const businessModule = getWorkspaceBusinessModule(business);
  if (!businessModule) notFound();

  const accessSupabase = await getServerSupabaseClient();
  const workspaceBusinessAccess =
    await getCurrentWorkspaceBusinessAccess(accessSupabase);

  if (!workspaceBusinessAccessIncludes(workspaceBusinessAccess, business)) {
    redirectToWorkspaceAccessLimited();
  }

  const renderer = getWorkspaceSectionRenderer(businessModule.pageEntry);
  return renderer({
    business,
    config,
    searchParams: resolvedSearchParams,
    section,
  });
}
