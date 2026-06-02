"use client";

import { LoaderCircle, PencilLine, Save, X } from "lucide-react";

import type { ServiceFeeTypeOption } from "@/lib/service-fee-types";

import { Button } from "../../ui/button";
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
        <h4 className="text-lg font-bold tracking-tight text-[#23313a] sm:text-xl">
          {title}
        </h4>
        <p className="mt-1.5 text-sm leading-6 text-[#6f7b85] sm:leading-7">
          {description}
        </p>
      </div>

      <DashboardTableFrame>
        {rows.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#65717b]">{copy.empty}</div>
        ) : (
          <table className="w-full min-w-[820px] table-fixed border-collapse">
            <thead className="bg-[#f7f5f2]">
              <tr className="border-b border-[#efebe5]">
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
                    className="border-b border-[#efebe5] last:border-b-0"
                    key={row.id}
                  >
                    <td className="px-5 py-4 align-top text-sm font-semibold leading-6 text-[#23313a]">
                      {row.display_name}
                    </td>
                    <td className="px-5 py-4 align-top text-sm leading-6 text-[#60707d]">
                      <div className="grid gap-1.5">
                        {ruleLines.map((line, index) => (
                          <p
                            className={`break-words [overflow-wrap:anywhere] ${
                              line.tone === "primary"
                                ? "font-semibold text-[#23313a]"
                                : "text-[#6f7b85]"
                            }`}
                            key={`${row.id}-${index}`}
                          >
                            {line.text}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-semibold text-[#23313a]">
                      {isEditing ? (
                        <input
                          className={dashboardFilterInputClassName}
                          inputMode="decimal"
                          onChange={(event) => onEditValueChange(event.target.value)}
                          value={editValue}
                        />
                      ) : (
                        formatDiscountRatioValue(row.fee_ratio, locale)
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              disabled={pendingAction !== null}
                              onClick={() => onSave(row)}
                              type="button"
                              variant="outline"
                            >
                              {isSaving ? (
                                <LoaderCircle className="size-4 animate-spin" />
                              ) : (
                                <Save className="size-4" />
                              )}
                              {copy.save}
                            </Button>
                            <Button
                              disabled={pendingAction !== null}
                              onClick={onCancelEditing}
                              type="button"
                              variant="outline"
                            >
                              <X className="size-4" />
                              {copy.cancel}
                            </Button>
                          </>
                        ) : (
                          <Button
                            disabled={pendingAction !== null}
                            onClick={() => onStartEditing(row)}
                            type="button"
                            variant="outline"
                          >
                            <PencilLine className="size-4" />
                            {copy.edit}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </DashboardTableFrame>
    </section>
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
      className={`px-5 py-4 text-left font-label text-[11px] font-semibold tracking-[0.18em] text-[#7d8890] uppercase ${className}`}
    >
      {children}
    </th>
  );
}
