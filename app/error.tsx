"use client";

import { useEffect, useState } from "react";

import { PageReveal } from "@/components/motion/page-reveal";
import { Button } from "@/components/ui/button";
import { PublicStateCard } from "@/components/ui/public-state-card";
import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/lib/locale";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
};

const ERROR_BOUNDARY_COPY = {
  zh: {
    badge: "页面提示",
    title: "当前页面暂时打不开",
    description: "页面可能闲置了较长时间，重新打开后即可继续使用。",
    reopen: "重新打开页面",
  },
  en: {
    badge: "Page notice",
    title: "This page is temporarily unavailable",
    description:
      "This page may have been idle for a while. Reopen it to continue.",
    reopen: "Reopen page",
  },
} as const satisfies Record<
  Locale,
  {
    badge: string;
    title: string;
    description: string;
    reopen: string;
  }
>;

export default function Error({ error }: ErrorPageProps) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setLocale(getPreferredErrorLocale());
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const copy = ERROR_BOUNDARY_COPY[locale];
  const reopenPage = () => {
    // 全局异常通常包含已经失效的登录页数据或页面资源，局部重绘仍会复用同一份旧状态。
    // 整页重新打开会让服务端先恢复登录状态，再返回当前板块，因此按钮必须执行真正的页面加载。
    window.location.reload();
  };

  return (
    <PageReveal className="min-h-screen">
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
        <PublicStateCard
          actions={<Button onClick={reopenPage}>{copy.reopen}</Button>}
          badge={copy.badge}
          description={copy.description}
          title={copy.title}
        />
      </main>
    </PageReveal>
  );
}

function getPreferredErrorLocale(): Locale {
  if (typeof document !== "undefined") {
    const documentLanguage = document.documentElement.lang.trim().toLowerCase();

    if (documentLanguage.length > 0) {
      return normalizeLocale(documentLanguage.startsWith("en") ? "en" : "zh");
    }
  }

  if (typeof navigator !== "undefined") {
    return normalizeLocale(
      navigator.language.toLowerCase().startsWith("en") ? "en" : "zh",
    );
  }

  return DEFAULT_LOCALE;
}
