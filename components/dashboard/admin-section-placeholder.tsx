"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardPageShell } from "./dashboard-page-shell";

type AdminSectionPlaceholderProps = {
  title: string;
  description: string;
  homeHref?: string;
};

export function AdminSectionPlaceholder({
  title,
  description,
  homeHref = "/admin/my",
}: AdminSectionPlaceholderProps) {
  const t = useTranslations("AdminSectionPlaceholder");

  return (
    <DashboardPageShell className="gap-6">
      <div className="rounded-surface-panel border border-surface-panel-border bg-surface-panel p-8 shadow-surface-interactive backdrop-blur">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-inset text-status-success">
          <Sparkles className="size-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-content-strong">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-8 text-content-muted">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={homeHref}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            {t("viewMyPage")}
            <ArrowRight className="size-4" />
          </Link>
          <div className="rounded-full border border-border-subtle bg-surface-inset px-4 py-3 text-sm text-content-muted">
            {t("badge")}
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}
