"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { Languages, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  getDocumentLanguage,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/lib/locale";
import { useStaleFocusRecovery } from "@/lib/use-stale-focus-recovery";

export function LanguageToggle() {
  const router = useRouter();
  const shouldUseFullPageLoad = useStaleFocusRecovery();
  const locale = useLocale() as Locale;
  const t = useTranslations("LanguageToggle");
  const [isPending, startTransition] = useTransition();
  const [switchingLocale, setSwitchingLocale] = useState<Locale | null>(null);
  const activeSwitchingLocale =
    switchingLocale && switchingLocale !== locale ? switchingLocale : null;
  const isSwitching = Boolean(activeSwitchingLocale) || isPending;

  const handleSwitch = (nextLocale: Locale) => {
    if (nextLocale === locale || isSwitching) {
      return;
    }

    setSwitchingLocale(nextLocale);
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.localStorage.setItem(LOCALE_COOKIE_NAME, nextLocale);
    document.documentElement.lang = getDocumentLanguage(nextLocale);

    if (shouldUseFullPageLoad()) {
      window.location.reload();
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <div
        aria-busy={isSwitching}
        aria-live="polite"
        className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-white/88 p-1 shadow-[var(--surface-shadow-interactive)] backdrop-blur"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-primary">
          {isSwitching ? (
            <LoaderCircle className="size-4.5 animate-spin" />
          ) : (
            <Languages className="size-4.5" />
          )}
        </span>
        <Button
          className="min-w-14 rounded-full px-3"
          disabled={isSwitching}
          onClick={() => handleSwitch("zh")}
          size="compact"
          type="button"
          variant={locale === "zh" ? "primary" : "ghost"}
        >
          {activeSwitchingLocale === "zh" ? (
            <>
              <LoaderCircle className="size-3.5 animate-spin" />
              {t("switching")}
            </>
          ) : (
            t("zh")
          )}
        </Button>
        <Button
          className="min-w-14 rounded-full px-3"
          disabled={isSwitching}
          onClick={() => handleSwitch("en")}
          size="compact"
          type="button"
          variant={locale === "en" ? "primary" : "ghost"}
        >
          {activeSwitchingLocale === "en" ? (
            <>
              <LoaderCircle className="size-3.5 animate-spin" />
              {t("switching")}
            </>
          ) : (
            t("en")
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isSwitching ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex cursor-wait items-start justify-end bg-transparent p-4 sm:p-6"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border-subtle bg-white/94 px-4 text-sm font-semibold text-primary shadow-[var(--surface-shadow-interactive)] backdrop-blur"
              exit={{ opacity: 0, y: -6 }}
              initial={{ opacity: 0, y: -6 }}
              role="status"
            >
              <LoaderCircle className="size-4 animate-spin" />
              {t("switching")}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
