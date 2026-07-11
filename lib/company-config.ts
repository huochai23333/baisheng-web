import type { Locale } from "./locale";

export const companyConfig = {
  defaultPublicOrigin: "https://account.pt5china.com",
  enabledBusinessKeys: ["tourism", "wholesale"],
  logoSrc: "/images/pt5-logo.png",
  supportEmail: "support@pt5china.com",
  text: {
    en: {
      accountName: "Baisheng account",
      assistantName: "Baisheng Assistant",
      brandSubtitle: "Curated Management Workspace",
      copyright: "© 2026 Baisheng Management System",
      inviteAccessDescription:
        "An invite code is optional. Enter one to connect with your referrer, or continue directly without one.",
      productDescription:
        "Sign-in, registration and workspace flows for the Baisheng Management System.",
      productName: "Baisheng Management System",
      registerAsideTitle: "Request Access to<br></br>Baisheng Workspace",
      registerHeaderTitle: "Create Your Account",
    },
    zh: {
      accountName: "柏盛账号",
      assistantName: "柏盛助手",
      brandSubtitle: "精选管理工作台",
      copyright: "© 2026 柏盛管理系统",
      inviteAccessDescription:
        "邀请码为选填项。有邀请码时可关联推荐人，没有邀请码也可以直接完成注册。",
      productDescription: "柏盛管理系统的登录、注册与业务工作台。",
      productName: "柏盛管理系统",
      registerAsideTitle: "申请加入<br></br>柏盛工作台",
      registerHeaderTitle: "注册柏盛账号",
    },
  },
} as const;

export type EnabledCompanyBusinessKey =
  (typeof companyConfig.enabledBusinessKeys)[number];

export type CompanyText = (typeof companyConfig.text)[Locale];

export function getCompanyText(locale: Locale): CompanyText {
  return companyConfig.text[locale];
}

export function getCompanyPublicOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || companyConfig.defaultPublicOrigin;
}
