"use client";

import { Popover } from "@base-ui/react/popover";
import type { VariantProps } from "class-variance-authority";
import { CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type AriaAttributes,
  type KeyboardEvent,
} from "react";

import { buttonVariants } from "@/components/ui/button-variants";
import {
  DatePickerPopup,
  type DatePickerPopupLabels,
} from "@/components/ui/date-picker-popup";
import type { DatePickerPanelCopy } from "@/components/ui/date-picker-panels";
import {
  formatDatePickerValue,
  getDatePickerPlaceholder,
  getInitialDatePickerMonth,
  getInitialDateTimeDraft,
  getShanghaiDatePickerValue,
  isCanonicalDatePickerValue,
  isDatePickerValueWithinBounds,
  normalizeDatePickerLocale,
  parseDatePickerInput,
  type DatePickerMode,
} from "@/components/ui/date-picker-values";
import { controlVariants, Input } from "@/components/ui/form-controls";
import { useFormFieldControlAttributes } from "@/components/ui/form-field-context";
import { cn } from "@/lib/utils";

export type DatePickerProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-label"?: string;
  "data-testid"?: string;
  className?: string;
  controlSize?: VariantProps<typeof controlVariants>["controlSize"];
  defaultValue?: string;
  disabled?: boolean;
  id?: string;
  max?: string;
  min?: string;
  mode?: DatePickerMode;
  name?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: string;
};

/**
 * 全站唯一的日期族控件。
 *
 * 可见 Input 负责键盘输入和原生表单校验，隐藏 input 只提交稳定业务值；
 * 弹层只操作同一个值，因此业务页面不需要分别维护文本、日历和 FormData 三套状态。
 */
