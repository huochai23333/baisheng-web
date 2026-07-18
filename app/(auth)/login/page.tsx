import type { Metadata } from "next";
import { Suspense } from "react";

import { getLocale, getTranslations } from "next-intl/server";

import { LoginAnnouncementPanel } from "@/components/auth/login-announcement-panel";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { ScopedIntlProvider } from "@/components/i18n/scoped-intl-provider";
import { getAuthShellCopy } from "@/lib/auth-shell-content";
import { redirectAuthenticatedUserToWorkspace } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LoginPage");

  return {
    title: t("title"),
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordReset?: string; registered?: string }>;
}) {
  const [, params, t, authShellCopy, locale] = await Promise.all([
    redirectAuthenticatedUserToWorkspace(),
    searchParams,
    getTranslations("LoginPage"),
    getAuthShellCopy(),
    getLocale(),
  ]);

  return (
    <ScopedIntlProvider namespaces={["LanguageToggle", "LoginForm"]}>
      <AuthShell
        copy={authShellCopy}
        footer={{
          linkHref: "/register",
          linkLabel: t("footerLinkLabel"),
          prompt: t("footerPrompt"),
        }}
        form={{
          description: t("headerDescription"),
          title: t("headerTitle"),
        }}
        hero={{
          compactNote: {
            description: t("mobileNoteDescription"),
            title: t("mobileNoteTitle"),
          },
          description: t("asideDescription"),
          note: {
            description: t("noteDescription"),
            title: t("noteTitle"),
          },
          title: t.rich("asideTitle", {
            br: () => <br />,
          }),
        }}
        mode="login"
      >
        <LoginForm
          passwordReset={params.passwordReset === "1"}
          registered={params.registered === "1"}
        />

        <Suspense fallback={null}>
          <LoginAnnouncementPanel
            copy={{ title: t("announcementTitle") }}
            locale={locale}
          />
        </Suspense>
      </AuthShell>
    </ScopedIntlProvider>
  );
}
