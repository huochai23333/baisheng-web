import { companyConfig } from "./company-config";
import type { CommissionRuleCode } from "./commission-settings";
import type { WorkspaceRouteSegment } from "./workspace-route-segments";
import type { WorkspaceSectionKey } from "./workspace-sections";

export const allWorkspaceBusinessKeys = ["tourism", "wholesale"] as const;

export type WorkspaceBusinessKey = (typeof allWorkspaceBusinessKeys)[number];

export const workspaceWholesaleSectionKeys = [
  "orders",
  "order-claims",
  "logistics",
  "customers",
  "people",
  "referrals",
  "commission",
  "incentives",
  "vip",
  "settings",
] as const;

export type WorkspaceWholesaleSectionKey =
  (typeof workspaceWholesaleSectionKeys)[number];

export type WorkspaceGlobalNavSegment =
  | "accounts"
  | "announcements"
  | "feedback"
  | "home"
  | "my"
  | "settings";

export type WorkspaceNavSegment =
  | WorkspaceGlobalNavSegment
  | WorkspaceSectionKey
  | WorkspaceWholesaleSectionKey;

export type WorkspaceNavLabelKey =
  | "accounts"
  | "announcements"
  | "home"
  | "my"
  | "orders"
  | "customers"
  | "people"
  | "records"
  | "referrals"
  | "businessSettings"
  | "team"
  | "commission"
  | "exchangeRates"
  | "feedback"
  | "tasks"
  | "vip"
  | "reviews"
  | "settings"
  | "incentives"
  | "orderClaims"
  | "logistics"
  | "wholesaleOrders";

export type WorkspaceBusinessLabelKey = WorkspaceBusinessKey;

export type WorkspaceOrdersPageMode = "admin" | "salesman" | "client";
export type WorkspaceCommissionPageMode = "admin" | "salesman";
export type WorkspaceTasksPageMode = "admin" | "staff";
export type WorkspacePeoplePageMode = "admin" | "salesman";
export type WorkspaceCustomersPageMode = "admin" | "salesman";
export type WorkspaceVipPageMode = "admin" | "salesman";

export type WorkspaceBusinessPageVariants = {
  commission?: WorkspaceCommissionPageMode;
  customers?: WorkspaceCustomersPageMode;
  orders?: WorkspaceOrdersPageMode;
  people?: WorkspacePeoplePageMode;
  records?: true;
  referrals?: true;
  reviews?: true;
  settings?: true;
  tasks?: WorkspaceTasksPageMode;
  team?: true;
  vip?: WorkspaceVipPageMode;
};

export type WorkspaceNavItem = {
  business?: WorkspaceBusinessKey;
  segment: WorkspaceNavSegment;
  labelKey: WorkspaceNavLabelKey;
};

export type WorkspaceNavGroup = {
  business: WorkspaceBusinessKey;
  labelKey: WorkspaceBusinessLabelKey;
  navItems: readonly WorkspaceNavItem[];
};

export type WorkspaceBusinessPageEntry = "tourism" | "wholesale";

export type WorkspaceBusinessSettingsSection =
  | { kind: "tourismServiceFees" }
  | { kind: "tourismServiceOrders" }
  | { kind: "wholesaleOrderEditWindow" }
  | {
      kind: "commissionRules";
      ruleCodes: readonly CommissionRuleCode[];
    };

export type WorkspaceBusinessSettingsModule = {
  business: WorkspaceBusinessKey;
  descriptionKey: string;
  sections: readonly WorkspaceBusinessSettingsSection[];
  titleKey: string;
};

export type WorkspaceBusinessModule = {
  key: WorkspaceBusinessKey;
  labelKey: WorkspaceBusinessLabelKey;
  navItemsByRouteSegment: Partial<
    Record<WorkspaceRouteSegment, readonly WorkspaceNavItem[]>
  >;
  pageEntry: WorkspaceBusinessPageEntry;
  pageVariantsByRouteSegment: Partial<
    Record<WorkspaceRouteSegment, WorkspaceBusinessPageVariants>
  >;
  settings?: WorkspaceBusinessSettingsModule;
  wholesalePageVariantsByRouteSegment?: Partial<
    Record<WorkspaceRouteSegment, Partial<Record<WorkspaceWholesaleSectionKey, true>>>
  >;
};

const managerTourismNavItems = [
  { segment: "referrals", labelKey: "referrals" },
  { segment: "team", labelKey: "team" },
  { segment: "tasks", labelKey: "tasks" },
] as const satisfies readonly WorkspaceNavItem[];

const staffReadTourismNavItems = [
  { segment: "referrals", labelKey: "referrals" },
  { segment: "team", labelKey: "team" },
  { segment: "tasks", labelKey: "tasks" },
] as const satisfies readonly WorkspaceNavItem[];

const financeTourismNavItems = [
  ...staffReadTourismNavItems,
  { segment: "commission", labelKey: "commission" },
] as const satisfies readonly WorkspaceNavItem[];

