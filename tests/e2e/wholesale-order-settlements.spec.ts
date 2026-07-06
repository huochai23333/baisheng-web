import { expect, test, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe("wholesale order settlements", () => {
  test("admin can record multiple settlements with a selected date", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    const uniqueNote = `分批结汇测试 ${Date.now()}`;
    const currentMonth = getShanghaiDateInputValue().slice(0, 7);
    const settlementDate = getShanghaiDateInputValue();

    await page.getByRole("button", { name: "新建订单" }).click();

    const createDialog = page.getByRole("dialog", { name: "新建批发订单" });
    await createDialog.getByLabel("客户名").selectOption({
      label: "Wholesale Alpha",
    });
    await createDialog.getByLabel("小单数量").fill("1");
    await createDialog.getByLabel("产品采购金额").fill("10");
    await createDialog.getByLabel("国际运费").fill("1");
    await createDialog.getByLabel("其他费用").fill("0");
    await createDialog.getByLabel("推荐佣金费用").fill("0");
    await createDialog.getByLabel("快递公司").fill("DHL");
    await createDialog.getByLabel("客户支付币种").selectOption("USD");
    await createDialog.getByLabel("客户支付金额").fill("300");
    await createDialog.getByLabel("收款平台").selectOption({
      label: "Wise",
    });
    await createDialog.getByLabel("订单计入月份").fill(currentMonth);
    await createDialog.getByLabel("备注").fill(uniqueNote);
    await createDialog.getByRole("button", { name: "保存订单" }).click();

    await expect(page.getByText("批发订单已保存。")).toBeVisible();
    await page.getByLabel("搜索订单").fill(uniqueNote);

    const orderRow = page.getByRole("row").filter({ hasText: uniqueNote });
    await expect(orderRow).toBeVisible();
    await expect(orderRow).toContainText("未结汇");

    await recordSettlement(page, orderRow, "100", settlementDate);
    await expect(page.getByText("结汇记录已保存。")).toBeVisible();
    await expect(orderRow).toContainText("部分结汇");
    await expect(orderRow).toContainText("100.00");

    await recordSettlement(page, orderRow, "200", settlementDate);
    await expect(page.getByText("结汇记录已保存。")).toBeVisible();
    await expect(orderRow).toContainText("已结汇");
    await expect(orderRow).toContainText("300.00");
  });

  test("wholesale order settlement page keeps desktop and mobile layout usable", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("heading", { name: "批发订单" })).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/admin/wholesale/orders");
    await expect(page.getByRole("heading", { name: "批发订单" })).toBeVisible();
    await expect(page.getByRole("button", { name: "登记结汇" }).first()).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });
});

async function recordSettlement(
  page: Page,
  orderRow: ReturnType<Page["getByRole"]>,
  amount: string,
  settlementDate: string,
) {
  await orderRow.getByRole("button", { name: "登记结汇" }).click();

  const settlementDialog = page.getByRole("dialog", { name: "确认结汇" });
  await expect(settlementDialog).toBeVisible();
  await settlementDialog.getByLabel("本次结汇金额").fill(amount);
  await settlementDialog.getByLabel("结汇日期").fill(settlementDate);
  await expect(settlementDialog.getByText("7.18", { exact: true }).first()).toBeVisible();
  await settlementDialog.getByRole("button", { name: "保存结汇记录" }).click();
}

function getShanghaiDateInputValue() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
