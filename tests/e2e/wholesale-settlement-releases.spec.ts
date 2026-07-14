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
    const fixedCustomerSelect = claimDialog.getByLabel("客户");
    const orderSelect = claimDialog.getByLabel("匹配批发订单");
    await expect(fixedCustomerSelect).toBeDisabled();
    await expect(fixedCustomerSelect).not.toHaveValue("");
    await expect(orderSelect).toHaveValue("");
    const targetOrderValue = await orderSelect
      .locator("option")
      .filter({ hasText: targetOrderNumber })
      .getAttribute("value");
    expect(targetOrderValue).not.toBeNull();
    await expect(
      orderSelect.locator("option").filter({ hasText: targetOrderNumber }),
    ).toContainText(" · ");
    await salesmanPage.setViewportSize({ height: 844, width: 390 });
    await expectNoDocumentHorizontalOverflow(salesmanPage);
    await expectNoCompressedText(salesmanPage);
    await salesmanPage.setViewportSize({ height: 900, width: 1440 });
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
    const manualCustomerSelect = manualClaimDialog.getByLabel("客户");
    const manualOrderSelect = manualClaimDialog.getByLabel("匹配批发订单");
    await expect(manualOrderSelect).toBeDisabled();
    await manualCustomerSelect.selectOption({ label: "Wholesale Alpha" });
    await expect(manualOrderSelect).toBeEnabled();
    await expect(manualOrderSelect).toHaveValue("");
    await expect(
      manualOrderSelect.locator("option").filter({ hasText: manualTargetOrderNumber }),
    ).toHaveCount(1);
    await manualOrderSelect.selectOption(
      (await manualOrderSelect
        .locator("option")
        .filter({ hasText: manualTargetOrderNumber })
        .getAttribute("value")) ?? "",
    );
    const manualCustomerValue = await manualCustomerSelect.inputValue();
    const manualOrderValue = await manualOrderSelect.inputValue();
    const claimRequestPattern =
      "**/rest/v1/rpc/claim_wholesale_settlement_release";
    await salesmanPage.route(claimRequestPattern, async (route) => {
      await route.fulfill({
        body: JSON.stringify({ message: "forced_failure" }),
        contentType: "application/json",
        status: 500,
      });
    });
    const manualConfirmButton = manualClaimDialog.getByRole("button", {
      name: "确认匹配",
    });
    await manualConfirmButton.click();
    await expect(
      salesmanPage.getByText("操作没有成功，请检查内容和权限后再试。"),
    ).toBeVisible();
    await expect(manualClaimDialog).toBeVisible();
    await expect(manualCustomerSelect).toHaveValue(manualCustomerValue);
    await expect(manualOrderSelect).toHaveValue(manualOrderValue);

    // 失败验证完成后恢复真实请求，同一份选择应该可以直接重新提交。
    await salesmanPage.unroute(claimRequestPattern);
    await expect(manualConfirmButton).toBeEnabled();
    // 成功后弹窗会立即移除；直接派发点击可避免 Playwright 因按钮消失而误判为点击失败。
    await manualConfirmButton.dispatchEvent("click");

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

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}

async function expectNoCompressedText(page: Page) {
  const compressedText = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("button, label, option"))
      .filter((element) => {
        const text = element.innerText.trim();
        const rect = element.getBoundingClientRect();
        return (
          text &&
          rect.width > 0 &&
          rect.width < 24 &&
          rect.height > 48 &&
          rect.height > rect.width * 2.5
        );
      })
      .map((element) => element.innerText.trim())
      .slice(0, 5),
  );

  expect(compressedText).toEqual([]);
}
