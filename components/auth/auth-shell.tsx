import type { ReactNode } from "react";

import Image from "next/image";
import { ShieldCheck, Sparkles } from "lucide-react";

import { AuthRouteLink } from "@/components/auth/auth-route-link";
import { BrandMark } from "@/components/brand/brand-mark";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import type { AuthShellCopy } from "@/lib/auth-shell-content";
import { cn } from "@/lib/utils";

const AUTH_SHELL_IMAGE_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAeABQDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQBBQYD/8QAHRAAAgIDAQEBAAAAAAAAAAAAAAECAwQREiEiMf/EABgBAAMBAQAAAAAAAAAAAAAAAAEEBQID/8QAGhEAAwEBAQEAAAAAAAAAAAAAAAEhAgMSEf/aAAwDAQACEQMRAD8Asaqxmv58IUoKHWwhNT/GSVlp/UNujKjtAcneo+MCgusFHzpnMXMndRzv0YryLKlsosayWPfynsYys+cXpIDxYds7lLSed1LbYGeeXNsDXlg9ZP/Z";

type AuthShellProps = {
  copy: AuthShellCopy;
  mode: "login" | "register";
  asideTitle: ReactNode;
  asideDescription: string;
  noteTitle: string;
  noteDescription: string;
  headerEyebrow?: string;
  headerTitle: string;
  headerDescription?: string;
  footerPrompt: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  children: ReactNode;
};

export function AuthShell({
  copy,
  mode,
  asideTitle,
  asideDescription,
  noteTitle,
  noteDescription,
  headerEyebrow,
  headerTitle,
  headerDescription,
  footerPrompt,
  footerLinkHref,
  footerLinkLabel,
  children,
}: AuthShellProps) {
  const isRegister = mode === "register";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf9f7]">
      <main className="relative flex min-h-screen items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
        <div className="auth-card-surface grid w-full max-w-[1360px] overflow-hidden rounded-[34px] border border-white/75 shadow-[0_24px_80px_rgba(86,103,119,0.12)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <aside className="relative hidden min-h-[820px] overflow-hidden bg-[#f4f3f1] px-12 py-10 text-[#1f2a32] lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                alt=""
                className={cn(
                  "object-cover object-center",
                  isRegister ? "opacity-[0.82] saturate-[1.02]" : "opacity-[0.9] saturate-[1.08]",
                )}
                fill
                blurDataURL={AUTH_SHELL_IMAGE_BLUR_DATA_URL}
                fetchPriority={isRegister ? "auto" : "high"}
                loading={isRegister ? "lazy" : "eager"}
                placeholder="blur"
                quality={78}
                sizes="(min-width: 1024px) 46vw, 0vw"
                src="/images/zhang-kaiyv-Xqf2ph7vrgc-unsplash.jpg"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,243,241,0.34),rgba(244,243,241,0.46),rgba(244,243,241,0.66))]" />
            <div className="auth-grid-dots absolute inset-0 opacity-65" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,rgba(72,103,130,0.07),transparent_60%)]" />

            <div className="relative z-10 min-w-0 max-w-full">
              <div className="mb-16 flex min-w-0 max-w-full items-center gap-3">
                <BrandMark priority />
                <div className="min-w-0 space-y-0.5">
                  <p className="break-words text-xl font-bold tracking-tight text-[#486782] [overflow-wrap:anywhere]">
                    {copy.brandTitle}
                  </p>
                  <p className="font-label break-words text-[11px] tracking-[0.2em] text-[#8e99a3] uppercase [overflow-wrap:anywhere]">
                    {copy.brandSubtitle}
                  </p>
                </div>
              </div>

              <div className="max-w-[420px] min-w-0 space-y-8">
                <h1 className="max-w-[420px] break-words text-balance text-[56px] leading-[1.08] font-bold tracking-normal [overflow-wrap:anywhere]">
                  {asideTitle}
                </h1>
                <p className="max-w-[330px] break-words text-[16px] leading-8 text-[#66727d] [overflow-wrap:anywhere]">
                  {asideDescription}
                </p>
              </div>
            </div>

            <div className="relative z-10 min-w-0 max-w-full space-y-6">
              <div className="max-w-[360px] min-w-0 rounded-[28px] border border-[#e4e2df] bg-white/80 p-6 shadow-[0_12px_36px_rgba(120,135,148,0.08)]">
                <div className="mb-4 flex min-w-0 items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#eef3ef] text-[#4c7259]">
                    {isRegister ? (
                      <ShieldCheck className="size-5" />
                    ) : (
                      <Sparkles className="size-5" />
                    )}
                  </div>
                  <p className="min-w-0 break-words text-sm font-semibold tracking-[0.08em] text-[#33424d] [overflow-wrap:anywhere]">
                    {noteTitle}
                  </p>
                </div>
                <p className="break-words text-sm leading-7 text-[#6f7980] [overflow-wrap:anywhere]">
                  {noteDescription}
                </p>
              </div>

              <div className="flex max-w-full flex-wrap items-center gap-4 font-label text-[11px] tracking-[0.18em] text-[#97a0a8] uppercase">
                <span>Precision</span>
                <span className="h-px w-8 bg-[#d7dadc]" />
                <span>Elegance</span>
                <span className="h-px w-8 bg-[#d7dadc]" />
                <span>Humanity</span>
              </div>
            </div>
          </aside>

          <section className="relative flex min-h-[760px] min-w-0 flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(250,249,247,0.94))]">
            <div className="mx-auto flex min-w-0 w-full max-w-[580px] flex-1 flex-col px-6 py-8 sm:px-10 lg:px-14 lg:py-16">
              <div className="mb-10 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3 lg:hidden">
                  <BrandMark priority />
                  <div className="min-w-0 space-y-0.5">
                    <p className="break-words text-xl font-bold tracking-tight text-[#486782] [overflow-wrap:anywhere]">
                      {copy.brandTitle}
                    </p>
                    <p className="font-label break-words text-[11px] tracking-[0.2em] text-[#8e99a3] uppercase [overflow-wrap:anywhere]">
                      {copy.brandSubtitle}
                    </p>
                  </div>
                </div>

                <div className="ml-auto">
                  <LanguageToggle />
                </div>
              </div>

              <header className="mb-10 space-y-3">
                <p className="font-label text-[11px] font-semibold tracking-[0.22em] text-[#5d7388] uppercase">
                  {headerEyebrow ?? copy.secureAccess}
                </p>
                <h2 className="text-[40px] leading-[1.08] font-bold tracking-[-0.04em] text-[#21303a] sm:text-[46px]">
                  {headerTitle}
                </h2>
                {headerDescription ? (
                  <p className="max-w-[420px] text-[15px] leading-7 text-[#68737d]">
                    {headerDescription}
                  </p>
                ) : null}
              </header>

              <div className="flex-1">{children}</div>

              <div className="border-t border-[#dfdfdc] pt-8 text-center">
                <p className="text-sm text-[#6d767c]">
                  {footerPrompt}{" "}
                  <AuthRouteLink
                    href={footerLinkHref}
                    className="font-semibold text-[#486782] transition-colors hover:text-[#36536a]"
                  >
                    {footerLinkLabel}
                  </AuthRouteLink>
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-4 pt-12 text-xs text-[#97a0a8] sm:flex-row sm:items-center sm:justify-between">
                <p>{copy.copyright}</p>
                <LegalFooterLinks
                  className="justify-center sm:justify-end"
                  copy={copy}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
