"use client";

import * as FormControls from "@/components/ui/form-controls";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  DashboardFilterField,
  DashboardListSection,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import {
  FeedbackNotice,
  type FeedbackTone,
} from "@/components/dashboard/dashboard-shared-ui";
import { DashboardInlineEditActions } from "@/components/dashboard/dashboard-framework-primitives";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  updateWholesaleOrderEditSettings,
  type WholesaleOrderEditSettings,
} from "@/lib/wholesale-order-edit-settings";
type PageFeedback = {
  message: string;
  tone: FeedbackTone;
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
  const actionsT = useTranslations("DashboardFramework.actions");
  const supabase = getBrowserSupabaseClient();
  const [settings, setSettings] = useState(initialSettings);
  const [draftDays, setDraftDays] = useState(
    String(initialSettings?.directEditWindowDays ?? 30),
  );
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
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
      setEditing(false);
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
        <FeedbackNotice tone={feedback.tone}>{feedback.message}</FeedbackNotice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <DashboardFilterField label={uiText("attribute002")}>
          <div className="relative">
            <FormControls.Input
              className={dashboardFilterInputClassName}
              disabled={!editing || pending}
              min={0}
              max={3650}
              onChange={(event) => setDraftDays(event.target.value)}
              type="number"
              value={draftDays}
            />
          </div>
          <p className="mt-2 text-sm leading-6 text-content-muted">
            <UiMessage id="components_dashboard_business_settings_wholesale_order_edit_settings_section.text001" />
          </p>
        </DashboardFilterField>

        <DashboardInlineEditActions
          cancelLabel={actionsT("cancel")}
          editLabel={actionsT("edit")}
          editing={editing}
          onCancel={() => {
            setDraftDays(String(currentDays));
            setFeedback(null);
            setEditing(false);
          }}
          onEdit={() => {
            setDraftDays(String(currentDays));
            setFeedback(null);
            setEditing(true);
          }}
          onSave={() => void saveSettings()}
          pending={pending}
          saveLabel={actionsT("save")}
        />
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
