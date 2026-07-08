import { expect, type Page } from "@playwright/test";

import {
  getRegressionAccount,
  type RegressionAccount,
  type RegressionRole,
} from "./accounts";

export type { RegressionRole } from "./accounts";

export async function loginAs(
  page: Page,
  role: RegressionRole,
): Promise<RegressionAccount> {
  const account = getRegressionAccount(role);

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(account.email);
  await page.locator('input[name="password"]').fill(account.password);
  await page.locator('form button[type="submit"]').click();

  await expect(page).toHaveURL(
    new RegExp(`${escapeRegExp(account.workspacePath)}/home(?:[?#].*)?$`),
    { timeout: 30_000 },
  );
  await expectWorkspaceShell(page);
  await dismissWorkspaceAnnouncements(page);

  return account;
}

export async function expectWorkspaceShell(page: Page) {
  await expect(page.getByRole("heading", { name: "柏盛管理系统" })).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
}

export async function expectForbiddenPage(page: Page) {
  // 未授权访问现在会先经过服务端退出入口，再回到登录页。
  // 这里继续保留旧函数名，避免大量权限用例重复描述同一个回归断言。
  await expect(page).toHaveURL(/\/login(?:[?#].*)?$/, { timeout: 30_000 });
  await expect(page.locator('input[name="email"]')).toBeVisible();
}

export async function expectNotForbiddenPage(page: Page) {
  // 正常可访问的页面不应该被权限拦截踢回登录页。
  await expect(page).not.toHaveURL(/\/login(?:[?#].*)?$/);
  await expect(page.locator('input[name="email"]')).toHaveCount(0);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function dismissWorkspaceAnnouncements(page: Page) {
  const acknowledgeButton = page.getByRole("button", { name: "我知道了" });

  if (await acknowledgeButton.isVisible().catch(() => false)) {
    await acknowledgeButton.click();
    await expect(acknowledgeButton).toHaveCount(0);
  }
}
