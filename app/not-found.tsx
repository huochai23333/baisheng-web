import Link from "next/link";

import { getTranslations } from "next-intl/server";

import { PageReveal } from "@/components/motion/page-reveal";
import { buttonVariants } from "@/components/ui/button-variants";
import { PublicStateCard } from "@/components/ui/public-state-card";
import { cn } from "@/lib/utils";

export default async function NotFound() {
  const t = await getTranslations("NotFoundPage");

  return (
    <PageReveal className="min-h-screen">
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
        <PublicStateCard
          actions={
            <Link
              className={cn(
                buttonVariants({ size: "default", variant: "primary" }),
              )}
              href="/"
            >
              {t("primaryAction")}
            </Link>
          }
          badge={t("badge")}
          description={t("description")}
          title={t("title")}
        />
      </main>
    </PageReveal>
  );
}
