import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

import { getScopedMessages } from "@/lib/i18n-messages";
import type { Locale } from "@/lib/locale";

type ScopedIntlProviderProps = {
  children: ReactNode;
  namespaces: readonly string[];
};

export async function ScopedIntlProvider({
  children,
  namespaces,
}: ScopedIntlProviderProps) {
  const locale = (await getLocale()) as Locale;
  // UiText 保存跨工作台复用的短标签。所有局部消息提供器都带上它，
  // 这样表格、筛选器和弹窗无需为了几个短词重复扩大各自的消息范围。
  const scopedNamespaces = Array.from(new Set([...namespaces, "UiText"]));
  const messages = await getScopedMessages(locale, scopedNamespaces);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