const clientTourismNavItems = [
  { segment: "orders", labelKey: "orders" },
  { segment: "referrals", labelKey: "referrals" },
] as const satisfies readonly WorkspaceNavItem[];

const recruiterTourismNavItems = [
  { segment: "referrals", labelKey: "referrals" },
  { segment: "tasks", labelKey: "tasks" },
] as const satisfies readonly WorkspaceNavItem[];

const sharedSalesTourismNavItems = [
  { segment: "orders", labelKey: "orders" },
  { segment: "customers", labelKey: "customers" },
  { segment: "vip", labelKey: "vip" },
  { segment: "referrals", labelKey: "referrals" },
  { segment: "team", labelKey: "team" },
  { segment: "commission", labelKey: "commission" },
  { segment: "tasks", labelKey: "tasks" },
] as const satisfies readonly WorkspaceNavItem[];

const adminTourismNavItems = [
  { segment: "orders", labelKey: "orders" },
  { segment: "customers", labelKey: "customers" },
  { segment: "referrals", labelKey: "referrals" },
  { segment: "team", labelKey: "team" },
  { segment: "people", labelKey: "people" },
  { segment: "vip", labelKey: "vip" },
  { segment: "records", labelKey: "records" },
  { segment: "commission", labelKey: "commission" },
  { segment: "tasks", labelKey: "tasks" },
  { segment: "reviews", labelKey: "reviews" },
  { segment: "settings", labelKey: "businessSettings" },
] as const satisfies readonly WorkspaceNavItem[];

