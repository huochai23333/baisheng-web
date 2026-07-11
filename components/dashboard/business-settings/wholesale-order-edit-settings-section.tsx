"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LoaderCircle, PencilLine, Save } from "lucide-react";
import {
  DashboardFilterField,
  DashboardListSection,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import {
  PageBanner,
  type NoticeTone,
} from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  updateWholesaleOrderEditSettings,
  type WholesaleOrderEditSettings,
} from "@/lib/wholesale-order-edit-settings";
type PageFeedback = {
  message: string;
  tone: NoticeTone;
} | null;
export function WholesaleOrderEditSettingsSection({
  initialSettings,
  onSettingsChange,
}: {
  initialSettings: WholesaleOrderEditSettings | null;
  onSettingsChange?: (settings: WholesaleOrderEditSettings) => void;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_business_settings_wholesale_order_edit_settings_section",
  );
  const supabase = getBrowserSupabaseClient();
  const [settings, setSettings] = useState(initialSettings);
  const [draftDays, setDraftDays] = useState(
    String(initialSettings?.directEditWindowDays ?? 30),
  );
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<PageFeedback>(null);
  async function saveSettings() {
    if (!supabase || pending) {
      return;
    }
    const parsedDays = Number(draftDays);
    if (!Number.isInteger(parsedDays) || parsedDays < 0 || parsedDays > 3650) {
      setFeedback({
        tone: "error",
        message: "请填写 0 到 3650 之间的整数天数。",
      });
      return;
    }
    setPending(true);
    setFeedback(null);
    try {
      const nextSettings = await updateWholesaleOrderEditSettings(
        supabase,
        parsedDays,
      );
      setSettings(nextSettings);
      setDraftDays(String(nextSettings.directEditWindowDays));
      onSettingsChange?.(nextSettings);
      setFeedback({ tone: "success", message: "批发订单修改天数已保存。" });
    } catch (error) {
      setFeedback({ tone: "error", message: toSettingsErrorMessage(error) });
    } finally {
      setPending(false);
    }
  }
  const currentDays = settings?.directEditWindowDays ?? 30;
  return (
    <DashboardListSection
      bodyClassName="flex flex-col gap-5"
      description={`业务员录入订单后，${currentDays} 天内可以直接修改；超过后需要提交给管理员处理。`}
      title={uiText("attribute001")}
    >
      {feedback ? (
        <PageBanner tone={feedback.tone}>{feedback.message}</PageBanner>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <DashboardFilterField label={uiText("attribute002")}>
          <div className="relative">
            <PencilLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7d8890]" />
            <input
              className={`${dashboardFilterInputClassName} pl-10`}
              min={0}
              max={3650}
              onChange={(event) => setDraftDays(event.target.value)}
              type="number"
              value={draftDays}
            />
          </div>
          <p className="mt-2 text-sm leading-6 text-[#6f7b85]">
            <UiMessage id="components_dashboard_business_settings_wholesale_order_edit_settings_section.text001" />
          </p>
        </DashboardFilterField>

        <Button
          className="h-11 w-full rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79] lg:w-auto"
          disabled={pending}
          onClick={() => void saveSettings()}
          type="button"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          <UiMessage id="components_dashboard_business_settings_wholesale_order_edit_settings_section.text002" />
        </Button>
      </div>
    </DashboardListSection>
  );
}
function toSettingsErrorMessage(error: unknown) {
  const message = String(
    (
      error as {
        message?: string;
      }
    )?.message ?? "",
  ).toLowerCase();
  if (message.includes("forbidden") || message.includes("permission")) {
    return "当前账号不能修改这项规则。";
  }
  if (message.includes("invalid")) {
    return "请填写 0 到 3650 之间的整数天数。";
  }
  return "规则没有保存成功，请稍后再试。";
}
