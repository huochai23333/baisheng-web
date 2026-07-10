import { expect, test } from "@playwright/test";

import {
  expectForbiddenPage,
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe("workspace permission regression", () => {
  test("client cannot open the administrator workspace", async ({ page }) => {
    await loginAs(page, "client");

    await page.goto("/admin/home");

    await expectForbiddenPage(page);
  });

  test("salesman cannot open administrator review queues", async ({ page }) => {
    await loginAs(page, "salesman");

    await page.goto("/admin/tourism/reviews");

    await expectForbiddenPage(page);

    // 返回自己的首页时不应再次登录，用这个断言防止以后又把越权和退出登录混在一起。
    await page.getByRole("link", { name: "返回我的首页" }).click();
    await expect(page).toHaveURL(/\/salesman\/home(?:[?#].*)?$/);
    await expectWorkspaceShell(page);
  });

  test("salesman cannot open administrator operation records", async ({ page }) => {
    await loginAs(page, "salesman");

    await page.goto("/admin/tourism/records");

    await expectForbiddenPage(page);
  });

  test("salesman cannot open tourism business by default", async ({ page }) => {
    await loginAs(page, "salesman");

    await page.goto("/salesman/tourism/orders");

    await expectForbiddenPage(page);
  });

  test("promoter cannot open wholesale business by default", async ({ page }) => {
    await loginAs(page, "promoter");

    await page.goto("/promoter/wholesale/orders");

    await expectForbiddenPage(page);
  });

  test("client cannot open wholesale settlement releases", async ({ page }) => {
    await loginAs(page, "client");

    await page.goto("/client/wholesale/settlement-releases");

    await expectForbiddenPage(page);
  });

  test("finance can open wholesale business", async ({ page }) => {
    await loginAs(page, "finance");

    await page.goto("/finance/wholesale/orders");

    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
  });

  test("finance can open salesman wholesale customer page", async ({ page }) => {
    await loginAs(page, "finance");

    await page.goto("/finance/wholesale/customers");

    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
  });

  test("finance cannot open administrator-only wholesale pages", async ({ page }) => {
    await loginAs(page, "finance");

    await page.goto("/finance/wholesale/people");

    await expectForbiddenPage(page);
  });

  test("finance cannot open tourism business", async ({ page }) => {
    await loginAs(page, "finance");

    await page.goto("/finance/tourism/commission");

    await expectForbiddenPage(page);
  });

  test("finance cannot open salesman task workspace", async ({ page }) => {
    await loginAs(page, "finance");

    await page.goto("/salesman/tourism/tasks");

    await expectForbiddenPage(page);
  });

  test("salesman cannot open company expenses", async ({ page }) => {
    await loginAs(page, "salesman");

    await page.goto("/salesman/company-expenses");

    await expectForbiddenPage(page);
  });
});
