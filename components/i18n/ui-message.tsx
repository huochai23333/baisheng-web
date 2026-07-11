"use client";

import { useTranslations } from "next-intl";

type UiMessageProps = {
  id: string;
};

/**
 * 渲染已经迁移到消息文件中的短界面文案。
 *
 * 这个小组件主要用于表头、选项和状态标签。把这些文字统一放进消息文件后，
 * 中英文切换会使用同一套消息键，也能避免在表格组件里重复编写语言判断。
 */
export function UiMessage({ id }: UiMessageProps) {
  const t = useTranslations("UiText");

  return t(id);
}
