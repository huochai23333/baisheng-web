import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

import type { Locale } from "@/lib/locale";

export type PhoneCountryOption = {
  callingCode: string;
  country: CountryCode;
  flag: string;
  label: string;
  value: string;
};

export function createPhoneCountryOptions(
  locale: Locale,
): PhoneCountryOption[] {
  const displayNames = new Intl.DisplayNames(
    [locale === "zh" ? "zh-CN" : "en-US"],
    { type: "region" },
  );

  return getCountries()
    .map((country) => {
      const callingCode = getCountryCallingCode(country);
      const countryName = displayNames.of(country) ?? country;

      return {
        callingCode,
        country,
        flag: countryCodeToFlag(country),
        label: `${countryName} +${callingCode}`,
        value: country,
      };
    })
    .sort((left, right) =>
      left.label.localeCompare(
        right.label,
        locale === "zh" ? "zh-CN" : "en-US",
      ),
    );
}

export function resolveBrowserCountry(locale: Locale): CountryCode {
  if (typeof navigator === "undefined") {
    return locale === "zh" ? "CN" : "US";
  }

  for (const language of navigator.languages) {
    try {
      const region = new Intl.Locale(language).maximize().region;

      if (region && getCountries().includes(region as CountryCode)) {
        return region as CountryCode;
      }
    } catch {
      // 某些浏览器扩展会写入非标准语言值，忽略后继续尝试下一项。
    }
  }

  return locale === "zh" ? "CN" : "US";
}

export function normalizeInternationalPhone(
  country: CountryCode,
  nationalNumber: string,
): string | null | undefined {
  const value = nationalNumber.trim();

  if (!value) {
    return null;
  }

  const phoneNumber = parsePhoneNumberFromString(value, country);

  return phoneNumber?.isValid() ? phoneNumber.number : undefined;
}

function countryCodeToFlag(country: CountryCode) {
  return Array.from(country)
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
}
