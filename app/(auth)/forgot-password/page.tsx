import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { ScopedIntlProvider } from "@/components/i18n/scoped-intl-provider";
import { getAuthShellCopy } from "@/lib/auth-shell-content";
import { getPasswordRecoverySessionState } from "@/lib/password-recovery-session";
import { redirectAuthenticatedUserToWorkspace } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ForgotPasswordPage");

  return {
    title: t("title"),
  };
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    type?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const recoveryRequested = firstSearchParam(params.type) === "recovery";
  const recoveryInvalid = firstSearchParam(params.error) === "invalid";
  const recoverySessionState = recoveryRequested && !recoveryInvalid
    ? await getPasswordRecoverySessionState()
    : "missing";

  if (!recoveryRequested) {
    // 普通找回密码入口仍不向已登录账号展示；邮件恢复入口由 recovery 会话单独验证。
    await redirectAuthenticatedUserToWorkspace();
  } else if (!recoveryInvalid && recoverySessionState === "signed-in") {
    // 普通登录会话即使手动拼接 recovery 参数，也不能绕过邮箱验证进入改密表单。
    await redirectAuthenticatedUserToWorkspace();
  }

  const [t, authShellCopy] = await Promise.all([
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
        <ForgotPasswordForm
          initialRecoveryState={
            recoverySessionState === "verified"
              ? "verified"
              : recoveryRequested
                ? "invalid"
                : "request"
          }
        />
      </AuthShell>
    </ScopedIntlProvider>
  );
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
