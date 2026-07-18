"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  DatePickerCalendar,
  type DatePickerCalendarCopy,
} from "@/components/ui/date-picker-calendar";
import {
  getDatePickerYearRange,
  getShanghaiDatePickerValue,
  mergeDateAndTime,
  splitDateTimeValue,
  type DatePickerLocale,
} from "@/components/ui/date-picker-values";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DatePickerPanelCopy = DatePickerCalendarCopy & {
  cancel: string;
  clear: string;
  complete: string;
  hour: string;
  minute: string;
  now: string;
};

export function DatePickerDayFooter({
  clearLabel,
  onClear,
  onToday,
  todayLabel,
}: {
  clearLabel: string;
  onClear: (() => void) | null;
  onToday: () => void;
  todayLabel: string;
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
      <div>
        {onClear ? (
          <Button onClick={onClear} size="compact" type="button" variant="ghost">
            {clearLabel}
          </Button>
        ) : null}
      </div>
      <Button onClick={onToday} size="compact" type="button" variant="ghost">
        {todayLabel}
      </Button>
    </div>
  );
}

type MonthPickerPanelProps = {
  copy: DatePickerPanelCopy;
  displayYear: number;
  locale: DatePickerLocale;
  max?: string;
  min?: string;
  onDisplayYearChange: (year: number) => void;
  onSelect: (value: string) => void;
  selectedValue: string;
};

