import type {
  WorkspaceBusinessModule,
  WorkspaceNavItem,
} from "./workspace-business-modules";

const managerNavItems = [
  { segment: "referrals", labelKey: "referrals" },
  { segment: "team", labelKey: "team" },
  { segment: "tasks", labelKey: "tasks" },
] as const satisfies readonly WorkspaceNavItem[];

const staffReadNavItems = [
  { segment: "referrals", labelKey: "referrals" },
  { segment: "team", labelKey: "team" },
  { segment: "tasks", labelKey: "tasks" },
] as const satisfies readonly WorkspaceNavItem[];

const clientNavItems = [
  { segment: "orders", labelKey: "orders" },
  { segment: "referrals", labelKey: "referrals" },
] as const satisfies readonly WorkspaceNavItem[];

const recruiterNavItems = [
  { segment: "referrals", labelKey: "referrals" },
  { segment: "tasks", labelKey: "tasks" },
] as const satisfies readonly WorkspaceNavItem[];

const sharedSalesNavItems = [
  { segment: "orders", labelKey: "orders" },
  { segment: "customers", labelKey: "customers" },
  { segment: "vip", labelKey: "vip" },
  { segment: "referrals", labelKey: "referrals" },
  { segment: "team", labelKey: "team" },
  { segment: "commission", labelKey: "commission" },
  { segment: "tasks", labelKey: "tasks" },
] as const satisfies readonly WorkspaceNavItem[];

const adminNavItems = [
  { segment: "orders", labelKey: "orders" },
  { segment: "customers", labelKey: "customers" },
  { segment: "referrals", labelKey: "referrals" },
  { segment: "team", labelKey: "team" },
  { segment: "people", labelKey: "people" },
  { segment: "vip", labelKey: "vip" },
  { segment: "records", labelKey: "records" },
  { segment: "commission", labelKey: "commission" },
  { segment: "tasks", labelKey: "tasks" },
  { segment: "settings", labelKey: "businessSettings" },
] as const satisfies readonly WorkspaceNavItem[];

/** 旅游业务只声明自身入口和页面能力；共享注册器负责启用与查询。 */
export const tourismWorkspaceBusinessModule: WorkspaceBusinessModule = {
  key: "tourism",
  labelKey: "tourism",
  navItemsByRouteSegment: {
    admin: adminNavItems,
    client: clientNavItems,
    manager: managerNavItems,
    operator: staffReadNavItems,
    promoter: sharedSalesNavItems,
    recruiter: recruiterNavItems,
    salesman: sharedSalesNavItems,
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
      settings: true,
      tasks: "admin",
      team: true,
      vip: "admin",
    },
    client: { orders: "client", referrals: true },
    manager: { referrals: true, tasks: "staff", team: true },
    operator: { referrals: true, tasks: "staff", team: true },
    promoter: {
      commission: "salesman",
      customers: "salesman",
      orders: "salesman",
      referrals: true,
      tasks: "staff",
      team: true,
      vip: "salesman",
    },
    recruiter: { referrals: true, tasks: "staff" },
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
};
