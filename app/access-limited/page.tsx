import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { PageReveal } from "@/components/motion/page-reveal";
import { buttonVariants } from "@/components/ui/button-variants";
import { PublicStateCard } from "@/components/ui/public-state-card";
import { getDefaultSignedInPathForRole } from "@/lib/auth-routing";
import { normalizeLocale } from "@/lib/locale";
import { assertWorkspaceRole, getServerAuthContext } from "@/lib/server-auth";
import { cn } from "@/lib/utils";

const SIGN_OUT_TO_LOGIN_PATH = "/auth/sign-out?next=%2Flogin";

export const metadata: Metadata = {
  title: "访问范围受限",
};

export default async function AccessLimitedPage() {
  const [{ role, status, userId }, localeValue] = await Promise.all([
    getServerAuthContext(),
    getLocale(),
  ]);

  // 只有已验证且仍在使用中的账号保留会话；失效或停用账号继续统一清理 Cookie。
  if (!userId || status !== "active") {
    redirect(SIGN_OUT_TO_LOGIN_PATH);
  }

  // 返回入口只能使用数据库确认过的角色；角色缺失时进入统一错误界面，不能误导到客户首页。
  assertWorkspaceRole(role);

  const locale = normalizeLocale(localeValue);
  const copy =
    locale === "en"
      ? {
          action: "Back to my workspace",
          badge: "Access limited",
          description:
            "Your account is still signed in. Return to your workspace to continue.",
          title: "This page is outside your work area",
        }
      : {
          action: "返回我的首页",
          badge: "访问范围受限",
          description:
            "你的登录状态仍然保留，可以返回自己的工作台继续处理事情。",
          title: "这个页面不在你的工作范围内",
        };

  return (
    <PageReveal className="min-h-screen">
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
        <PublicStateCard
          actions={
            <Link
              className={cn(
                buttonVariants({ size: "default", variant: "primary" }),
              )}
              href={getDefaultSignedInPathForRole(role)}
            >
              {copy.action}
            </Link>
          }
          badge={copy.badge}
          badgeTone="warning"
          description={copy.description}
          title={copy.title}
        />
      </main>
    </PageReveal>
  );
}
