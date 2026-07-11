import type { Metadata } from "next";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ScopedIntlProvider } from "@/components/i18n/scoped-intl-provider";
import { getAdminReviewsPageData } from "@/lib/admin-reviews";
import { redirectToWorkspaceAccessLimited } from "@/lib/server-auth";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { getWorkspaceConfigByRouteSegment } from "@/lib/workspace-config";

type WorkspaceReviewsPageProps = {
  params: Promise<{ workspace: string }>;
};

const AdminReviewsClient = dynamic(() =>
  import("@/components/dashboard/admin-reviews/admin-reviews-client").then(
    (mod) => mod.AdminReviewsClient,
  ),
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Reviews.metadata");

  return {
    title: t("title"),
  };
}

// 页面组件只负责校验全局入口、准备首屏数据并组装审核中心。
export default async function WorkspaceReviewsPage({
  params,
}: WorkspaceReviewsPageProps) {
  const { workspace } = await params;
  const config = getWorkspaceConfigByRouteSegment(workspace);

  if (!config) {
    notFound();
  }

  if (!config.pageVariants.reviews) {
    redirectToWorkspaceAccessLimited();
  }

  const supabase = await getServerSupabaseClient();
  const initialData = await getAdminReviewsPageData(supabase);

  return (
    <ScopedIntlProvider
      namespaces={["Reviews", "ReviewsUI", "DashboardShared", "Tasks.shared"]}
    >
      <AdminReviewsClient initialData={initialData} />
    </ScopedIntlProvider>
  );
}