export function DatePicker({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "data-testid": dataTestId,
  className,
  controlSize = "default",
  defaultValue = "",
  disabled = false,
  id,
  max,
  min,
  mode = "date",
  name,
  onValueChange,
  placeholder,
  readOnly = false,
  required = false,
  value,
}: DatePickerProps) {
  const t = useTranslations("DatePicker");
  const locale = normalizeDatePickerLocale(useLocale());
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const [inputText, setInputText] = useState(() =>
    formatDatePickerValue(currentValue, mode, locale),
  );
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() =>
    getInitialDatePickerMonth(currentValue, mode),
  );
  const [dateTimeDraft, setDateTimeDraft] = useState(() =>
    getInitialDateTimeDraft(currentValue),
  );
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const restoreFocusRef = useRef(false);
  const errorId = `${useId()}-error`;
  const fieldAttributes = useFormFieldControlAttributes({
    ariaDescribedBy,
    ariaInvalid,
    id,
  });
  const describedBy = [fieldAttributes["aria-describedby"], error ? errorId : null]
    .filter(Boolean)
    .join(" ") || undefined;
  const copy: DatePickerPanelCopy = {
    cancel: t("cancel"),
    clear: t("clear"),
    complete: t("complete"),
    hour: t("hour"),
    minute: t("minute"),
    monthLabel: t("monthLabel"),
    nextMonth: t("nextMonth"),
    now: t("now"),
    previousMonth: t("previousMonth"),
    yearLabel: t("yearLabel"),
  };
  const popupLabels: DatePickerPopupLabels = {
    chooseDate: t("chooseDate"),
    chooseDateTime: t("chooseDateTime"),
    chooseMonth: t("chooseMonth"),
    clear: t("clear"),
    close: t("close"),
    today: t("today"),
  };

  const updateValue = useCallback(
    (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  const showError = useCallback((message: string | null) => {
    setError(message);
    inputRef.current?.setCustomValidity(message ?? "");
  }, []);

  const commitCanonicalValue = useCallback(
    (nextValue: string) => {
      if (!nextValue) {
        setInputText("");
        showError(required ? t("required") : null);
        // 必填字段清空后保留最后一个有效业务值，只让可见输入进入无效状态；
        // 这样隐藏 FormData 不会短暂污染筛选条件，同时浏览器仍会阻止表单提交。
        if (!required && currentValue) updateValue("");
        return !required;
      }
      if (
        !isCanonicalDatePickerValue(nextValue, mode) ||
        !isDatePickerValueWithinBounds(nextValue, min, max)
      ) {
        showError(
          isCanonicalDatePickerValue(nextValue, mode)
            ? t("outOfRange")
            : t(mode === "month" ? "invalidMonth" : mode === "datetime-local" ? "invalidDateTime" : "invalidDate"),
        );
        return false;
      }

      // 仅在规范值真正变化时通知业务层，避免用户只是打开日历就重复触发筛选或查询。
      if (nextValue !== currentValue) updateValue(nextValue);
      setInputText(formatDatePickerValue(nextValue, mode, locale));
      showError(null);
      return true;
    },
    [currentValue, locale, max, min, mode, required, showError, t, updateValue],
  );

  const commitInputText = useCallback(() => {
    const parsed = parseDatePickerInput(inputText, mode, locale);
    if (parsed === null) {
      showError(
        t(mode === "month" ? "invalidMonth" : mode === "datetime-local" ? "invalidDateTime" : "invalidDate"),
      );
      return false;
    }
    return commitCanonicalValue(parsed);
  }, [commitCanonicalValue, inputText, locale, mode, showError, t]);

  const closeAndRestoreFocus = useCallback(() => {
    restoreFocusRef.current = true;
    setOpen(false);
  }, []);

  useEffect(() => {
    setInputText(formatDatePickerValue(currentValue, mode, locale));
    showError(null);
  }, [currentValue, locale, mode, showError]);

  useEffect(() => {
    if (value !== undefined) return;
    const form = inputRef.current?.form;
    if (!form) return;

    const handleReset = () => {
      setInternalValue(defaultValue);
      setInputText(formatDatePickerValue(defaultValue, mode, locale));
      showError(null);
    };
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [defaultValue, locale, mode, showError, value]);

  return (
    <Popover.Root
      modal="trap-focus"
      onOpenChange={(nextOpen, details) => {
        if (disabled || readOnly) return;
        if (nextOpen) preparePanel();
        if (!nextOpen && details.reason === "escape-key") {
          // Escape 关闭浮层时，同时丢弃尚未提交的键盘草稿，回到最后一个有效业务值。
          setInputText(formatDatePickerValue(currentValue, mode, locale));
          setDateTimeDraft(getInitialDateTimeDraft(currentValue));
          showError(null);
          restoreFocusRef.current = true;
        }
        setOpen(nextOpen);
      }}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen && restoreFocusRef.current) {
          restoreFocusRef.current = false;
          inputRef.current?.focus();
        }
      }}
      open={open}
    >
      <div className={cn("grid min-w-0 gap-1.5", className)} data-slot="date-picker-root">
        <div className="relative min-w-0" ref={anchorRef}>
          <Input
            {...fieldAttributes}
            aria-describedby={describedBy}
            aria-haspopup="dialog"
            aria-invalid={Boolean(error) || fieldAttributes["aria-invalid"]}
            aria-label={ariaLabel}
            aria-required={required || undefined}
            className="pr-12"
            controlSize={controlSize}
            data-mode={mode}
            data-testid={dataTestId}
            data-value={currentValue}
            disabled={disabled}
            inputMode="numeric"
            onBlur={() => {
              if (!readOnly) commitInputText();
            }}
            onChange={(event) => {
              setInputText(event.target.value);
              showError(null);
            }}
            onInvalid={() => {
              // 保留浏览器把焦点带回第一个无效字段的默认行为，同时显示系统内一致的错误说明。
              const invalidKey =
                mode === "month"
                  ? "invalidMonth"
                  : mode === "datetime-local"
                    ? "invalidDateTime"
                    : "invalidDate";
              showError(inputText.trim() ? t(invalidKey) : t("required"));
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder ?? getDatePickerPlaceholder(mode, locale)}
            readOnly={readOnly}
            ref={inputRef}
            required={required}
            type="text"
            value={inputText}
          />
          <Popover.Trigger
            aria-label={t(mode === "month" ? "openMonth" : mode === "datetime-local" ? "openDateTime" : "openDate")}
            className={cn(
              buttonVariants({ size: "icon-compact", variant: "ghost" }),
              "absolute top-1/2 right-0.5 -translate-y-1/2",
            )}
            disabled={disabled || readOnly}
            type="button"
          >
            <CalendarDays aria-hidden="true" className="size-4" />
          </Popover.Trigger>
        </div>
        {name ? <input disabled={disabled} name={name} type="hidden" value={currentValue} /> : null}
        {error ? (
          <p aria-live="polite" className="px-1 text-xs leading-5 text-status-danger" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>

      <DatePickerPopup
        anchorRef={anchorRef}
        copy={copy}
        currentValue={currentValue}
        dateTimeDraft={dateTimeDraft}
        displayMonth={displayMonth}
        labels={popupLabels}
        locale={locale}
        max={max}
        min={min}
        mode={mode}
        onClose={closeAndRestoreFocus}
        onCommit={commitCanonicalValue}
        onDateTimeDraftChange={setDateTimeDraft}
        onDisplayMonthChange={setDisplayMonth}
        required={required}
      />
    </Popover.Root>
  );

  function preparePanel() {
    const seed =
      currentValue && isCanonicalDatePickerValue(currentValue, mode)
        ? currentValue
        : getShanghaiDatePickerValue(mode);
    setDisplayMonth(getInitialDatePickerMonth(seed, mode));
    setDateTimeDraft(getInitialDateTimeDraft(seed));
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      preparePanel();
      setOpen(true);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      commitInputText();
      return;
    }
    if (event.key === "Escape" && inputText !== formatDatePickerValue(currentValue, mode, locale)) {
      event.preventDefault();
      event.stopPropagation();
      setInputText(formatDatePickerValue(currentValue, mode, locale));
      showError(null);
    }
  }

}