const adminWholesaleNavItems = createWholesaleNavItems([
  ["orders", "wholesaleOrders"],
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

const salesWholesaleNavItems = createWholesaleNavItems([
  ["orders", "wholesaleOrders"],
  ["order-claims", "orderClaims"],
  ["logistics", "logistics"],
  ["customers", "customers"],
  ["people", "people"],
  ["vip", "vip"],
  ["referrals", "referrals"],
  ["commission", "commission"],
  ["incentives", "incentives"],
]);

// 业务员只管理自己的批发客户与订单，承接账号目录留给管理员查看。
const salesmanWholesaleNavItems = createWholesaleNavItems([
  ["orders", "wholesaleOrders"],
  ["order-claims", "orderClaims"],
  ["logistics", "logistics"],
  ["customers", "customers"],
  ["vip", "vip"],
  ["referrals", "referrals"],
  ["commission", "commission"],
  ["incentives", "incentives"],
]);

const clientWholesaleNavItems = createWholesaleNavItems([
  ["orders", "wholesaleOrders"],
  ["logistics", "logistics"],
  ["referrals", "referrals"],
  ["commission", "commission"],
]);

const financeWholesaleNavItems = createWholesaleNavItems([
  ["orders", "wholesaleOrders"],
  ["logistics", "logistics"],
  ["commission", "commission"],
  ["incentives", "incentives"],
]);

const managerWholesaleNavItems = createWholesaleNavItems([
  ["orders", "wholesaleOrders"],
  ["logistics", "logistics"],
  ["referrals", "referrals"],
  ["commission", "commission"],
  ["incentives", "incentives"],
]);

const operatorWholesaleNavItems = createWholesaleNavItems([
  ["orders", "wholesaleOrders"],
  ["logistics", "logistics"],
]);

const recruiterWholesaleNavItems = createWholesaleNavItems([
  ["referrals", "referrals"],
]);

const allWorkspaceBusinessModules: readonly WorkspaceBusinessModule[] = [
  {
    key: "tourism",
    labelKey: "tourism",
    navItemsByRouteSegment: {
      admin: adminTourismNavItems,
      client: clientTourismNavItems,
      finance: financeTourismNavItems,
      manager: managerTourismNavItems,
      operator: staffReadTourismNavItems,
      promoter: sharedSalesTourismNavItems,
      recruiter: recruiterTourismNavItems,
      salesman: sharedSalesTourismNavItems,
    },
    pageEntry: "tourism",
    pageVariantsByRouteSegment: {
      admin: {
        commission: "admin",
        customers: "admin",
        orders: "admin",
        people: "admin",
        records: true,
        referrals: true,
        reviews: true,
        settings: true,
        tasks: "admin",
        team: true,
        vip: "admin",
      },
      client: {
        orders: "client",
        referrals: true,
      },
      finance: {
        commission: "admin",
        referrals: true,
        tasks: "staff",
        team: true,
      },
      manager: {
        referrals: true,
        tasks: "staff",
        team: true,
      },
      operator: {
        referrals: true,
        tasks: "staff",
        team: true,
      },
      promoter: {
        commission: "salesman",
        customers: "salesman",
        orders: "salesman",
        referrals: true,
        tasks: "staff",
        team: true,
        vip: "salesman",
      },
      recruiter: {
        referrals: true,
        tasks: "staff",
      },
      salesman: {
        commission: "salesman",
        customers: "salesman",
        orders: "salesman",
        referrals: true,
        tasks: "staff",
        team: true,
        vip: "salesman",
      },
    },
    settings: {
      business: "tourism",
      descriptionKey: "tabs.tourism.description",
      sections: [
        { kind: "tourismServiceFees" },
        { kind: "tourismServiceOrders" },
        {
          kind: "commissionRules",
          ruleCodes: [
            "service_escort_salesman",
            "digital_survival_salesman",
            "service_referral_rate",
            "vip_first_year_referral_bonus",
          ],
        },
      ],
      titleKey: "tabs.tourism.title",
    },
  },
  {
    key: "wholesale",
    labelKey: "wholesale",
    navItemsByRouteSegment: {
      admin: adminWholesaleNavItems,
      client: clientWholesaleNavItems,
      finance: financeWholesaleNavItems,
      manager: managerWholesaleNavItems,
      operator: operatorWholesaleNavItems,
      promoter: salesWholesaleNavItems,
      recruiter: recruiterWholesaleNavItems,
      salesman: salesmanWholesaleNavItems,
    },
    pageEntry: "wholesale",
    pageVariantsByRouteSegment: {},
    settings: {
      business: "wholesale",
      descriptionKey: "tabs.wholesale.description",
      sections: [
        { kind: "wholesaleOrderEditWindow" },
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
      admin: createWholesalePageVariants(adminWholesaleNavItems),
      client: createWholesalePageVariants(clientWholesaleNavItems),
      finance: createWholesalePageVariants(financeWholesaleNavItems),
      manager: createWholesalePageVariants(managerWholesaleNavItems),
      operator: createWholesalePageVariants(operatorWholesaleNavItems),
      promoter: createWholesalePageVariants(salesWholesaleNavItems),
      recruiter: createWholesalePageVariants(recruiterWholesaleNavItems),
      salesman: createWholesalePageVariants(salesmanWholesaleNavItems),
    },
  },
];

const enabledBusinessKeySet = new Set<string>(companyConfig.enabledBusinessKeys);

export const workspaceBusinessModules = allWorkspaceBusinessModules.filter(
  (module) => enabledBusinessKeySet.has(module.key),
);

export const workspaceBusinessKeys = workspaceBusinessModules.map(
  (module) => module.key,
) as WorkspaceBusinessKey[];

export function getWorkspaceBusinessModule(
  business: WorkspaceBusinessKey,
): WorkspaceBusinessModule | null {
  return (
    workspaceBusinessModules.find((module) => module.key === business) ?? null
  );
}

export function getWorkspaceBusinessNavGroups(
  routeSegment: WorkspaceRouteSegment,
): WorkspaceNavGroup[] {
  return workspaceBusinessModules
    .map((module) => {
      const navItems: readonly WorkspaceNavItem[] =
        module.navItemsByRouteSegment[routeSegment] ?? [];

      return {
        business: module.key,
        labelKey: module.labelKey,
        navItems: navItems.map((item) => ({
          ...item,
          business: item.business ?? module.key,
        })),
      };
    })
    .filter((group) => group.navItems.length > 0);
}

export function getWorkspaceBusinessPageVariants(
  routeSegment: WorkspaceRouteSegment,
): WorkspaceBusinessPageVariants {
  return workspaceBusinessModules.reduce<WorkspaceBusinessPageVariants>(
    (variants, module) => ({
      ...variants,
      ...(module.pageVariantsByRouteSegment[routeSegment] ?? {}),
    }),
    {},
  );
}

export function getWorkspaceWholesalePageVariants(
  routeSegment: WorkspaceRouteSegment,
): Partial<Record<WorkspaceWholesaleSectionKey, true>> | undefined {
  const wholesaleModule = getWorkspaceBusinessModule("wholesale");

  return wholesaleModule?.wholesalePageVariantsByRouteSegment?.[routeSegment];
}

export function getWorkspaceBusinessSettingsModules() {
  return workspaceBusinessModules
    .map((module) => module.settings)
    .filter((settings): settings is WorkspaceBusinessSettingsModule =>
      Boolean(settings),
    );
}

export function getWorkspaceBusinessSettingsModule(
  business: WorkspaceBusinessKey,
) {
  return getWorkspaceBusinessSettingsModules().find(
    (module) => module.business === business,
  );
}

function createWholesaleNavItems(
  entries: readonly [WorkspaceWholesaleSectionKey, WorkspaceNavLabelKey][],
) {
  return entries.map(([segment, labelKey]) => ({
    business: "wholesale" as const,
    labelKey,
    segment,
  })) satisfies WorkspaceNavItem[];
}

function createWholesalePageVariants(
  navItems: readonly WorkspaceNavItem[],
): Partial<Record<WorkspaceWholesaleSectionKey, true>> {
  return Object.fromEntries(
    navItems.map((item) => [item.segment, true]),
  ) as Partial<Record<WorkspaceWholesaleSectionKey, true>>;
}
