import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

import { ScopedIntlProvider } from "@/components/i18n/scoped-intl-provider";
import { getBusinessVipPageData } from "@/lib/business-vip-management";
import { getBusinessSettingsPageData } from "@/lib/business-settings";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { redirectToWorkspaceAccessLimited } from "@/lib/server-auth";
import { getWholesalePageData } from "@/lib/wholesale";
import { getWholesaleSettlementReleasePageData } from "@/lib/wholesale-settlement-releases";
import {
  isWorkspaceWholesaleSectionKey,
  type WorkspaceRouteConfig,
  type WorkspaceWholesaleSectionKey,
} from "@/lib/workspace-config";

const WholesaleClient = dynamic(() =>
  import("@/components/dashboard/wholesale/wholesale-client").then(
    (mod) => mod.WholesaleClient,
  ),
);

const BusinessVipClient = dynamic(() =>
  import("@/components/dashboard/business-vip/business-vip-client").then(
    (mod) => mod.BusinessVipClient,
  ),
);

const BusinessSettingsClient = dynamic(() =>
  import("@/components/dashboard/business-settings/business-settings-client").then(
    (mod) => mod.BusinessSettingsClient,
  ),
);

const WholesaleSettlementReleaseClient = dynamic(() =>
  import("@/components/dashboard/wholesale/wholesale-settlement-release-client").then(
    (mod) => mod.WholesaleSettlementReleaseClient,
  ),
);

export async function renderWholesaleSectionPage(
  section: string,
  config: WorkspaceRouteConfig,
) {
  const wholesaleSection = getEnabledWholesaleSection(section, config);

  if (!wholesaleSection) {
    if (isWorkspaceWholesaleSectionKey(section)) {
      redirectToWorkspaceAccessLimited();
    }

    notFound();
  }

  const supabase = await getServerSupabaseClient();

  if (wholesaleSection === "vip") {
    const initialData = await getBusinessVipPageData(
      supabase,
      "wholesale",
      config.routeSegment === "admin" ? "admin" : "salesman",
    );

    return (
      <ScopedIntlProvider namespaces={["BusinessVip", "DashboardShared"]}>
        <BusinessVipClient initialData={initialData} />
      </ScopedIntlProvider>
    );
  }

  if (wholesaleSection === "settings") {
    const initialData = await getBusinessSettingsPageData(
      supabase,
      "wholesale",
    );

    return (
      <ScopedIntlProvider
        namespaces={[
          "Commission",
          "DashboardShared",
          "Orders",
          "OrdersUI",
          "SystemSettings",
        ]}
      >
        <BusinessSettingsClient initialData={initialData} />
      </ScopedIntlProvider>
    );
  }

  if (wholesaleSection === "settlement-releases") {
    const initialData = await getWholesaleSettlementReleasePageData(supabase);

    return (
      <ScopedIntlProvider namespaces={["DashboardShared", "WholesaleBusiness"]}>
        <WholesaleSettlementReleaseClient initialData={initialData} />
      </ScopedIntlProvider>
    );
  }

  const initialData = await getWholesalePageData(supabase, wholesaleSection);

  return (
    <ScopedIntlProvider
      namespaces={[
        "ClientBusinessAccess",
        "DashboardShared",
        "WholesaleBusiness",
      ]}
    >
      <WholesaleClient initialData={initialData} />
    </ScopedIntlProvider>
  );
}

function getEnabledWholesaleSection(
  section: string,
  config: WorkspaceRouteConfig,
): WorkspaceWholesaleSectionKey | null {
  if (!isWorkspaceWholesaleSectionKey(section)) {
    return null;
  }

  return config.wholesalePageVariants?.[section] ? section : null;
}
