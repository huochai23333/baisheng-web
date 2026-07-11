"use client";

import { useMemo } from "react";

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Phone, Search } from "lucide-react";
import type { CountryCode } from "libphonenumber-js";
import { useLocale, useTranslations } from "next-intl";

import type { Locale } from "@/lib/locale";

import {
  createPhoneCountryOptions,
  type PhoneCountryOption,
} from "./register-phone-utils";

type RegisterPhoneFieldProps = {
  country: CountryCode;
  disabled?: boolean;
  onCountryChange: (country: CountryCode) => void;
  onPhoneChange: (phone: string) => void;
  phone: string;
};

export function RegisterPhoneField({
  country,
  disabled = false,
  onCountryChange,
  onPhoneChange,
  phone,
}: RegisterPhoneFieldProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("RegisterForm");
  const options = useMemo(() => createPhoneCountryOptions(locale), [locale]);
  const selectedOption =
    options.find((option) => option.country === country) ?? options[0] ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
      <span className="pl-1 font-label text-[11px] font-semibold tracking-[0.18em] text-[#5d7388] uppercase">
        {t("phone")}
      </span>
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(180px,0.85fr)_minmax(0,1.4fr)]">
        <Combobox.Root<PhoneCountryOption>
          disabled={disabled}
          isItemEqualToValue={(item, value) => item.country === value.country}
          itemToStringLabel={(item) => item.label}
          items={options}
          onValueChange={(value) => {
            if (value) {
              onCountryChange(value.country);
            }
          }}
          value={selectedOption}
        >
          <Combobox.Label className="sr-only">
            {t("countryCode")}
          </Combobox.Label>
          <Combobox.Trigger className="flex h-[52px] min-w-0 items-center justify-between gap-3 rounded-[22px] border border-[#ece9e4] bg-[#f2efeb]/90 px-4 text-left text-[15px] text-[#22303a] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-all hover:bg-white focus-visible:border-[#bfd2e1] focus-visible:ring-4 focus-visible:ring-[#bfd2e1]/45 focus-visible:outline-none disabled:cursor-wait disabled:opacity-80">
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden>{selectedOption?.flag}</span>
              <span className="truncate">+{selectedOption?.callingCode}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-[#87939d]" />
          </Combobox.Trigger>

          <Combobox.Portal>
            <Combobox.Positioner
              align="start"
              className="z-[70]"
              sideOffset={6}
            >
              <Combobox.Popup className="w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-[22px] border border-[#dfe5e9] bg-white p-2 shadow-[0_22px_60px_rgba(48,62,74,0.2)] outline-none">
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a969f]" />
                  <Combobox.Input
                    aria-label={t("countrySearch")}
                    className="h-11 w-full rounded-[16px] border border-[#e2e7ea] bg-[#f5f7f8] pl-10 pr-3 text-sm text-[#263640] outline-none focus:border-[#bfd2e1] focus:bg-white focus:ring-3 focus:ring-[#bfd2e1]/35"
                    placeholder={t("countrySearchPlaceholder")}
                  />
                </div>
                <Combobox.Empty className="px-4 py-8 text-center text-sm text-[#7a8791]">
                  {t("countryEmpty")}
                </Combobox.Empty>
                <Combobox.List className="max-h-64 overflow-y-auto overscroll-contain py-1">
                  {(option: PhoneCountryOption) => (
                    <Combobox.Item
                      className="flex min-w-0 cursor-default items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-[#31414c] outline-none data-[highlighted]:bg-[#eef3f6] data-[selected]:font-semibold data-[selected]:text-[#365c78]"
                      key={option.country}
                      value={option}
                    >
                      <span aria-hidden>{option.flag}</span>
                      <span className="min-w-0 flex-1 truncate">
                        {option.label.replace(` +${option.callingCode}`, "")}
                      </span>
                      <span className="shrink-0 text-[#788690]">
                        +{option.callingCode}
                      </span>
                      <Combobox.ItemIndicator className="shrink-0 text-[#486782]">
                        <Check className="size-4" />
                      </Combobox.ItemIndicator>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>

        <label className="min-w-0">
          <span className="sr-only">{t("phone")}</span>
          <div className="group relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#98a3ad] transition-colors group-focus-within:text-[#486783]">
              <Phone className="size-4" />
            </span>
            <input
              autoComplete="tel-national"
              className="h-[52px] w-full min-w-0 rounded-[22px] border border-[#ece9e4] bg-[#f2efeb]/90 pl-12 pr-4 text-[15px] text-[#22303a] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-all placeholder:text-[#a9b1b8] focus:border-[#bfd2e1] focus:bg-white focus:ring-4 focus:ring-[#bfd2e1]/45 focus:outline-none disabled:cursor-wait disabled:opacity-80"
              disabled={disabled}
              inputMode="tel"
              name="phone"
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder={t("phonePlaceholder")}
              type="tel"
              value={phone}
            />
          </div>
        </label>
      </div>
      <span className="pl-1 text-xs leading-5 text-[#8b959d]">
        {t("phoneOptionalHint")}
      </span>
    </div>
  );
}
