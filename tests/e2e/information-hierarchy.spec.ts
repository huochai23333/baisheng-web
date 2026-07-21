import { expect, test, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

const removedPersistentCopy = [
  "按条件分批查看批发订单",
  "电脑端保留完整表格",
  "已按收货人名字匹配到客户",
  "这里展示符合当前筛选条件的订单",
];

test.describe("全站信息层级与内容减负", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "administrator");
  });

  test("批发工作页不再显示永久教程文案或概览式大页头", async ({
    page,
  }) => {
    for (const route of [
      "/admin/wholesale/orders",
      "/admin/wholesale/order-claims",
      "/admin/wholesale/logistics",
    ]) {
      await page.goto(route);

      const header = page.locator(
        '[data-slot="dashboard-section-header"][data-presentation="work"]',
      );
      await expect(header).toBeVisible();
      await expect(
        page.locator(
          '[data-slot="dashboard-section-header"][data-presentation="overview"]',
        ),
      ).toHaveCount(0);

      for (const removedCopy of removedPersistentCopy) {
        await expect(page.getByText(removedCopy, { exact: false })).toHaveCount(
          0,
        );
      }
    }
  });

  test("全局顶栏使用轻分层边界并在各宽度保持完整", async ({ page }) => {
    for (const width of [390, 768, 1280, 1440]) {
      await page.setViewportSize({ height: 900, width });
      await page.goto("/admin/wholesale/orders");

      const workspaceHeader = page.locator('[data-slot="workspace-header"]');
      await expect(workspaceHeader).toBeVisible();
      await expect(workspaceHeader).toHaveCSS("position", "sticky");

      const boundary = await workspaceHeader.evaluate((element) => {
        const headerStyle = window.getComputedStyle(element);
        const bodyStyle = window.getComputedStyle(document.body);

        return {
          backgroundDiffersFromPage:
            headerStyle.backgroundColor !== bodyStyle.backgroundColor,
          borderBottomWidth: headerStyle.borderBottomWidth,
          boxShadow: headerStyle.boxShadow,
        };
      });

      expect(boundary.backgroundDiffersFromPage).toBe(true);
      expect(boundary.borderBottomWidth).not.toBe("0px");
      expect(boundary.boxShadow).not.toBe("none");
      await expectNoHorizontalOverflow(page);
    }
  });

  test("单一主内容区保留无障碍名称但不重复显示板块标题", async ({
    page,
  }) => {
    for (const route of [
      "/admin/wholesale/orders",
      "/admin/company-expenses",
      "/admin/feedback",
      "/admin/tourism/records",
      "/admin/tourism/tasks",
      "/admin/tourism/customers",
      "/admin/tourism/people",
    ]) {
      await page.goto(route);
      await expectWorkspaceShell(page);
      await expectNotForbiddenPage(page);
      await expectNoRepeatedRegionHeading(page);
    }

    await page.goto("/admin/wholesale/orders");
    await expect(page.getByRole("region", { name: "订单列表" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "订单列表", exact: true }),
    ).toHaveCount(0);

    await page.goto("/admin/company-expenses");
    await expect(page.getByRole("region", { name: "费用记录" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "费用记录", exact: true }),
    ).toHaveCount(0);
  });

  test("同屏并列的数据区域继续保留必要分区标题", async ({ page }) => {
    await page.goto("/admin/accounts");

    await expect(
      page.getByRole("heading", { name: "账号列表", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "最近调整", exact: true }),
    ).toBeVisible();
  });

  test("标签页命名后不生成空标题并保留紧凑操作栏", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/admin/tourism/tasks");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await page.getByRole("button", { name: /任务审核/ }).click();
    const reviewRegion = page.getByRole("region", { name: "任务审核" });
    await expect(reviewRegion).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "任务审核", exact: true }),
    ).toHaveCount(0);
    await expect(reviewRegion.getByRole("button", { name: "刷新审核" })).toBeVisible();

    await page.getByRole("button", { name: /任务媒体库/ }).click();
    const mediaRegion = page.getByRole("region", { name: "任务媒体库" });
    const mediaToolbar = mediaRegion.locator(
      '[data-slot="dashboard-list-toolbar"]',
    );
    const refreshButton = mediaToolbar.getByRole("button", {
      name: "刷新媒体库",
    });

    await expect(mediaRegion).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "任务媒体库", exact: true }),
    ).toHaveCount(0);
    await expect(mediaToolbar).toBeVisible();
    await expect(refreshButton).toBeVisible();
    const refreshButtonHeight = (await refreshButton.boundingBox())?.height ?? 0;
    // 浏览器在不同像素比下可能把 CSS 的 44px 返回为 43.999...，取整后再检查真实触控尺寸。
    expect(Math.round(refreshButtonHeight)).toBeGreaterThanOrEqual(44);
    await expectNoHorizontalOverflow(page);
  });

  test("物流摘要按主状态、更新时间和币种运费分层展示", async ({ page }) => {
    await page.goto("/admin/wholesale/logistics");

    const summary = page.locator(
      '[data-slot="dashboard-operational-summary"]',
    );
    await expect(summary).toBeVisible();
    await expect(summary.locator('[data-summary-tier="primary"] > div')).toHaveCount(
      3,
    );
    await expect(summary.locator('[data-summary-tier="meta"]')).toContainText(
      "最近更新时间",
    );
    await expect(
      summary.locator('[data-summary-tier="secondary"]'),
    ).toContainText("国际运费");

    for (const width of [390, 768, 1280, 1440]) {
      await page.setViewportSize({ height: 900, width });
      await page.goto("/admin/wholesale/logistics");
      await expectNoHorizontalOverflow(page);
      await expectSummaryContentFits(page);

      if (width === 390) {
        await expect(
          page.getByPlaceholder("包裹号、物流号或店铺名称"),
        ).toBeInViewport();
      }
    }
  });

  test("工作页在移动端突出状态，在桌面端让记录进入首屏", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/admin/wholesale/order-claims");
    await expect(page.getByRole("button", { name: /待分类/ })).toBeInViewport();
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/admin/wholesale/orders");
    await expectCompactMetricContentFits(page);
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ height: 900, width: 1440 });
    await page.goto("/admin/wholesale/orders");
    await expect(page.getByRole("region", { name: "订单列表" })).toBeInViewport();
    await expect(
      page.getByRole("heading", { name: "订单列表", exact: true }),
    ).toHaveCount(0);
    await expect(page.locator("tbody tr").first()).toBeInViewport();
    await expectNoHorizontalOverflow(page);
  });

  test("旅游订单和公司费用采用相同的紧凑工作页头", async ({ page }) => {
    for (const route of [
      "/admin/tourism/orders",
      "/admin/company-expenses",
    ]) {
      await page.goto(route);
      await expect(
        page.locator(
          '[data-slot="dashboard-section-header"][data-presentation="work"]',
        ),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });
});

