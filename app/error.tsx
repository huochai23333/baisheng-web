"use client";

import { useEffect, useState } from "react";

import { PageReveal } from "@/components/motion/page-reveal";
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
    description: "This page may have been idle for a while. Reopen it to continue.",
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
        <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f6f2ea_0%,#f3f7fa_48%,#edf2f6_100%)] px-6 py-16">
          <section className="w-full max-w-xl rounded-[32px] border border-white/90 bg-white/90 p-8 shadow-[0_24px_80px_rgba(35,49,58,0.12)] sm:p-10">
            <span className="inline-flex rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-semibold text-[#486782]">
              {copy.badge}
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#23313a]">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#69747d]">
              {copy.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#486782] px-5 text-sm font-semibold text-white transition hover:bg-[#3e5f79]"
                onClick={reopenPage}
                type="button"
              >
                {copy.reopen}
              </button>
            </div>
          </section>
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
