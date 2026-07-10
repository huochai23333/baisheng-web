import { expect, test, type Browser, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe("wholesale order pagination", () => {
  test("loads stable batches and searches linked numbers across all orders", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    const rows = page.locator('[data-testid^="wholesale-order-row-"]');
    await expect(rows).toHaveCount(20);
    await expect(page.getByText(/已显示 20 \/ \d+ 笔订单/)).toBeVisible();

    const firstBatchIds = await readOrderRowIds(page);
    await page.getByRole("button", { name: "继续加载" }).click();
    await expect(rows).toHaveCount(40);

    const loadedIds = await readOrderRowIds(page);
    expect(new Set(loadedIds).size).toBe(loadedIds.length);
    expect(loadedIds.slice(0, 20)).toEqual(firstBatchIds);

    await page.getByLabel("搜索订单").fill("1688-LOCAL-001");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("WH-LOCAL-202607-001");
    await expect(rows.first().getByRole("button", { name: "1688-LOCAL-001" }))
      .toBeVisible();
  });

  test("salesman and client can use wholesale order cards on mobile", async ({
    browser,
  }) => {
    await expectMobileOrderCards(browser, "salesman", "/salesman/wholesale/orders");
    await expectMobileOrderCards(browser, "client", "/client/wholesale/orders");
  });

  test("mobile shows order cards first and keeps details inside a focused dialog", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");

    await expect(page.getByLabel("搜索订单")).toBeVisible();
    await expect(page.getByText("本月概览（点击展开）")).toBeVisible();
    await expect(page.locator('[data-testid^="wholesale-order-card-"]')).toHaveCount(20);
    await expect(page.locator('[data-testid^="wholesale-order-row-"]').first()).toBeHidden();

    await page.locator('[data-testid^="wholesale-order-card-"]').first().click();

    const detailsDialog = page.getByRole("dialog", { name: /^订单 / });
    await expect(detailsDialog).toBeVisible();
    await expect(detailsDialog.getByRole("heading", { name: "费用和利润" }))
      .toBeVisible();
    await expect(detailsDialog.getByRole("heading", { name: "结汇记录" }))
      .toBeVisible();
    await expect(
      detailsDialog.getByRole("heading", { name: "关联采购和物流" }),
    ).toBeVisible();
    await expect(detailsDialog.getByRole("heading", { name: "备注" }))
      .toBeVisible();
    await expect(detailsDialog.getByRole("button", { name: /修改订单|申请修改/ }))
      .toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });

  test("shows core failures and keeps related-record failures local", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");

    await page.route("**/rest/v1/wholesale_order_settlements**", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ message: "test settlement failure" }),
        contentType: "application/json",
        status: 500,
      });
    });
    await page.getByLabel("搜索订单").fill("1688-LOCAL-001");
    await expect(page.getByText("部分结汇记录暂时没有加载成功。"))
      .toBeVisible();
    await expect(
      page.locator('[data-testid^="wholesale-order-row-"]').filter({
        hasText: "1688-LOCAL-001",
      }),
    ).toBeVisible();

    await page.unroute("**/rest/v1/wholesale_order_settlements**");
    await page.route("**/rest/v1/rpc/get_wholesale_order_page", (route) =>
      route.abort(),
    );
    await page.getByLabel("搜索订单").fill("无法加载的订单");
    await expect(
      page.getByText("批发订单暂时没有加载成功，请稍后重试。"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "重新加载" })).toBeVisible();
  });
});

async function readOrderRowIds(page: Page) {
  return page
    .locator('[data-testid^="wholesale-order-row-"]')
    .evaluateAll((rows) =>
      rows.map((row) => row.getAttribute("data-testid")?.replace("wholesale-order-row-", "") ?? ""),
    );
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}

async function expectMobileOrderCards(
  browser: Browser,
  role: "client" | "salesman",
  path: string,
) {
  const context = await browser.newContext({ viewport: { height: 844, width: 390 } });
  const page = await context.newPage();

  try {
    await loginAs(page, role);
    await page.goto(path);
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByLabel("搜索订单")).toBeVisible();
    await expect(page.locator('[data-testid^="wholesale-order-card-"]').first())
      .toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  } finally {
    await context.close();
  }
}
