import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

const targetViewports = [
  { height: 900, width: 1440 },
  { height: 900, width: 768 },
  { height: 844, width: 390 },
] as const;

test("客户搜索框在桌面、平板和移动端都为图标保留文字间距", async ({
  page,
}) => {
  await loginAs(page, "administrator");

  for (const viewport of targetViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/admin/tourism/customers");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    const searchInput = page.getByRole("searchbox", { name: "搜索客户" });
    await expect(searchInput).toBeVisible();
    await expectSearchIconClearance(searchInput);

    await searchInput.fill("上海");
    await expect(searchInput).toHaveValue("上海");
    await expectDocumentToFitViewport(page);
  }
});

/**
 * 输入文字真正开始的位置等于控件左边缘加上起始内边距。
 * 这里直接比较它与图标右边缘，能防止响应式样式再次把文字挤到图标下面。
 */
async function expectSearchIconClearance(input: Locator) {
  const clearance = await input.evaluate((element) => {
    const container = element.closest('[data-slot="dashboard-search-input"]');
    const icon = container?.querySelector(
      '[data-slot="dashboard-search-input-icon"]',
    );

    if (!(element instanceof HTMLInputElement) || !(icon instanceof SVGElement)) {
      return null;
    }

    const inputRect = element.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const paddingInlineStart = Number.parseFloat(
      window.getComputedStyle(element).paddingInlineStart,
    );

    return inputRect.left + paddingInlineStart - iconRect.right;
  });

  expect(clearance).not.toBeNull();
  expect(clearance ?? 0).toBeGreaterThanOrEqual(8);
}

async function expectDocumentToFitViewport(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
