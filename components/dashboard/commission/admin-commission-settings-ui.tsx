"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

import * as FormControls from "@/components/ui/form-controls";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import type {
  CommissionRuleCode,
  CommissionRuleSetting,
} from "@/lib/commission-settings";
import { DashboardInlineEditActions } from "@/components/dashboard/dashboard-framework-primitives";
import {
  DashboardTableFrame,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";

import {
  type CommissionRuleDefinition,
  formatCommissionCalculationFormula,
  formatCommissionSettingValue,
  getRuleConfigValue,
} from "./commission-settings-display";

type RuleDraft = Record<string, string>;
type VisibleRule = {
  definition: CommissionRuleDefinition;
  row: CommissionRuleSetting | null;
};

export function CommissionSettingsRulesTable({
  canManageSettings,
  draft,
  editingRule,
  locale,
  pendingRule,
  visibleRules,
  onCancel,
  onDraftChange,
  onEdit,
  onSave,
}: {
  canManageSettings: boolean;
  draft: RuleDraft;
  editingRule: CommissionRuleCode | null;
  locale: string;
  pendingRule: CommissionRuleCode | null;
  visibleRules: VisibleRule[];
  onCancel: () => void;
  onDraftChange: (draft: RuleDraft) => void;
  onEdit: (definition: CommissionRuleDefinition) => void;
  onSave: (definition: CommissionRuleDefinition) => void;
}) {
  const t = useTranslations("Commission");

  return (
    <>
      {/* 移动端用卡片承载每条佣金规则，避免设置表格横向滑动。 */}
      <ResponsiveDataView
        desktop={
          <>
            <DashboardTableFrame>
              <table className="w-full min-w-[980px] table-fixed border-collapse">
                <thead className="bg-surface-inset">
                  <tr className="border-b border-border-subtle">
                    <HeaderCell className="w-[28%]">
                      {t("settings.table.rule")}
                    </HeaderCell>
                    <HeaderCell className="w-[24%]">
                      {t("settings.table.value")}
                    </HeaderCell>
                    <HeaderCell className="w-[30%]">
                      {t("settings.table.calculation")}
                    </HeaderCell>
                    {canManageSettings ? (
                      <HeaderCell className="w-[18%] text-right">
                        {t("settings.table.actions")}
                      </HeaderCell>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {visibleRules.map(({ definition, row }) => {
                    const isEditing = editingRule === definition.code;
                    const isSaving = pendingRule === definition.code;

                    return (
                      <tr
                        className="border-b border-border-subtle align-top last:border-b-0"
                        key={definition.code}
                      >
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold leading-6 text-content-strong">
                            {t(definition.labelKey)}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-content-muted">
                            {t(definition.descriptionKey)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {row ? (
                            isEditing ? (
                              <RuleDraftInputs
                                definition={definition}
                                draft={draft}
                                onDraftChange={onDraftChange}
                              />
                            ) : (
                              <RuleValueList
                                definition={definition}
                                locale={locale}
                                row={row}
                              />
                            )
                          ) : (
                            <span className="text-sm text-content-subtle">
                              {t("settings.table.missing")}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm leading-6 text-content-muted">
                          {row
                            ? formatCommissionCalculationFormula(
                                definition,
                                row.config,
                                locale,
                                t,
                              )
                            : t("settings.table.missing")}
                        </td>
                        {canManageSettings ? (
                          <ActionsCell
                            isEditing={isEditing}
                            isSaving={isSaving}
                            pendingRule={pendingRule}
                            row={row}
                            onCancel={onCancel}
                            onEdit={() => onEdit(definition)}
                            onSave={() => onSave(definition)}
                          />
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DashboardTableFrame>
          </>
        }
        mobile={
          <>
            {visibleRules.map(({ definition, row }) => {
              const isEditing = editingRule === definition.code;
              const isSaving = pendingRule === definition.code;

              return (
                <article
                  className="rounded-[18px] border border-border-subtle bg-white p-4 shadow-[var(--surface-shadow-interactive)]"
                  key={definition.code}
                >
                  <div className="min-w-0">
                    <h4 className="break-words text-sm font-semibold leading-6 text-content-strong">
                      {t(definition.labelKey)}
                    </h4>
                    <p className="mt-1 break-words text-xs leading-5 text-content-muted">
                      {t(definition.descriptionKey)}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <MobileField label={t("settings.table.value")}>
                      {row ? (
                        isEditing ? (
                          <RuleDraftInputs
                            definition={definition}
                            draft={draft}
                            onDraftChange={onDraftChange}
                          />
                        ) : (
                          <RuleValueList
                            definition={definition}
                            locale={locale}
                            row={row}
                          />
                        )
                      ) : (
                        <span className="text-sm text-content-subtle">
                          {t("settings.table.missing")}
                        </span>
                      )}
                    </MobileField>
                    <MobileField label={t("settings.table.calculation")}>
                      <p className="break-words text-sm leading-6 text-content-muted [overflow-wrap:anywhere]">
                        {row
                          ? formatCommissionCalculationFormula(
                              definition,
                              row.config,
                              locale,
                              t,
                            )
                          : t("settings.table.missing")}
                      </p>
                    </MobileField>
                    {canManageSettings ? (
                      <RuleActionButtons
                        isEditing={isEditing}
                        isSaving={isSaving}
                        pendingRule={pendingRule}
                        row={row}
                        onCancel={onCancel}
                        onEdit={() => onEdit(definition)}
                        onSave={() => onSave(definition)}
                      />
                    ) : null}
                  </div>
                </article>
              );
            })}
          </>
        }
      />
    </>
  );
}

function RuleDraftInputs({
  definition,
  draft,
  onDraftChange,
}: {
  definition: CommissionRuleDefinition;
  draft: RuleDraft;
  onDraftChange: (draft: RuleDraft) => void;
}) {
  const t = useTranslations("Commission");

  return (
    <div className="grid gap-2">
      {definition.fields.map((field) => (
        <label className="block" key={field.configKey}>
          <span className="mb-1 block text-[11px] font-semibold text-content-muted">
            {t(field.labelKey)}
          </span>
          <FormControls.Input
            className={dashboardFilterInputClassName}
            inputMode="decimal"
            onChange={(event) =>
              onDraftChange({
                ...draft,
                [field.configKey]: event.target.value,
              })
            }
            value={draft[field.configKey] ?? ""}
          />
        </label>
      ))}
    </div>
  );
}

function RuleValueList({
  definition,
  locale,
  row,
}: {
  definition: CommissionRuleDefinition;
  locale: string;
  row: CommissionRuleSetting;
}) {
  const t = useTranslations("Commission");

  return (
    <div className="grid gap-1.5 text-sm leading-6">
      {definition.fields.map((field) => {
        const value = getRuleConfigValue(row.config, field.configKey);

        return (
          <div
            className="flex items-center justify-between gap-3"
            key={field.configKey}
          >
            <span className="text-xs font-semibold text-content-muted">
              {t(field.labelKey)}
            </span>
            <span className="font-semibold text-content-strong">
              {value === null
                ? t("settings.table.missing")
                : formatCommissionSettingValue(field.kind, value, locale)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ActionsCell({
  isEditing,
  isSaving,
  pendingRule,
  row,
  onCancel,
  onEdit,
  onSave,
}: {
  isEditing: boolean;
  isSaving: boolean;
  pendingRule: CommissionRuleCode | null;
  row: CommissionRuleSetting | null;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  return (
    <td className="px-5 py-4">
      <RuleActionButtons
        isEditing={isEditing}
        isSaving={isSaving}
        pendingRule={pendingRule}
        row={row}
        onCancel={onCancel}
        onEdit={onEdit}
        onSave={onSave}
      />
    </td>
  );
}

function RuleActionButtons({
  isEditing,
  isSaving,
  pendingRule,
  row,
  onCancel,
  onEdit,
  onSave,
}: {
  isEditing: boolean;
  isSaving: boolean;
  pendingRule: CommissionRuleCode | null;
  row: CommissionRuleSetting | null;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  const t = useTranslations("Commission");

  return (
    <DashboardInlineEditActions
      cancelLabel={t("settings.actions.cancel")}
      editLabel={t("settings.actions.edit")}
      editing={isEditing}
      onCancel={onCancel}
      onEdit={onEdit}
      onSave={onSave}
      pending={pendingRule !== null || row === null}
      saveLabel={t("settings.actions.save")}
      saving={isSaving}
    />
  );
}

function MobileField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div>
      <p className="mb-1.5 font-label text-[10px] font-semibold tracking-[0.14em] text-content-muted uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function HeaderCell({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <th
      className={`px-5 py-4 text-left font-label text-[11px] font-semibold tracking-[0.18em] text-content-muted uppercase ${className}`}
    >
      {children}
    </th>
  );
}

export type { RuleDraft, VisibleRule };
