import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { ScopedIntlProvider } from "@/components/i18n/scoped-intl-provider";
import { getAuthShellCopy } from "@/lib/auth-shell-content";
import { redirectAuthenticatedUserToWorkspace } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ForgotPasswordPage");

  return {
    title: t("title"),
  };
}

export default async function ForgotPasswordPage() {
  const [, t, authShellCopy] = await Promise.all([
    // 入口代理查询暂时失败时由页面再次确认，保证已登录账号不会停留在认证页面或使用旧角色跳转。
    redirectAuthenticatedUserToWorkspace(),
    getTranslations("ForgotPasswordPage"),
    getAuthShellCopy(),
  ]);

  return (
    <ScopedIntlProvider namespaces={["LanguageToggle", "ForgotPasswordForm"]}>
      <AuthShell
        copy={authShellCopy}
        footer={{
          linkHref: "/login",
          linkLabel: t("footerLinkLabel"),
          prompt: t("footerPrompt"),
        }}
        form={{ title: t("headerTitle") }}
        hero={{
          description: t("asideDescription"),
          note: {
            description: t("noteDescription"),
            title: t("noteTitle"),
          },
          title: t("asideTitle"),
        }}
        mode="login"
      >
        <ForgotPasswordForm />
      </AuthShell>
    </ScopedIntlProvider>
  );
}
