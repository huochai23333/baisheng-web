"use client";

import { LoaderCircle, PencilLine, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type {
  CommissionRuleCode,
  CommissionRuleSetting,
} from "@/lib/commission-settings";
import { Button } from "@/components/ui/button";
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
    <DashboardTableFrame>
      <table className="w-full min-w-[980px] table-fixed border-collapse">
        <thead className="bg-[#f7f5f2]">
          <tr className="border-b border-[#efebe5]">
            <HeaderCell className="w-[28%]">{t("settings.table.rule")}</HeaderCell>
            <HeaderCell className="w-[24%]">{t("settings.table.value")}</HeaderCell>
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
                className="border-b border-[#efebe5] align-top last:border-b-0"
                key={definition.code}
              >
                <td className="px-5 py-4">
                  <div className="text-sm font-semibold leading-6 text-[#23313a]">
                    {t(definition.labelKey)}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#6f7b85]">
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
                    <span className="text-sm text-[#8a949c]">
                      {t("settings.table.missing")}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-sm leading-6 text-[#60707d]">
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
  );
}

export function CommissionSettingsSectionTitle({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-xl font-bold tracking-tight text-[#23313a] sm:text-2xl">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-6 text-[#6f7b85] sm:leading-7">
        {description}
      </p>
    </div>
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
          <span className="mb-1 block text-[11px] font-semibold text-[#7d8890]">
            {t(field.labelKey)}
          </span>
          <input
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
          <div className="flex items-center justify-between gap-3" key={field.configKey}>
            <span className="text-xs font-semibold text-[#7d8890]">
              {t(field.labelKey)}
            </span>
            <span className="font-semibold text-[#23313a]">
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
  const t = useTranslations("Commission");

  return (
    <td className="px-5 py-4">
      <div className="flex flex-wrap justify-end gap-2">
        {isEditing ? (
          <>
            <Button disabled={pendingRule !== null} onClick={onSave} type="button" variant="outline">
              {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t("settings.actions.save")}
            </Button>
            <Button disabled={pendingRule !== null} onClick={onCancel} type="button" variant="outline">
              <X className="size-4" />
              {t("settings.actions.cancel")}
            </Button>
          </>
        ) : (
          <Button
            disabled={pendingRule !== null || row === null}
            onClick={onEdit}
            type="button"
            variant="outline"
          >
            <PencilLine className="size-4" />
            {t("settings.actions.edit")}
          </Button>
        )}
      </div>
    </td>
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
      className={`px-5 py-4 text-left font-label text-[11px] font-semibold tracking-[0.18em] text-[#7d8890] uppercase ${className}`}
    >
      {children}
    </th>
  );
}

export type { RuleDraft, VisibleRule };
