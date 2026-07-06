import { expect, test, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe("wholesale customer other names", () => {
  test("admin can add another name from customer details", async ({ page }) => {
    const aliasName = `自动测试别名 ${Date.now()}`;

    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/customers");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await openWholesaleAlphaCustomer(page);

    const detailsDialog = page.getByRole("dialog", { name: "Wholesale Alpha" });
    await expect(detailsDialog).toBeVisible();
    await detailsDialog.getByRole("button", { name: "新增名称" }).click();
    await detailsDialog.getByLabel("新增其他名称").fill(aliasName);
    await detailsDialog.getByRole("button", { name: "保存名称" }).click();

    await expect(page.getByText("客户其他名称已保存。")).toBeVisible();
    await expect(detailsDialog.getByText(aliasName)).toBeVisible();
  });

  test("customer details name form stays usable on mobile width", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/admin/wholesale/customers");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await openWholesaleAlphaCustomer(page);

    const detailsDialog = page.getByRole("dialog", { name: "Wholesale Alpha" });
    await expect(detailsDialog).toBeVisible();
    await detailsDialog.getByRole("button", { name: "新增名称" }).click();
    await expect(detailsDialog.getByLabel("新增其他名称")).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });
});

async function openWholesaleAlphaCustomer(page: Page) {
  await page
    .getByText("Wholesale Alpha", { exact: true })
    .filter({ visible: true })
    .first()
    .click();
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
