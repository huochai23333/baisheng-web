import type { Metadata } from "next";
import { Fragment } from "react";

import { getLocale, getTranslations } from "next-intl/server";

import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { ScopedIntlProvider } from "@/components/i18n/scoped-intl-provider";
import { getAuthShellCopy } from "@/lib/auth-shell-content";
import { getCompanyText } from "@/lib/company-config";
import { normalizeLocale } from "@/lib/locale";
import { redirectAuthenticatedUserToWorkspace } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RegisterPage");

  return {
    title: t("title"),
  };
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[] }>;
}) {
  const [, params, t, authShellCopy, locale] = await Promise.all([
    redirectAuthenticatedUserToWorkspace(),
    searchParams,
    getTranslations("RegisterPage"),
    getAuthShellCopy(),
    getLocale(),
  ]);
  const initialInviteCode = normalizeInviteCode(firstSearchParam(params.ref));
  const companyText = getCompanyText(normalizeLocale(locale));

  return (
    <ScopedIntlProvider namespaces={["LanguageToggle", "RegisterForm"]}>
      <AuthShell
        copy={authShellCopy}
        footer={{
          linkHref: "/login",
          linkLabel: t("footerLinkLabel"),
          prompt: t("footerPrompt"),
        }}
        form={{
          description: t("headerDescription"),
          title: companyText.registerHeaderTitle,
        }}
        hero={{
          compactNote: {
            description: companyText.inviteAccessDescription,
            title: t("mobileNoteTitle"),
          },
          description: t("asideDescription"),
          note: {
            description: companyText.inviteAccessDescription,
            title: t("noteTitle"),
          },
          title: renderConfiguredTitle(companyText.registerAsideTitle),
        }}
        mode="register"
      >
        <RegisterForm initialInviteCode={initialInviteCode} />
      </AuthShell>
    </ScopedIntlProvider>
  );
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeInviteCode(value: string | undefined) {
  return value?.trim().toUpperCase();
}

function renderConfiguredTitle(value: string) {
  return value.split("<br></br>").map((part, index) =>
    index === 0 ? (
      part
    ) : (
      <Fragment key={`${part}-${index}`}>
        <br />
        {part}
      </Fragment>
    ),
  );
}
