import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { getDefaultSignedInPathForRole } from "@/lib/auth-routing";
import { normalizeLocale } from "@/lib/locale";
import { getServerAuthContext } from "@/lib/server-auth";

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

  const locale = normalizeLocale(localeValue);
  const copy =
    locale === "en"
      ? {
          action: "Back to my workspace",
          badge: "Access limited",
          description: "Your account is still signed in. Return to your workspace to continue.",
          title: "This page is outside your work area",
        }
      : {
          action: "返回我的首页",
          badge: "访问范围受限",
          description: "你的登录状态仍然保留，可以返回自己的工作台继续处理事情。",
          title: "这个页面不在你的工作范围内",
        };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f6f2ea_0%,#f3f7fa_48%,#edf2f6_100%)] px-6 py-16">
      <section className="w-full max-w-xl rounded-[32px] border border-white/90 bg-white/90 p-8 shadow-[0_24px_80px_rgba(35,49,58,0.12)] sm:p-10">
        <span className="inline-flex rounded-full bg-[#f4eee3] px-3 py-1 text-xs font-semibold text-[#806947]">
          {copy.badge}
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#23313a]">
          {copy.title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#69747d]">{copy.description}</p>
        <div className="mt-8">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#486782] px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#3e5f79] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486782]"
            href={getDefaultSignedInPathForRole(role)}
          >
            {copy.action}
          </Link>
        </div>
      </section>
    </main>
  );
}
