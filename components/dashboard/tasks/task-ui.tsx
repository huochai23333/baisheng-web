"use client";

import { Select, type SelectOption } from "@/components/ui/select";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";
import { Globe2, UsersRound } from "lucide-react";

import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { TaskScope, TaskStatus } from "@/lib/admin-tasks";
import {
  DashboardSearchInput,
} from "../dashboard-section-panel";
import { getTaskScopeLabel, getTaskStatusMeta } from "./tasks-display";

export function TaskSearchField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
        {label}
      </span>
      <DashboardSearchInput
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

export function TaskFilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
        {label}
      </span>
      <Select
        onValueChange={onChange}
        options={options}
        value={value}
      />
    </label>
  );
}

export function TaskStatusPill({ status }: { status: TaskStatus }) {
  const sharedT = useTranslations("Tasks.shared");
  const mapping = getTaskStatusMeta(status, sharedT);

  return (
    <StatusBadge tone={mapAccentToTone(mapping.accent)}>
      {mapping.label}
    </StatusBadge>
  );
}

export function TaskScopePill({ scope }: { scope: TaskScope }) {
  const sharedT = useTranslations("Tasks.shared");

  return (
    <StatusBadge tone={scope === "public" ? "info" : "success"}>
      {scope === "public" ? (
        <Globe2 className="size-3.5" />
      ) : (
        <UsersRound className="size-3.5" />
      )}
      {getTaskScopeLabel(scope, sharedT)}
    </StatusBadge>
  );
}

export function TaskDataPill({
  children,
  accent,
}: {
  children: ReactNode;
  accent: "blue" | "gold";
}) {
  return (
    <StatusBadge
      className="max-w-full font-medium"
      tone={mapAccentToTone(accent)}
    >
      {children}
    </StatusBadge>
  );
}

function mapAccentToTone(
  accent: "blue" | "gold" | "green" | "orange" | "rose",
): StatusTone {
  if (accent === "green") return "success";
  if (accent === "gold" || accent === "orange") return "warning";
  if (accent === "rose") return "danger";
  return "info";
}

export function TaskInfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] bg-surface-inset px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium leading-7 text-content-strong">
        {value}
      </p>
    </div>
  );
}
