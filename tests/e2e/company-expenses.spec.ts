import { expect, test, type Page } from "@playwright/test";

import {
  expectForbiddenPage,
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe("company expenses", () => {
  test("administrator can open company expenses", async ({ page }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/company-expenses");

    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("heading", { name: "公司费用" })).toBeVisible();
  });

  test("finance can open company expenses", async ({ page }) => {
    await loginAs(page, "finance");
    await page.goto("/finance/company-expenses");

    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("heading", { name: "公司费用" })).toBeVisible();
  });

  test("salesman cannot open company expenses", async ({ page }) => {
    await loginAs(page, "salesman");
    await page.goto("/salesman/company-expenses");

    await expectForbiddenPage(page);
  });

  test("finance can create and delete a company expense", async ({ page }) => {
    const title = `自动测试费用 ${Date.now()}`;

    await loginAs(page, "finance");
    await page.goto("/finance/company-expenses");
    await expectWorkspaceShell(page);

    await page.getByRole("button", { name: "新增费用" }).click();
    const dialog = page.getByRole("dialog", { name: "新增费用" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("所属月份").fill(getCurrentMonthValue());
    await dialog.getByLabel("费用名称").fill(title);
    await dialog.getByLabel("费用分类").selectOption("office");
    await dialog.getByLabel("金额").fill("123.45");
    await dialog.getByLabel("币种").selectOption("CNY");
    await dialog.getByLabel("收款方").fill("自动测试收款方");
    await dialog.getByLabel("备注").fill("用于公司费用页面回归测试");
    await dialog.getByRole("button", { name: "保存费用" }).click();

    await expect(page.getByText("费用已保存。")).toBeVisible();
    const expenseCard = page.locator("article").filter({ hasText: title });
    await expect(expenseCard).toBeVisible();
    await expect(expenseCard.getByText("¥123.45")).toBeVisible();

    page.once("dialog", (confirmDialog) => {
      void confirmDialog.accept();
    });
    await expenseCard.getByRole("button", { name: "删除" }).click();

    await expect(page.getByText("费用已删除。")).toBeVisible();
    await expect(expenseCard).toHaveCount(0);
  });

  test("company expenses page fits mobile width", async ({ page }) => {
    await loginAs(page, "finance");
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/finance/company-expenses");

    await expect(page.getByRole("heading", { name: "公司费用" })).toBeVisible();
    await expect(page.getByRole("button", { name: "新增费用" })).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });
});

function getCurrentMonthValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${now.getFullYear()}-${month}`;
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
