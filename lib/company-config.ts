import type { Locale } from "./locale";

export const companyConfig = {
  defaultPublicOrigin: "https://account.pt5global.com",
  // 旧统一系统本次发布只开放批发业务；旅游恢复必须同时配套新的数据库迁移和完整验收。
  enabledBusinessKeys: ["wholesale"],
  logoSrc: "/images/pt5-logo.png",
  supportEmail: "support@pt5global.com",
  text: {
    en: {
      accountName: "PT5 account",
      assistantName: "PT5 Assistant",
      brandSubtitle: "Curated Management Workspace",
      copyright: "© 2026 PT5 System",
      inviteAccessDescription:
        "An invite code is optional. Enter one to connect with your referrer, or continue directly without one.",
      productDescription:
        "Sign-in, registration and workspace flows for the PT5 System.",
      productName: "PT5 System",
      registerAsideTitle: "Request Access to<br></br>PT5 Workspace",
      registerHeaderTitle: "Create Your Account",
    },
    zh: {
      accountName: "PT5 账号",
      assistantName: "PT5 助手",
      brandSubtitle: "精选管理工作台",
      copyright: "© 2026 PT5 系统",
      inviteAccessDescription:
        "邀请码为选填项。有邀请码时可关联推荐人，没有邀请码也可以直接完成注册。",
      productDescription: "PT5 系统的登录、注册与业务工作台。",
      productName: "PT5 系统",
      registerAsideTitle: "申请加入<br></br>PT5 工作台",
      registerHeaderTitle: "注册 PT5 账号",
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
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredOrigin) {
    return companyConfig.defaultPublicOrigin;
  }

  try {
    const url = new URL(configuredOrigin.trim());

    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return companyConfig.defaultPublicOrigin;
    }

    return url.origin;
  } catch {
    // 部署平台中的地址即使填写错误，也不能让登录、邮件确认等入口整体返回 500。
    return companyConfig.defaultPublicOrigin;
  }
}
