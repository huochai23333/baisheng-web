"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { RecordCard } from "@/components/ui/data-display";

import * as FormControls from "@/components/ui/form-controls";

import type { ReactNode } from "react";

import type { ServiceFeeTypeOption } from "@/lib/service-fee-types";

import { DashboardInlineEditActions } from "../dashboard-framework-primitives";
import {
  DashboardTableFrame,
  dashboardFilterInputClassName,
} from "../dashboard-section-panel";
import { formatDiscountRatioValue } from "./admin-orders-utils";

export type ServiceFeeRuleLine = {
  text: string;
  tone?: "primary" | "muted";
};

type ServiceFeeTierSectionCopy = {
  actions: string;
  cancel: string;
  edit: string;
  empty: string;
  rate: string;
  rule: string;
  save: string;
  tier: string;
};

type ServiceFeeTierSectionProps = {
  copy: ServiceFeeTierSectionCopy;
  description: string;
  editValue: string;
  editingId: string | null;
  locale: Parameters<typeof formatDiscountRatioValue>[1];
  pendingAction: string | null;
  rows: ServiceFeeTypeOption[];
  title: string;
  getRuleLines: (row: ServiceFeeTypeOption) => ServiceFeeRuleLine[];
  onCancelEditing: () => void;
  onEditValueChange: (value: string) => void;
  onSave: (row: ServiceFeeTypeOption) => void;
  onStartEditing: (row: ServiceFeeTypeOption) => void;
};

export function AdminOrdersServiceFeeTierSection({
  copy,
  description,
  editValue,
  editingId,
  locale,
  pendingAction,
  rows,
  title,
  getRuleLines,
  onCancelEditing,
  onEditValueChange,
  onSave,
  onStartEditing,
}: ServiceFeeTierSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="min-w-0">
        <h4 className="text-lg font-bold tracking-tight text-content-strong sm:text-xl">
          {title}
        </h4>
        <p className="mt-1.5 text-sm leading-6 text-content-muted sm:leading-7">
          {description}
        </p>
      </div>

      {rows.length === 0 ? (
        <DashboardTableFrame>
          <div className="px-5 py-6 text-sm text-content-muted">
            {copy.empty}
          </div>
        </DashboardTableFrame>
      ) : (
        <>
          {/* 移动端用卡片展示服务费档位，避免设置列被横向截断。 */}
          <ResponsiveDataView
            desktop={
              <>
                <DashboardTableFrame>
                  <table className="w-full min-w-[820px] table-fixed border-collapse">
                    <thead className="bg-surface-inset">
                      <tr className="border-b border-border-subtle">
                        <ServiceFeeHeaderCell className="w-[22%]">
                          {copy.tier}
                        </ServiceFeeHeaderCell>
                        <ServiceFeeHeaderCell className="w-[42%]">
                          {copy.rule}
                        </ServiceFeeHeaderCell>
                        <ServiceFeeHeaderCell className="w-[14%]">
                          {copy.rate}
                        </ServiceFeeHeaderCell>
                        <ServiceFeeHeaderCell className="w-[22%] text-right">
                          {copy.actions}
                        </ServiceFeeHeaderCell>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const isEditing = editingId === row.id;
                        const isSaving = pendingAction === `edit:${row.id}`;
                        const ruleLines = getRuleLines(row);

                        return (
                          <tr
                            className="border-b border-border-subtle last:border-b-0"
                            key={row.id}
                          >
                            <td className="px-5 py-4 align-top text-sm font-semibold leading-6 text-content-strong">
                              {row.display_name}
                            </td>
                            <td className="px-5 py-4 align-top text-sm leading-6 text-content-muted">
                              <div className="grid gap-1.5">
                                {ruleLines.map((line, index) => (
                                  <p
                                    className={`break-words [overflow-wrap:anywhere] ${
                                      line.tone === "primary"
                                        ? "font-semibold text-content-strong"
                                        : "text-content-muted"
                                    }`}
                                    key={`${row.id}-${index}`}
                                  >
                                    {line.text}
                                  </p>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top text-sm font-semibold text-content-strong">
                              {isEditing ? (
                                <FormControls.Input
                                  className={dashboardFilterInputClassName}
                                  inputMode="decimal"
                                  onChange={(event) =>
                                    onEditValueChange(event.target.value)
                                  }
                                  value={editValue}
                                />
                              ) : (
                                formatDiscountRatioValue(row.fee_ratio, locale)
                              )}
                            </td>
                            <td className="px-5 py-4 align-top">
                              <ServiceFeeActions
                                copy={copy}
                                isEditing={isEditing}
                                isSaving={isSaving}
                                pendingAction={pendingAction}
                                onCancelEditing={onCancelEditing}
                                onSave={() => onSave(row)}
                                onStartEditing={() => onStartEditing(row)}
                              />
                            </td>
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
                {rows.map((row) => {
                  const isEditing = editingId === row.id;
                  const isSaving = pendingAction === `edit:${row.id}`;
                  const ruleLines = getRuleLines(row);

                  return (
                    <RecordCard key={row.id}>
                      <h5 className="break-words text-sm font-semibold leading-6 text-content-strong">
                        {row.display_name}
                      </h5>
                      <div className="mt-3 grid gap-3">
                        <MobileField label={copy.rule}>
                          <div className="grid gap-1.5">
                            {ruleLines.map((line, index) => (
                              <p
                                className={`break-words text-sm leading-6 [overflow-wrap:anywhere] ${
                                  line.tone === "primary"
                                    ? "font-semibold text-content-strong"
                                    : "text-content-muted"
                                }`}
                                key={`${row.id}-${index}`}
                              >
                                {line.text}
                              </p>
                            ))}
                          </div>
                        </MobileField>
                        <MobileField label={copy.rate}>
                          {isEditing ? (
                            <FormControls.Input
                              className={dashboardFilterInputClassName}
                              inputMode="decimal"
                              onChange={(event) =>
                                onEditValueChange(event.target.value)
                              }
                              value={editValue}
                            />
                          ) : (
                            <p className="text-sm font-semibold text-content-strong">
                              {formatDiscountRatioValue(row.fee_ratio, locale)}
                            </p>
                          )}
                        </MobileField>
                        <ServiceFeeActions
                          copy={copy}
                          isEditing={isEditing}
                          isSaving={isSaving}
                          pendingAction={pendingAction}
                          onCancelEditing={onCancelEditing}
                          onSave={() => onSave(row)}
                          onStartEditing={() => onStartEditing(row)}
                        />
                      </div>
                    </RecordCard>
                  );
                })}
              </>
            }
          />
        </>
      )}
    </section>
  );
}

function ServiceFeeActions({
  copy,
  isEditing,
  isSaving,
  pendingAction,
  onCancelEditing,
  onSave,
  onStartEditing,
}: {
  copy: ServiceFeeTierSectionCopy;
  isEditing: boolean;
  isSaving: boolean;
  pendingAction: string | null;
  onCancelEditing: () => void;
  onSave: () => void;
  onStartEditing: () => void;
}) {
  return (
    <DashboardInlineEditActions
      cancelLabel={copy.cancel}
      editLabel={copy.edit}
      editing={isEditing}
      onCancel={onCancelEditing}
      onEdit={onStartEditing}
      onSave={onSave}
      pending={pendingAction !== null}
      saveLabel={copy.save}
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

function ServiceFeeHeaderCell({
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
