import type {
  CommissionRuleCode,
  CommissionRuleConfig,
} from "@/lib/commission-settings";

export type CommissionRuleFieldKind = "amountRmb" | "amountUsd" | "rate";

export type CommissionRuleField = {
  configKey: string;
  kind: CommissionRuleFieldKind;
  labelKey: string;
};

export type CommissionRuleDefinition = {
  calculationKey: string;
  code: CommissionRuleCode;
  descriptionKey: string;
  fields: CommissionRuleField[];
  group: "order" | "referral" | "service";
  labelKey: string;
};

type FormulaTranslator = (
  key: string,
  values?: Record<string, string>,
) => string;

export const COMMISSION_RULE_DEFINITIONS: CommissionRuleDefinition[] = [
  {
    calculationKey: "settings.calculations.purchaseSalesmanTier",
    code: "purchase_salesman_tier",
    descriptionKey: "settings.ruleDescriptions.purchaseSalesmanTier",
    fields: [
      {
        configKey: "tier_1_rate",
        kind: "rate",
        labelKey: "settings.fields.tier1Rate",
      },
      {
        configKey: "tier_1_limit_rmb",
        kind: "amountRmb",
        labelKey: "settings.fields.tier1Limit",
      },
      {
        configKey: "tier_2_rate",
        kind: "rate",
        labelKey: "settings.fields.tier2Rate",
      },
    ],
    group: "order",
    labelKey: "settings.rules.purchaseSalesmanTier",
  },
  {
    calculationKey: "settings.calculations.purchaseReferral",
    code: "purchase_referral_rate",
    descriptionKey: "settings.ruleDescriptions.purchaseReferral",
    fields: [
      {
        configKey: "rate",
        kind: "rate",
        labelKey: "settings.fields.rate",
      },
    ],
    group: "referral",
    labelKey: "settings.rules.purchaseReferral",
  },
  {
    calculationKey: "settings.calculations.serviceEscortSalesman",
    code: "service_escort_salesman",
    descriptionKey: "settings.ruleDescriptions.serviceEscortSalesman",
    fields: [
      {
        configKey: "rate",
        kind: "rate",
        labelKey: "settings.fields.rate",
      },
    ],
    group: "service",
    labelKey: "settings.rules.serviceEscortSalesman",
  },
  {
    calculationKey: "settings.calculations.digitalSurvivalSalesman",
    code: "digital_survival_salesman",
    descriptionKey: "settings.ruleDescriptions.digitalSurvivalSalesman",
    fields: [
      {
        configKey: "rate",
        kind: "rate",
        labelKey: "settings.fields.rate",
      },
    ],
    group: "service",
    labelKey: "settings.rules.digitalSurvivalSalesman",
  },
  {
    calculationKey: "settings.calculations.serviceReferral",
    code: "service_referral_rate",
    descriptionKey: "settings.ruleDescriptions.serviceReferral",
    fields: [
      {
        configKey: "rate",
        kind: "rate",
        labelKey: "settings.fields.rate",
      },
    ],
    group: "referral",
    labelKey: "settings.rules.serviceReferral",
  },
  {
    calculationKey: "settings.calculations.vipFirstYearReferralBonus",
    code: "vip_first_year_referral_bonus",
    descriptionKey: "settings.ruleDescriptions.vipFirstYearReferralBonus",
    fields: [
      {
        configKey: "bonus_usd",
        kind: "amountUsd",
        labelKey: "settings.fields.bonusUsd",
      },
    ],
    group: "referral",
    labelKey: "settings.rules.vipFirstYearReferralBonus",
  },
];

export function formatCommissionSettingValue(
  kind: CommissionRuleFieldKind,
  value: number,
  locale: string,
) {
  if (kind === "rate") {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
      style: "percent",
    }).format(value);
  }

  if (kind === "amountUsd") {
    return new Intl.NumberFormat(locale, {
      currency: "USD",
      maximumFractionDigits: 2,
      style: "currency",
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    currency: "CNY",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

export function formatCommissionCalculationFormula(
  definition: CommissionRuleDefinition,
  config: CommissionRuleConfig,
  locale: string,
  t: FormulaTranslator,
) {
  const missing = t("settings.table.missing");
  const formattedValue = (key: string, kind: CommissionRuleFieldKind) => {
    const value = getRuleConfigValue(config, key);

    return value === null
      ? missing
      : formatCommissionSettingValue(kind, value, locale);
  };

  switch (definition.code) {
    case "purchase_salesman_tier":
      return t(definition.calculationKey, {
        tier1Limit: formattedValue("tier_1_limit_rmb", "amountRmb"),
        tier1Rate: formattedValue("tier_1_rate", "rate"),
        tier2Rate: formattedValue("tier_2_rate", "rate"),
      });
    case "purchase_referral_rate":
    case "service_escort_salesman":
    case "digital_survival_salesman":
    case "service_referral_rate":
      return t(definition.calculationKey, {
        rate: formattedValue("rate", "rate"),
      });
    case "vip_first_year_referral_bonus":
      return t(definition.calculationKey, {
        bonusUsd: formattedValue("bonus_usd", "amountUsd"),
      });
    default:
      return t(definition.calculationKey);
  }
}

export function formatCommissionSettingInput(
  kind: CommissionRuleFieldKind,
  value: number | null,
) {
  if (value === null || !Number.isFinite(value)) {
    return "";
  }

  const normalized = kind === "rate" ? value * 100 : value;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: kind === "rate" ? 4 : 2,
    useGrouping: false,
  }).format(normalized);
}

export function getRuleConfigValue(
  config: CommissionRuleConfig,
  key: string,
) {
  const value = config[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
