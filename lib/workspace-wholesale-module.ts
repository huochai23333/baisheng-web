import type {
  WorkspaceBusinessModule,
  WorkspaceNavItem,
  WorkspaceNavLabelKey,
  WorkspaceWholesaleSectionKey,
} from "./workspace-business-modules";

const adminNavItems = createNavItems([
  ["orders", "wholesaleOrders"],
  ["inventory-orders", "customerInventoryOrders"],
  ["settlement-releases", "settlementReleases"],
  ["order-claims", "orderClaims"],
  ["logistics", "logistics"],
  ["customers", "customers"],
  ["people", "people"],
  ["vip", "vip"],
  ["referrals", "referrals"],
  ["commission", "commission"],
  ["incentives", "incentives"],
  ["settings", "businessSettings"],
]);
const salesNavItems = createNavItems([
  ["orders", "wholesaleOrders"],
  ["order-claims", "orderClaims"],
  ["customers", "customers"],
  ["people", "people"],
  ["vip", "vip"],
  ["referrals", "referrals"],
  ["commission", "commission"],
  ["incentives", "incentives"],
]);
const salesmanNavItems = createNavItems([
  ["orders", "wholesaleOrders"],
  ["inventory-orders", "customerInventoryOrders"],
  ["settlement-releases", "settlementReleases"],
  ["order-claims", "orderClaims"],
  ["logistics", "logistics"],
  ["customers", "customers"],
  ["vip", "vip"],
  ["referrals", "referrals"],
  ["commission", "commission"],
  ["incentives", "incentives"],
]);
const clientNavItems = createNavItems([
  ["orders", "wholesaleOrders"],
  ["inventory-orders", "customerInventoryOrders"],
  ["referrals", "referrals"],
  ["commission", "commission"],
]);
const managerNavItems = createNavItems([
  ["orders", "wholesaleOrders"],
  ["referrals", "referrals"],
  ["commission", "commission"],
  ["incentives", "incentives"],
]);
const operatorNavItems = createNavItems([["orders", "wholesaleOrders"]]);
const recruiterNavItems = createNavItems([["referrals", "referrals"]]);

// 财务承担完整日常批发协作，入口与业务员一致；人员和业务设置仍仅管理员可见。
const financeNavItems = salesmanNavItems;

export const wholesaleWorkspaceBusinessModule: WorkspaceBusinessModule = {
  key: "wholesale",
  labelKey: "wholesale",
  navItemsByRouteSegment: {
    admin: adminNavItems,
    client: clientNavItems,
    finance: financeNavItems,
    manager: managerNavItems,
    operator: operatorNavItems,
    promoter: salesNavItems,
    recruiter: recruiterNavItems,
    salesman: salesmanNavItems,
  },
  pageEntry: "wholesale",
  pageVariantsByRouteSegment: {},
  settings: {
    business: "wholesale",
    descriptionKey: "tabs.wholesale.description",
    sections: [
      {
        kind: "commissionRules",
        ruleCodes: [
          "wholesale_order_salesman_tier",
          "wholesale_referral_order_amount_rate",
          "wholesale_referral_waybill_bonus",
        ],
      },
    ],
    titleKey: "tabs.wholesale.title",
  },
  wholesalePageVariantsByRouteSegment: {
    admin: createPageVariants(adminNavItems),
    client: createPageVariants(clientNavItems),
    finance: createPageVariants(financeNavItems),
    manager: createPageVariants(managerNavItems),
    operator: createPageVariants(operatorNavItems),
    promoter: createPageVariants(salesNavItems),
    recruiter: createPageVariants(recruiterNavItems),
    salesman: createPageVariants(salesmanNavItems),
  },
};

function createNavItems(
  entries: readonly [WorkspaceWholesaleSectionKey, WorkspaceNavLabelKey][],
) {
  return entries.map(([segment, labelKey]) => ({
    business: "wholesale" as const,
    labelKey,
    segment,
  })) satisfies WorkspaceNavItem[];
}

function createPageVariants(
  navItems: readonly WorkspaceNavItem[],
): Partial<Record<WorkspaceWholesaleSectionKey, true>> {
  return Object.fromEntries(
    navItems.map((item) => [item.segment, true]),
  ) as Partial<Record<WorkspaceWholesaleSectionKey, true>>;
}
