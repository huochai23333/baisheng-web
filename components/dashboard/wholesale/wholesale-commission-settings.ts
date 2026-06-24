import {
  formatCommissionSettingValue,
  getRuleConfigValue,
} from "@/components/dashboard/commission/commission-settings-display";
import type { CommissionRuleSetting } from "@/lib/commission-settings";

export function formatWholesaleOrderCommissionDescription(
  rows: CommissionRuleSetting[],
  locale: string,
) {
  const rule = rows.find(
    (row) => row.ruleCode === "wholesale_order_salesman_tier",
  );
  const tier1Limit = rule
    ? getRuleConfigValue(rule.config, "tier_1_limit_rmb")
    : null;
  const tier1Rate = rule
    ? getRuleConfigValue(rule.config, "tier_1_rate")
    : null;
  const tier2Rate = rule
    ? getRuleConfigValue(rule.config, "tier_2_rate")
    : null;

  if (tier1Limit === null || tier1Rate === null || tier2Rate === null) {
    return "批发订单保存后会自动按当前业务设置生成提成记录。";
  }

  return [
    "批发订单保存后会自动计算业务提成：订单人民币金额 ",
    `${formatCommissionSettingValue("amountRmb", tier1Limit, locale)} 以内按毛利`,
    `${formatCommissionSettingValue("rate", tier1Rate, locale)}，超过该金额按毛利`,
    `${formatCommissionSettingValue("rate", tier2Rate, locale)}。`,
  ].join("");
}
