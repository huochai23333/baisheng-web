import { expect, test, type Page } from "@playwright/test";

import {
  expectForbiddenPage,
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe("operator reimbursements", () => {
  test("operator can add and reimburse current records", async ({ page }) => {
    const content = `自动测试报销 ${Date.now()}`;

    await loginAs(page, "operator");
    await page.goto("/operator/reimbursements");

    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("heading", { name: "报销记录" })).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);

    await page.getByRole("button", { name: "新增报销" }).click();
    const dialog = page.getByRole("dialog", { name: "新增报销" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("发生日期").fill(getTodayDateValue());
    await dialog.getByLabel("报销金额").fill("88.66");
    await dialog.getByLabel("报销内容").fill(content);
    await dialog.getByRole("button", { name: "保存记录" }).click();

    await expect(page.getByText("记录已保存。")).toBeVisible();
    const reimbursementCard = page.locator("article").filter({ hasText: content });
    await expect(reimbursementCard).toBeVisible();
    await expect(reimbursementCard.getByText("未报销").first()).toBeVisible();
    await expect(reimbursementCard.getByText("¥88.66")).toBeVisible();

    await page.getByRole("button", { name: "报销本月" }).click();

    await expect(
      page.getByText(/本月 \d+ 条未报销记录已标记为已报销。/),
    ).toBeVisible();
    await expect(reimbursementCard.getByText("已报销").first()).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });

  test("finance cannot open operator reimbursements", async ({ page }) => {
    await loginAs(page, "finance");
    await page.goto("/finance/reimbursements");

    await expectForbiddenPage(page);
  });

  test("operator reimbursements page fits mobile width", async ({ page }) => {
    await loginAs(page, "operator");
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/operator/reimbursements");

    await expect(page.getByRole("heading", { name: "报销记录" })).toBeVisible();
    await expect(page.getByRole("button", { name: "新增报销" })).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });
});

function getTodayDateValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
