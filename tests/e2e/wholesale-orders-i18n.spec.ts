import { expect, test } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test("wholesale orders remain usable in English at mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await loginAs(page, "administrator");
  await page.goto("/admin/wholesale/orders");
  await expectWorkspaceShell(page);
  await expectNotForbiddenPage(page);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Wholesale order" }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Unsettled", { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await expect(page.getByText("结汇后计算", { exact: true })).toHaveCount(0);

  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflowPixels).toBeLessThanOrEqual(2);
});
