import { expect, test } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
  setTestLocale,
} from "./helpers/auth";
import {
  expectDateControlValue,
  fillDateControl,
  openDateControl,
} from "./helpers/date-control";
import { chooseSelectOption } from "./helpers/select-control";

test.describe("全站日期选择控件", () => {
  test("日期和月份支持键盘输入、错误恢复与日历点选", async ({ page }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/company-expenses");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await page.getByRole("button", { name: "新增费用" }).click();
    const dialog = page.getByRole("dialog", { name: "新增费用" });
    const monthInput = dialog.getByLabel("所属月份");
    const dateInput = dialog.getByLabel("付款日期");

    // 中文年份优先格式、斜杠格式以及闰年日期都应归一化成原有业务字符串。
    await fillDateControl(monthInput, "2024/02");
    await expectDateControlValue(monthInput, "2024-02");
    await expect(monthInput).toHaveValue("2024年02月");

    await fillDateControl(dateInput, "2024/02/29");
    await expectDateControlValue(dateInput, "2024-02-29");
    await expect(dateInput).toHaveValue("2024/02/29");

    await fillDateControl(dateInput, "2023/02/29");
    await expect(dateInput).toHaveAttribute("aria-invalid", "true");
    await expect(dialog.getByText("请输入有效日期，例如 2026/06/18。"))
      .toBeVisible();

    // Escape 只丢弃尚未提交的错误文本，不改变最后一个有效业务值。
    await dateInput.press("Escape");
    await expect(dateInput).toHaveValue("2024/02/29");
    await expectDateControlValue(dateInput, "2024-02-29");
    await expect(dateInput).not.toHaveAttribute("aria-invalid", "true");

    await openDateControl(dateInput, /打开日期选择/);
    const popup = page.locator('[data-slot="date-picker-popup"]');
    await popup.locator('[data-day="2024-02-28"] button').click();
    await expectDateControlValue(dateInput, "2024-02-28");
    await expect(popup).toHaveCount(0);
    await expect(dateInput).toBeFocused();

    // Alt + ↓ 是不依赖鼠标的打开方式；月份点选后同样立即提交并关闭。
    await monthInput.focus();
    await monthInput.press("Alt+ArrowDown");
    await expect(popup).toBeVisible();
    await popup.getByRole("gridcell", { name: /3月/ }).click();
    await expectDateControlValue(monthInput, "2024-03");
    await expect(popup).toHaveCount(0);

    await openDateControl(dateInput, /打开日期选择/);
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    // 日期范围仍由两个字段维护；结束日期早于开始日期时不得污染原有筛选值。
    await page.goto("/admin/wholesale/orders");
    const fromInput = page.getByLabel("下单日期从");
    const toInput = page.getByLabel("下单日期到");
    const previousTo = await toInput.getAttribute("data-value");
    await fillDateControl(toInput, "2000/01/01");
    await expect(toInput).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("请选择允许范围内的日期或时间。"))
      .toBeVisible();
    await expectDateControlValue(toInput, previousTo ?? "");
    await expect(fromInput).not.toHaveAttribute("data-value", "");
  });

  test("日期时间在完成前保留草稿并支持小时分钟选择", async ({ page }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/tourism/vip");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    const adjustButton = page
      .locator("button:not([disabled])")
      .filter({ hasText: "调整时间", visible: true })
      .first();
    await expect(adjustButton).toBeVisible();
    await adjustButton.click();

    const dialog = page.getByRole("dialog", { name: "调整VIP时间" });
    const input = dialog.getByLabel("新的有效期");
    await fillDateControl(input, "2026/08/01 14:30");
    await expectDateControlValue(input, "2026-08-01T14:30");

    await openDateControl(input, /打开日期和时间选择/);
    const popup = page.locator('[data-slot="date-picker-popup"]');
    await popup.locator('[data-day="2026-08-02"] button').click();
    await chooseSelectOption(popup.getByLabel("小时"), { value: "15" });
    await chooseSelectOption(popup.getByLabel("分钟"), { value: "45" });
    await popup.getByRole("button", { name: "完成" }).click();
    await expectDateControlValue(input, "2026-08-02T15:45");
    await expect(input).toHaveValue("2026/08/02 15:45");

    // 日期时间只有“完成”才写入业务值；Escape 会丢弃本次日历草稿。
    await openDateControl(input, /打开日期和时间选择/);
    await popup.locator('[data-day="2026-08-03"] button').click();
    await page.keyboard.press("Escape");
    await expectDateControlValue(input, "2026-08-02T15:45");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("英文界面接受地区顺序并保持 ISO 业务值", async ({ page }) => {
    await loginAs(page, "administrator");
    await setTestLocale(page, "en");
    await page.goto("/admin/company-expenses");
    await page.getByRole("button", { name: "Add Expense" }).click();

    const dialog = page.getByRole("dialog", { name: "Add Expense" });
    const monthInput = dialog.getByLabel("Month", { exact: true });
    const dateInput = dialog.getByLabel("Paid Date", { exact: true });
    await fillDateControl(monthInput, "02/2024");
    await fillDateControl(dateInput, "02/29/2024");
    await expectDateControlValue(monthInput, "2024-02");
    await expectDateControlValue(dateInput, "2024-02-29");
    await expect(monthInput).toHaveValue("02/2024");
    await expect(dateInput).toHaveValue("02/29/2024");

    await page.keyboard.press("Escape");
    await page.goto("/admin/tourism/vip");
    const adjustButton = page
      .locator("button:not([disabled])")
      .filter({ hasText: "Adjust Time", visible: true })
      .first();
    await expect(adjustButton).toBeVisible();
    await adjustButton.click();
    const vipDialog = page.getByRole("dialog", { name: "Adjust VIP Time" });
    const dateTimeInput = vipDialog.getByRole("textbox", {
      name: /New Validity/,
    });
    await fillDateControl(dateTimeInput, "02/29/2024 09:05");
    await expectDateControlValue(dateTimeInput, "2024-02-29T09:05");
    await expect(dateTimeInput).toHaveValue("02/29/2024 09:05");
  });
});
