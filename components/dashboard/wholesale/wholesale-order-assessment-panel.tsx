"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardSectionPanel } from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  useWholesaleOrderAssessment,
  type WholesaleOrderAssessmentFilters,
} from "./use-wholesale-order-assessment";
type WholesaleOrderAssessmentPanelProps = {
  filters: WholesaleOrderAssessmentFilters;
  matchedOrderCount: number;
};
export function WholesaleOrderAssessmentPanel({
  filters,
  matchedOrderCount,
}: WholesaleOrderAssessmentPanelProps) {
  const t = useTranslations("WholesaleBusiness.ordersUi");
  const {
    assessment,
    errorMessage,
    generateAssessment,
    hasStaleAssessment,
    pending,
  } = useWholesaleOrderAssessment(filters);
  return (
    <DashboardSectionPanel className="border-border-subtle bg-surface-inset/86 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_order_assessment_panel.text001" />
          </div>
          <p className="mt-2 break-words text-sm leading-6 text-content-muted">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_assessment_panel.text002" />
            {matchedOrderCount}
            <UiMessage id="components_dashboard_wholesale_wholesale_order_assessment_panel.text003" />
          </p>
        </div>
        <Button
          variant="primary"
          size="compact"
          className="disabled:opacity-60"
          disabled={pending || matchedOrderCount === 0}
          onClick={() => void generateAssessment()}
          type="button"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {pending ? t("assessment.pending") : t("assessment.generate")}
        </Button>
      </div>

      {matchedOrderCount === 0 ? (
        <p className="mt-4 rounded-control-default bg-surface-panel px-4 py-3 text-sm leading-6 text-content-muted">
          <UiMessage id="components_dashboard_wholesale_wholesale_order_assessment_panel.text004" />
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-control-default border border-border-subtle bg-surface-inset px-4 py-3 text-sm leading-6 text-content-muted">
          {errorMessage}
        </p>
      ) : null}

      {assessment ? (
        <Surface
          as="div"
          className="mt-4 text-sm leading-7 text-content-strong"
          data-testid="wholesale-order-assessment-output"
          padding="regular"
          variant="interactive"
        >
          {hasStaleAssessment ? (
            <p className="mb-3 rounded-control-compact bg-surface-inset px-3 py-2 text-xs leading-5 text-content-muted">
              <UiMessage id="components_dashboard_wholesale_wholesale_order_assessment_panel.text005" />
            </p>
          ) : null}
          <p className="whitespace-pre-wrap break-words">{assessment.trim()}</p>
        </Surface>
      ) : null}
    </DashboardSectionPanel>
  );
}
