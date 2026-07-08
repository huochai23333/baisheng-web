import { expect, test, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe("wholesale settlement releases", () => {
  test("finance publishes releases and salesman claims one into an order", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(150_000);
    const uniqueSuffix = Date.now();
    const claimNote = `结汇发布认领 ${uniqueSuffix}`;
    const manualCustomerName = `临时结汇客户 ${uniqueSuffix}`;
    const manualClaimCustomerName = `临时认领客户 ${uniqueSuffix}`;
    const manualClaimNote = `手填客户认领 ${uniqueSuffix}`;
    const receivedDate = getShanghaiDateInputValue();
    const currentMonth = receivedDate.slice(0, 7).replace("-", "");
    const monthRange = getMonthRange(receivedDate);
    const targetOrderNumber = `WH-LOCAL-${currentMonth}-004`;
    const manualTargetOrderNumber = `WH-LOCAL-${currentMonth}-008`;

    const financePage = await browser.newPage();
    await loginAs(financePage, "finance");
    await financePage.goto("/finance/wholesale/settlement-releases");
    await expectWorkspaceShell(financePage);
    await expectNotForbiddenPage(financePage);
    await expect(
      financePage.getByRole("heading", { name: "结汇发布" }),
    ).toBeVisible();

    await publishRelease(financePage, {
      amount: "1.37",
      customerLabel: "Wholesale Alpha",
      currency: "CNY",
      note: claimNote,
      receivedDate,
    });
    await expect(financePage.getByText("结汇收款已发布。")).toBeVisible();
    await financePage.getByLabel("搜索收款").fill(claimNote);
    await expect(financePage.getByRole("row").filter({ hasText: claimNote }))
      .toBeVisible();

    await publishRelease(financePage, {
      amount: "2.46",
      customerName: manualCustomerName,
      currency: "CNY",
      note: `手填客户 ${uniqueSuffix}`,
      receivedDate,
    });
    await expect(financePage.getByText("结汇收款已发布。")).toBeVisible();
    await financePage.getByLabel("搜索收款").fill(manualCustomerName);

    const manualRow = financePage.getByRole("row").filter({
      hasText: manualCustomerName,
    });
    await expect(manualRow).toBeVisible();
    await manualRow.getByRole("button", { name: "取消" }).click();
    await expect(financePage.getByText("这条结汇收款已取消。")).toBeVisible();
    await expect(manualRow).toContainText("已取消");

    await publishRelease(financePage, {
      amount: "3.21",
      customerName: manualClaimCustomerName,
      currency: "CNY",
      note: manualClaimNote,
      receivedDate,
    });
    await expect(financePage.getByText("结汇收款已发布。")).toBeVisible();
    await financePage.close();

    const salesmanPage = await browser.newPage();
    await loginAs(salesmanPage, "salesman");
    await salesmanPage.goto("/salesman/wholesale/settlement-releases");
    await expectWorkspaceShell(salesmanPage);
    await expectNotForbiddenPage(salesmanPage);
    await expect(
      salesmanPage.getByRole("button", { name: "发布收款" }),
    ).toHaveCount(0);

    await salesmanPage.getByLabel("搜索收款").fill(claimNote);
    const claimRow = salesmanPage.getByRole("row").filter({ hasText: claimNote });
    await expect(claimRow).toBeVisible();
    await expect(claimRow.getByRole("button", { name: "取消" })).toHaveCount(0);
    await claimRow.getByRole("button", { name: "认领匹配" }).click();

    const claimDialog = salesmanPage.getByRole("dialog", { name: "认领结汇收款" });
    await expect(claimDialog).toBeVisible();
    const orderSelect = claimDialog.getByLabel("匹配订单");
    const targetOrderValue = await orderSelect
      .locator("option")
      .filter({ hasText: targetOrderNumber })
      .getAttribute("value");
    expect(targetOrderValue).not.toBeNull();
    await orderSelect.selectOption(targetOrderValue ?? "");
    await claimDialog.getByRole("button", { name: "确认匹配" }).click();

    await expect(salesmanPage.getByText("结汇收款已匹配到订单。")).toBeVisible();
    await expect(claimRow).toContainText("已匹配");
    await expect(claimRow).toContainText(targetOrderNumber);
    await expect(claimRow.getByRole("button", { name: "认领匹配" })).toHaveCount(0);

    await salesmanPage.getByLabel("搜索收款").fill(manualClaimNote);
    const manualClaimRow = salesmanPage.getByRole("row").filter({
      hasText: manualClaimNote,
    });
    await expect(manualClaimRow).toBeVisible();
    await manualClaimRow.getByRole("button", { name: "认领匹配" }).click();

    const manualClaimDialog = salesmanPage.getByRole("dialog", {
      name: "认领结汇收款",
    });
    await expect(manualClaimDialog).toBeVisible();
    await manualClaimDialog.getByLabel("搜索订单").fill(manualTargetOrderNumber);
    await manualClaimDialog.getByLabel("下单日期从").fill(monthRange.from);
    await manualClaimDialog.getByLabel("下单日期到").fill(monthRange.to);

    const manualOrderSelect = manualClaimDialog.getByLabel("匹配订单");
    await expect(
      manualOrderSelect.locator("option").filter({ hasText: manualTargetOrderNumber }),
    ).toHaveCount(1);
    await manualOrderSelect.selectOption(
      (await manualOrderSelect
        .locator("option")
        .filter({ hasText: manualTargetOrderNumber })
        .getAttribute("value")) ?? "",
    );
    await manualClaimDialog.getByRole("button", { name: "确认匹配" }).click();

    await expect(salesmanPage.getByText("结汇收款已匹配到订单。")).toBeVisible();
    await expect(manualClaimRow).toContainText("已匹配");
    await expect(manualClaimRow).toContainText(manualTargetOrderNumber);
    await expect(
      manualClaimRow.getByRole("button", { name: "认领匹配" }),
    ).toHaveCount(0);

    await salesmanPage.goto("/salesman/wholesale/orders");
    await expect(salesmanPage.getByRole("heading", { name: "批发订单" }))
      .toBeVisible();
    await expect(
      salesmanPage.getByRole("button", { name: "登记结汇" }).first(),
    ).toBeVisible();
    await salesmanPage.getByLabel("搜索订单").fill(targetOrderNumber);

    const orderRow = salesmanPage.getByRole("row").filter({
      hasText: targetOrderNumber,
    });
    await expect(orderRow).toBeVisible();
    await expect(orderRow).toContainText("已结");
    await expect(orderRow).toContainText("剩余");
    await expect(orderRow).toContainText("1.37");

    await expectNoDocumentHorizontalOverflow(salesmanPage);
    await salesmanPage.setViewportSize({ height: 844, width: 390 });
    await salesmanPage.goto("/salesman/wholesale/settlement-releases");
    await expect(
      salesmanPage.getByRole("heading", { name: "结汇发布" }),
    ).toBeVisible();
    await expectNoDocumentHorizontalOverflow(salesmanPage);
    await salesmanPage.close();
  });
});

async function publishRelease(
  page: Page,
  options: {
    amount: string;
    currency: string;
    note: string;
    receivedDate: string;
    customerLabel?: string;
    customerName?: string;
  },
) {
  await page.getByRole("button", { name: "发布收款" }).click();

  const dialog = page.getByRole("dialog", { name: "发布结汇收款" });
  await expect(dialog).toBeVisible();

  if (options.customerLabel) {
    await dialog.getByRole("combobox", { name: "选择客户" }).selectOption({
      label: options.customerLabel,
    });
  } else {
    await dialog.getByLabel("客户名称").fill(options.customerName ?? "");
  }

  await dialog.getByLabel("结汇金额").fill(options.amount);
  await dialog.getByLabel("币种").selectOption(options.currency);
  await dialog.getByLabel("收款日期").fill(options.receivedDate);
  await dialog.getByLabel("备注").fill(options.note);
  await dialog.getByRole("button", { name: "发布收款" }).click();
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

function getMonthRange(dateValue: string) {
  const [year, month] = dateValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const monthValue = String(month).padStart(2, "0");

  return {
    from: `${year}-${monthValue}-01`,
    to: `${year}-${monthValue}-${String(lastDay).padStart(2, "0")}`,
  };
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
