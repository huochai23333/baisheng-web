"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useTranslations } from "next-intl";

import { Button } from "../ui/button";
import { DashboardDialog } from "./dashboard-dialog";

export type DashboardConfirmOptions = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  title: string;
  tone?: "danger" | "normal" | "warning";
};

type DashboardConfirm = (options: DashboardConfirmOptions) => Promise<boolean>;

const DashboardConfirmContext = createContext<DashboardConfirm | null>(null);

/**
 * 全工作台只挂载一个确认弹窗。新的确认请求不会覆盖仍在等待用户选择的请求，
 * 这样每个调用方都能收到确定的 true 或 false，不会留下永远等待的 Promise。
 */
export function DashboardConfirmProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("DashboardFramework.confirm");
  const activeRef = useRef(false);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<DashboardConfirmOptions | null>(null);

  const settle = useCallback((accepted: boolean) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    activeRef.current = false;
    setOptions(null);
    resolver?.(accepted);
  }, []);

  const confirm = useCallback<DashboardConfirm>(async (nextOptions) => {
    if (activeRef.current) return false;

    activeRef.current = true;
    setOptions(nextOptions);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const contextValue = useMemo(() => confirm, [confirm]);
  const tone = options?.tone ?? "normal";

  return (
    <DashboardConfirmContext.Provider value={contextValue}>
      {children}
      <DashboardDialog
        actions={
          options ? (
            <>
              <Button
                className="h-11 rounded-full px-5"
                onClick={() => settle(false)}
                type="button"
                variant="outline"
              >
                {options.cancelLabel ?? t("cancel")}
              </Button>
              <Button
                className={
                  tone === "danger"
                    ? "h-11 rounded-full bg-[#b64a4a] px-5 text-white hover:bg-[#9f3f3f]"
                    : tone === "warning"
                      ? "h-11 rounded-full bg-[#a66f16] px-5 text-white hover:bg-[#8f5f12]"
                      : "h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
                }
                onClick={() => settle(true)}
                type="button"
              >
                {options.confirmLabel ?? t("accept")}
              </Button>
            </>
          ) : null
        }
        description={options?.description}
        onOpenChange={(open) => {
          if (!open && options) settle(false);
        }}
        open={Boolean(options)}
        title={options?.title ?? t("title")}
      >
        <span className="sr-only">{options?.description}</span>
      </DashboardDialog>
    </DashboardConfirmContext.Provider>
  );
}

export function useDashboardConfirm() {
  const confirm = useContext(DashboardConfirmContext);
  if (!confirm) {
    throw new Error("useDashboardConfirm 必须在 DashboardConfirmProvider 中使用。");
  }
  return confirm;
}
