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
  // UiText、DatePicker 都是跨工作台复用的基础界面文案。所有局部消息提供器都带上它们，
  // 这样页面不需要知道日期控件内部有哪些按钮和校验提示，也不会遗漏动态弹层文案。
  const scopedNamespaces = Array.from(
    new Set([...namespaces, "DashboardFramework", "DatePicker", "UiText"]),
  );
  const messages = await getScopedMessages(locale, scopedNamespaces);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
