import { expect, test, type Page } from "@playwright/test";

import { getRegressionAccount } from "./helpers/accounts";
import { loginAs, setTestLocale } from "./helpers/auth";

test.describe("legacy tourism business shutdown", () => {
  test("tourism-only account signs in to the service notice and can sign out", async ({
    page,
  }) => {
    const account = getRegressionAccount("promoter");

    await setTestLocale(page, "zh");
    await page.goto("/login");
    await page.locator('input[name="email"]').fill(account.email);
    await page.locator('input[name="password"]').fill(account.password);
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/business-unavailable(?:[?#].*)?$/);
    await expect(
      page.getByRole("heading", { name: "当前没有可使用的业务" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "退出登录" })).toBeVisible();
    await expect(page.locator("aside")).toHaveCount(0);
    await expect(page.getByTestId("ai-assistant-launcher")).toHaveCount(0);

    await page.getByRole("link", { name: "退出登录" }).click();
    await expect(page).toHaveURL(/\/login(?:[?#].*)?$/);
  });

  test("known tourism routes show the notice while unknown businesses remain 404", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/tourism/orders");

    await expect(page).toHaveURL(
      /\/business-unavailable\?business=tourism$/,
    );
    await expect(
      page.getByRole("heading", { name: "旅游业务暂时停止服务" }),
    ).toBeVisible();
    await expect(page.locator("aside")).toHaveCount(0);
    await expect(page.getByTestId("ai-assistant-launcher")).toHaveCount(0);

    await page.goto("/admin/not-a-business/orders");
    await expect(
      page.getByRole("heading", { name: "你访问的页面不存在" }),
    ).toBeVisible();
  });

  test("administrator navigation and salesman invite summary only expose wholesale", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");

    const sidebar = page.locator("aside").first();
    await expect(sidebar.getByText("旅游业务", { exact: true })).toHaveCount(0);
    await expect(sidebar.getByText("批发业务", { exact: true })).toBeVisible();

    await page.goto("/auth/sign-out?next=%2Flogin");
    await loginAs(page, "salesman");
    await page.goto("/salesman/home");
    await expect(page.getByText("旅游业务", { exact: true })).toHaveCount(0);
    await expect(page.getByText("批发业务", { exact: true })).not.toHaveCount(0);
  });

  for (const role of [
    "administrator",
    "finance",
    "salesman",
    "client",
  ] as const) {
    test(`${role} keeps access to the wholesale workspace`, async ({ page }) => {
      const account = await loginAs(page, role);
      await page.goto(`${account.workspacePath}/wholesale/orders`);

      await expect(page).not.toHaveURL(/business-unavailable/);
      await expect(page.locator("main")).toBeVisible();
    });
  }

  test("forged tourism API request returns the stable unavailable result", async ({
    request,
  }) => {
    const response = await request.post("/api/business-vip", {
      data: {
        business: "tourism",
        operation: "request",
        targetId: "00000000-0000-0000-0000-000000000000",
      },
    });

    expect(response.status()).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "businessUnavailable",
    });
  });

  test("service notice and registration stay usable at 390px", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    const account = getRegressionAccount("promoter");

    await setTestLocale(page, "zh");
    await page.goto("/login");
    await page.locator('input[name="email"]').fill(account.email);
    await page.locator('input[name="password"]').fill(account.password);
    await page.locator('form button[type="submit"]').click();
    await expect(
      page.getByRole("heading", { name: "当前没有可使用的业务" }),
    ).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);

    await page.getByRole("link", { name: "退出登录" }).click();
    await expect(page).toHaveURL(/\/login(?:[?#].*)?$/);
    await page.goto("/register");
    await page.getByRole("button", { name: "下一步" }).click();
    await expect(page.getByText("填写账号资料")).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });
});

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