async function expectSummaryContentFits(page: Page) {
  const overflowItems = await page
    .locator(
      '[data-slot="dashboard-operational-summary"] :is(dt, dd, [data-summary-tier="meta"] span)',
    )
    .evaluateAll((elements) =>
      elements
        .map((element) => ({
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          text: element.textContent?.trim() ?? "",
        }))
        .filter((item) => item.scrollWidth > item.clientWidth + 1),
    );

  expect(overflowItems).toEqual([]);
}

async function expectCompactMetricContentFits(page: Page) {
  const metrics = await page
    .locator('[data-slot="metric-card"][data-presentation="compact"]')
    .evaluateAll((elements) =>
      elements
        // 响应式数据视图会同时保留一份隐藏内容，只检查当前真正显示的摘要卡。
        .filter((element) => element.getBoundingClientRect().width > 0)
        .map((element) => {
          const label = element.querySelector("p");
          const value = element.lastElementChild;
          const labelStyle = label ? window.getComputedStyle(label) : null;
          const lineHeight = Number.parseFloat(labelStyle?.lineHeight ?? "0");

          return {
            labelLines:
              label && lineHeight > 0
                ? label.getBoundingClientRect().height / lineHeight
                : 0,
            valueOverflow:
              value instanceof HTMLElement
                ? value.scrollWidth - value.clientWidth
                : 0,
          };
        }),
    );

  expect(metrics).toHaveLength(4);
  expect(metrics.every((metric) => metric.labelLines < 1.6)).toBe(true);
  expect(metrics.every((metric) => metric.valueOverflow <= 1)).toBe(true);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectNoRepeatedRegionHeading(page: Page) {
  const repeatedHeadings = await page.locator("section[aria-label]").evaluateAll(
    (sections) =>
      sections
        .map((section) => {
          const ariaLabel = section.getAttribute("aria-label")?.trim() ?? "";
          const repeatedHeading = Array.from(
            section.querySelectorAll("h2, h3, h4"),
          ).find((heading) => heading.textContent?.trim() === ariaLabel);

          return repeatedHeading ? ariaLabel : null;
        })
        .filter(Boolean),
  );

  expect(repeatedHeadings).toEqual([]);
}