/** 月份只有十二个固定选项，使用小型网格比复用“某一天”日历更清晰。 */
export function MonthPickerPanel({
  copy,
  displayYear,
  locale,
  max,
  min,
  onDisplayYearChange,
  onSelect,
  selectedValue,
}: MonthPickerPanelProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentMonth = Number(
    getShanghaiDatePickerValue("month").slice(5, 7),
  );
  const selectedMonth =
    selectedValue.startsWith(`${displayYear}-`)
      ? Number(selectedValue.slice(5, 7))
      : currentMonth;
  const yearRange = getDatePickerYearRange(displayYear, min, max);
  const yearOptions = useMemo(
    () =>
      Array.from({ length: yearRange.end - yearRange.start + 1 }, (_, index) => {
        const value = String(yearRange.start + index);
        return { label: locale === "zh" ? `${value}年` : value, value };
      }),
    [locale, yearRange.end, yearRange.start],
  );
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
          month: "short",
        }).format(new Date(2020, index, 1)),
      ),
    [locale],
  );

  return (
    <div className="grid gap-3" data-slot="month-picker-panel">
      <div className="flex items-center justify-between gap-2">
        <Button
          aria-label={copy.previousMonth}
          disabled={Boolean(min && displayYear <= Number(min.slice(0, 4)))}
          onClick={() => onDisplayYearChange(displayYear - 1)}
          size="icon-compact"
          type="button"
          variant="ghost"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Select
          aria-label={copy.yearLabel}
          className="w-[8.5rem]"
          controlSize="compact"
          onValueChange={(value) => onDisplayYearChange(Number(value))}
          options={yearOptions}
          value={String(displayYear)}
        />
        <Button
          aria-label={copy.nextMonth}
          disabled={Boolean(max && displayYear >= Number(max.slice(0, 4)))}
          onClick={() => onDisplayYearChange(displayYear + 1)}
          size="icon-compact"
          type="button"
          variant="ghost"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      <div
        aria-label={copy.monthLabel}
        className="grid grid-cols-3 gap-2"
        role="grid"
      >
        {monthLabels.map((label, index) => {
          const month = index + 1;
          const value = `${displayYear}-${String(month).padStart(2, "0")}`;
          const selected = value === selectedValue;
          const disabled = Boolean((min && value < min) || (max && value > max));

          return (
            <button
              aria-selected={selected}
              className={cn(
                "flex min-h-11 items-center justify-center rounded-[12px] px-3 text-sm font-medium text-content-strong outline-none transition",
                "hover:bg-surface-inset focus-visible:ring-4 focus-visible:ring-ring",
                selected && "bg-surface-brand-soft font-semibold text-primary",
                disabled && "pointer-events-none cursor-not-allowed opacity-35",
              )}
              disabled={disabled}
              key={value}
              onClick={() => onSelect(value)}
              onKeyDown={(event) =>
                handleMonthGridKeyDown(
                  event,
                  index,
                  buttonRefs.current,
                  onDisplayYearChange,
                  displayYear,
                )
              }
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              role="gridcell"
              tabIndex={month === selectedMonth ? 0 : -1}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type DateTimePickerPanelProps = {
  copy: DatePickerPanelCopy;
  displayMonth: Date;
  draftValue: string;
  locale: DatePickerLocale;
  max?: string;
  min?: string;
  onCancel: () => void;
  onClear: (() => void) | null;
  onComplete: (value: string) => void;
  onDisplayMonthChange: (month: Date) => void;
  onDraftChange: (value: string) => void;
};

export function DateTimePickerPanel({
  copy,
  displayMonth,
  draftValue,
  locale,
  max,
  min,
  onCancel,
  onClear,
  onComplete,
  onDisplayMonthChange,
  onDraftChange,
}: DateTimePickerPanelProps) {
  const parts = splitDateTimeValue(draftValue);
  const fallback = splitDateTimeValue(getShanghaiDatePickerValue("datetime-local"));
  const date = parts?.date ?? fallback?.date ?? "";
  const time = parts?.time ?? fallback?.time ?? "00:00";
  const [hour, minute] = time.split(":");
  const hourOptions = useMemo(
    () =>
      Array.from({ length: 24 }, (_, value) => {
        const label = String(value).padStart(2, "0");
        return { label, value: label };
      }),
    [],
  );
  const minuteOptions = useMemo(
    () =>
      Array.from({ length: 60 }, (_, value) => {
        const label = String(value).padStart(2, "0");
        return { label, value: label };
      }),
    [],
  );

  return (
    <div className="grid gap-4" data-slot="datetime-picker-panel">
      <DatePickerCalendar
        copy={copy}
        displayMonth={displayMonth}
        locale={locale}
        max={max}
        min={min}
        onDisplayMonthChange={onDisplayMonthChange}
        onSelect={(nextDate) => onDraftChange(mergeDateAndTime(nextDate, time))}
        selectedValue={date}
      />
      <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-3">
        <PickerSelectField
          label={copy.hour}
          onValueChange={(value) =>
            onDraftChange(mergeDateAndTime(date, `${value}:${minute}`))
          }
          options={hourOptions}
          value={hour}
        />
        <PickerSelectField
          label={copy.minute}
          onValueChange={(value) =>
            onDraftChange(mergeDateAndTime(date, `${hour}:${value}`))
          }
          options={minuteOptions}
          value={minute}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
        <div className="flex flex-wrap gap-2">
          {onClear ? (
            <Button onClick={onClear} size="compact" type="button" variant="ghost">
              {copy.clear}
            </Button>
          ) : null}
          <Button
            onClick={() => onComplete(getShanghaiDatePickerValue("datetime-local"))}
            size="compact"
            type="button"
            variant="ghost"
          >
            {copy.now}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCancel} size="compact" type="button" variant="outline">
            {copy.cancel}
          </Button>
          <Button
            disabled={!parts}
            onClick={() => onComplete(draftValue)}
            size="compact"
            type="button"
          >
            {copy.complete}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PickerSelectField({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string;
  onValueChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="px-1 text-[11px] font-semibold text-content-muted">
        {label}
      </span>
      <Select
        aria-label={label}
        controlSize="compact"
        onValueChange={onValueChange}
        options={options}
        value={value}
      />
    </div>
  );
}

function handleMonthGridKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  index: number,
  buttons: Array<HTMLButtonElement | null>,
  onDisplayYearChange: (year: number) => void,
  displayYear: number,
) {
  const movement: Record<string, number> = {
    ArrowDown: 3,
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -3,
    End: 2 - (index % 3),
    Home: -(index % 3),
  };
  if (event.key === "PageUp" || event.key === "PageDown") {
    event.preventDefault();
    onDisplayYearChange(displayYear + (event.key === "PageUp" ? -1 : 1));
    return;
  }

  const amount = movement[event.key];
  if (amount === undefined) return;
  event.preventDefault();
  const nextIndex = Math.max(0, Math.min(11, index + amount));
  buttons[nextIndex]?.focus();
}
