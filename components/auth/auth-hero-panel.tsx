import Image from "next/image";

import { ShieldCheck, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { UiMessage } from "@/components/i18n/ui-message";
import type { AuthShellCopy } from "@/lib/auth-shell-content";
import { cn } from "@/lib/utils";
import authHeroImage from "@/public/images/zhang-kaiyv-Xqf2ph7vrgc-unsplash.jpg";

import type { AuthHeroContent, AuthShellMode } from "./auth-shell-types";

/** 桌面认证英雄区只负责品牌说明与装饰图片，不读取认证状态或表单数据。 */
export function AuthHeroPanel({
  copy,
  hero,
  mode,
}: {
  copy: AuthShellCopy;
  hero: AuthHeroContent;
  mode: AuthShellMode;
}) {
  const isRegister = mode === "register";

  return (
    <aside
      className="relative hidden min-h-[820px] overflow-hidden bg-sidebar px-12 py-10 text-content-strong lg:flex lg:flex-col lg:justify-between"
      data-auth-region="information"
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <Image
          alt=""
          className={cn(
            "object-cover object-center",
            isRegister
              ? "opacity-[0.82] saturate-[1.02]"
              : "opacity-[0.9] saturate-[1.08]",
          )}
          fill
          placeholder="blur"
          priority={!isRegister}
          quality={78}
          sizes="(min-width: 1024px) 46vw, 0vw"
          src={authHeroImage}
        />
      </div>
      <div aria-hidden="true" className="auth-aside-overlay absolute inset-0" />
      <div aria-hidden="true" className="auth-grid-dots absolute inset-0 opacity-65" />
      <div
        aria-hidden="true"
        className="auth-aside-glow absolute inset-x-0 bottom-0 h-56"
      />

      <div className="relative z-10 min-w-0 max-w-full">
        <div className="mb-16 flex min-w-0 max-w-full items-center gap-3">
          <BrandMark priority />
          <div className="min-w-0 space-y-0.5">
            <p className="break-words text-xl font-bold tracking-tight text-primary [overflow-wrap:anywhere]">
              {copy.brandTitle}
            </p>
            <p className="font-label break-words text-[11px] tracking-[0.2em] text-content-subtle uppercase [overflow-wrap:anywhere]">
              {copy.brandSubtitle}
            </p>
          </div>
        </div>

        <div className="max-w-[420px] min-w-0 space-y-8">
          <h1 className="max-w-[420px] break-words text-balance text-[56px] leading-[1.08] font-bold tracking-normal [overflow-wrap:anywhere]">
            {hero.title}
          </h1>
          <p className="max-w-[330px] break-words text-[16px] leading-8 text-content-muted [overflow-wrap:anywhere]">
            {hero.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 min-w-0 max-w-full space-y-6">
        <div className="max-w-[360px] min-w-0 rounded-[28px] border border-border-subtle bg-surface-panel p-6 shadow-[var(--surface-shadow-panel)] backdrop-blur-md">
          <div className="mb-4 flex min-w-0 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-status-success-soft text-status-success">
              {isRegister ? (
                <ShieldCheck aria-hidden="true" className="size-5" />
              ) : (
                <Sparkles aria-hidden="true" className="size-5" />
              )}
            </div>
            <p className="min-w-0 break-words text-sm font-semibold tracking-[0.08em] text-content-strong [overflow-wrap:anywhere]">
              {hero.note.title}
            </p>
          </div>
          <p className="break-words text-sm leading-7 text-content-muted [overflow-wrap:anywhere]">
            {hero.note.description}
          </p>
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-4 font-label text-[11px] tracking-[0.18em] text-content-subtle uppercase">
          <span><UiMessage id="shared.precision" /></span>
          <span className="h-px w-8 bg-border" />
          <span><UiMessage id="shared.elegance" /></span>
          <span className="h-px w-8 bg-border" />
          <span><UiMessage id="shared.humanity" /></span>
        </div>
      </div>
    </aside>
  );
}
