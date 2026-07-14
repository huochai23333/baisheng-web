import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers/auth";
import {
  restoreDefaultAdminBusinessGroups,
  setDesktopBusinessGroupExpanded,
} from "./helpers/workspace-navigation";

test.describe("global review center entrypoint", () => {
  test("administrator review center is a global desktop navigation item", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/home");

    const sidebar = page.locator("aside").first();
    const navigation = sidebar.locator("nav");
    const reviewLink = sidebar.getByRole("link", {
      name: "审核中心",
      exact: true,
    });
    const tourismGroupButton = sidebar.getByRole("button", {
      name: "旅游业务",
      exact: true,
    });

    await expect(reviewLink).toHaveAttribute("href", "/admin/reviews");
    await expect(reviewLink).toHaveCount(1);

    // 顶层导航的前两个入口必须固定为首页和审核中心，避免以后又把审核中心塞回业务分组。
    const topLevelLabels = await navigation
      .locator(":scope > a, :scope > div > button")
      .allTextContents();
    expect(topLevelLabels.slice(0, 2).map((label) => label.trim())).toEqual([
      "首页",
      "审核中心",
    ]);

    await setDesktopBusinessGroupExpanded(page, "旅游业务", false);
    await expect(tourismGroupButton).toHaveAttribute("aria-expanded", "false");
    await expect(reviewLink).toBeVisible();

    // 页面总宽度不能超过浏览器可视宽度，否则侧栏或新版系统名称会造成横向滚动。
    const desktopHasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(desktopHasHorizontalOverflow).toBe(false);

    await restoreDefaultAdminBusinessGroups(page);
  });

  test("administrator review center stays global in mobile navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 812, width: 375 });
    await loginAs(page, "administrator");
    await page.goto("/admin/home");

    const mobileHeader = page.locator("header");
    await mobileHeader.getByRole("button", { name: "首页", exact: true }).click();

    const mobileNavigation = mobileHeader.locator("nav");
    const reviewLink = mobileNavigation.getByRole("link", {
      name: "审核中心",
      exact: true,
    });
    const tourismGroupLabel = mobileNavigation.getByText("旅游业务", {
      exact: true,
    });

    await expect(reviewLink).toHaveAttribute("href", "/admin/reviews");
    await expect(reviewLink).toBeVisible();
    await expect(tourismGroupLabel).toBeVisible();

    // 移动菜单按纵向排列，通过位置断言确保审核中心仍位于业务分组标题之前。
    const reviewBox = await reviewLink.boundingBox();
    const tourismBox = await tourismGroupLabel.boundingBox();
    expect(reviewBox).not.toBeNull();
    expect(tourismBox).not.toBeNull();
    expect(reviewBox!.y).toBeLessThan(tourismBox!.y);

    await reviewLink.click();
    await expect(page).toHaveURL(/\/admin\/reviews(?:[?#].*)?$/);
    await expect(
      page.getByRole("heading", { name: "审核中心", exact: true }),
    ).toBeVisible();

    // 移动端同样禁止横向溢出，避免标题、按钮或审核列表被压到屏幕之外。
    const mobileHasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(mobileHasHorizontalOverflow).toBe(false);
  });
});
