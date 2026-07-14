import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";
import {
  createLocalLogisticsPaginationFixture,
  hasLocalLogisticsFixtureSupport,
} from "./helpers/local-logistics-fixture";

test.describe.configure({ mode: "serial" });

test.describe("批发物流关联、筛选和权限", () => {
  test("管理员可使用创建弹窗、独立筛选并关联两类记录", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ height: 900, width: 1440 });
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/logistics");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    // 顶部只保留创建按钮，客户选定后订单下拉只展示该客户的订单。
    await page.getByRole("button", { name: "创建物流记录" }).click();
    const createDialog = page.getByRole("dialog", { name: "创建物流记录" });
    await expect(createDialog).toBeVisible();
    const createCustomer = createDialog.getByLabel("归属客户");
    const createOrder = createDialog.getByLabel("关联批发订单");
    await expect(createOrder).toBeDisabled();
    await createCustomer.selectOption({ label: "Wholesale Alpha" });
    await expect(createOrder).toBeEnabled();
    const firstCreateOrder = createOrder.locator("option").nth(1);
    await expect(firstCreateOrder).toContainText("WH-LOCAL-");
    await expect(firstCreateOrder).toContainText(" · ");
    await createOrder.selectOption(
      (await firstCreateOrder.getAttribute("value")) ?? "",
    );
    await createCustomer.selectOption({ label: "Wholesale Beta" });
    await expect(createOrder).toHaveValue("");
    await createDialog.getByRole("button", { name: "取消" }).click();

    const statusSection = sectionByHeading(page, "每日核对列表");
    const feeSection = sectionByHeading(page, "物流费用记录");

    // 两张列表拥有独立筛选状态，修改费用筛选不会清空每日核对条件。
    await statusSection.getByLabel("搜索").fill("UNMATCHED-LOCAL-ASSERT-001");
    const statusRow = statusSection.getByRole("row").filter({
      hasText: "UNMATCHED-LOCAL-ASSERT-001",
    });
    await expect(statusRow).toBeVisible();
    await ensureUnlinked(page, statusRow);
    await statusSection.getByLabel("关联情况").selectOption("unlinked");
    await statusSection.getByLabel("物流状态").selectOption("checking");

    await feeSection
      .getByLabel("搜索")
      .fill("CLIENT-UNLINKED-LOGISTICS-ORDER");
    await expect(statusSection.getByLabel("搜索")).toHaveValue(
      "UNMATCHED-LOCAL-ASSERT-001",
    );
    const feeRow = feeSection.getByRole("row").filter({
      hasText: "CLIENT-UNLINKED-LOGISTICS-ORDER",
    });
    await expect(feeRow).toBeVisible();
    await ensureUnlinked(page, feeRow);

    // 自动同步记录支持关联、改绑和解除；每次成功只刷新当前列表。
    await statusRow.getByRole("button", { name: "关联订单" }).click();
    await saveLinkDialog(page, "Wholesale Alpha");
    await statusSection.getByLabel("关联情况").selectOption("all");
    const linkedStatusRow = statusSection.getByRole("row").filter({
      hasText: "UNMATCHED-LOCAL-ASSERT-001",
    });
    await expect(linkedStatusRow).toContainText("WH-LOCAL-");

    await linkedStatusRow.getByRole("button", { name: "调整关联" }).click();
    await expect(
      page
        .getByRole("dialog", { name: "调整关联订单" })
        .getByLabel("关联批发订单"),
    ).not.toHaveValue("");
    await saveLinkDialog(page, "Wholesale Beta");
    await expect(linkedStatusRow).toContainText("WH-LOCAL-");

    await linkedStatusRow.getByRole("button", { name: "解除关联" }).click();
    const statusUnlinkDialog = page.getByRole("dialog", {
      name: "解除订单关联",
    });
    await expect(statusUnlinkDialog).toContainText("客户将看不到这条物流记录");
    await statusUnlinkDialog
      .getByRole("button", { name: "确认解除关联" })
      .click();
    await expect(linkedStatusRow).toContainText("未关联");

    // 历史费用记录使用相同交互，但刷新和筛选状态与每日核对列表互不影响。
    await feeRow.getByRole("button", { name: "关联订单" }).click();
    await saveLinkDialog(page, "Wholesale Alpha");
    await expect(feeRow).toContainText("WH-LOCAL-");
    await feeRow.getByRole("button", { name: "解除关联" }).click();
    await page
      .getByRole("dialog", { name: "解除订单关联" })
      .getByRole("button", { name: "确认解除关联" })
      .click();
    await expect(feeRow).toContainText("未关联");

    await expectResponsiveLayout(page);
  });

  test("两张列表固定显示 50 条并可稳定继续加载", async ({ page }) => {
    test.skip(
      !hasLocalLogisticsFixtureSupport(),
      "分页临时数据只在本地 Docker 回归中创建",
    );
    test.setTimeout(120_000);
    const fixture = await createLocalLogisticsPaginationFixture();

    try {
      await page.setViewportSize({ height: 900, width: 1440 });
      await loginAs(page, "administrator");
      await page.goto("/admin/wholesale/logistics");
      const statusSection = sectionByHeading(page, "每日核对列表");
      const feeSection = sectionByHeading(page, "物流费用记录");

      await expect(statusSection.getByText(/已显示 50 条，共 \d+ 条/)).toBeVisible();
      await statusSection.getByRole("button", { name: "继续加载" }).click();
      await expect
        .poll(() => statusSection.locator("tbody tr").count())
        .toBeGreaterThan(50);

      await expect(feeSection.getByText(/已显示 50 条，共 \d+ 条/)).toBeVisible();
      await feeSection.getByRole("button", { name: "继续加载" }).click();
      await expect
        .poll(() => feeSection.locator("tbody tr").count())
        .toBeGreaterThan(50);
      await expectResponsiveLayout(page);
    } finally {
      await fixture.cleanup();
    }
  });

  test("业务员保留完整物流协作入口", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await loginAs(page, "salesman");
    await page.goto("/salesman/wholesale/logistics");
    await expect(page.getByRole("button", { name: "创建物流记录" })).toBeVisible();
    const salesmanStatusSection = sectionByHeading(page, "每日核对列表");
    await salesmanStatusSection
      .getByLabel("搜索")
      .fill("UNMATCHED-LOCAL-ASSERT-001");
    await expect(
      salesmanStatusSection
        .getByRole("button", { name: "关联订单" })
        .first(),
    ).toBeVisible();

    await expectResponsiveLayout(page);
  });

  test("财务按记录范围显示物流操作", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await loginAs(page, "finance");
    await page.goto("/finance/wholesale/logistics");
    await expect(page.getByRole("button", { name: "创建物流记录" })).toBeVisible();
    const financeFeeSection = sectionByHeading(page, "物流费用记录");
    await financeFeeSection
      .getByLabel("搜索")
      .fill("CLIENT-UNLINKED-LOGISTICS-ORDER");
    await expect(financeFeeSection.getByText("仅查看").first()).toBeVisible();
    await expectResponsiveLayout(page);
  });

  test("客户只能筛选和查看已关联到自己的物流记录", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await loginAs(page, "client");
    await page.goto("/client/wholesale/logistics");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(
      page.getByRole("button", { name: "创建物流记录" }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "关联订单" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "调整关联" })).toHaveCount(0);

    const statusSection = sectionByHeading(page, "每日核对列表");
    await statusSection
      .getByLabel("搜索")
      .fill("CLIENT-UNLINKED-LOGISTICS-STATUS");
    await expect(statusSection.getByText("已显示 0 条，共 0 条")).toBeVisible();

    const feeSection = sectionByHeading(page, "物流费用记录");
    await feeSection
      .getByLabel("搜索")
      .fill("CLIENT-UNLINKED-LOGISTICS-ORDER");
    await expect(feeSection.getByText("已显示 0 条，共 0 条")).toBeVisible();
    await expectResponsiveLayout(page);
  });
});

async function saveLinkDialog(page: Page, customerName: string) {
  const dialog = page.getByRole("dialog", {
    name: /关联批发订单|调整关联订单/,
  });
  const customerSelect = dialog.getByLabel("归属客户");
  const orderSelect = dialog.getByLabel("关联批发订单");
  await customerSelect.selectOption({ label: customerName });
  await orderSelect.selectOption(await firstNonEmptyOptionValue(orderSelect));
  await dialog.getByRole("button", { name: "保存关联" }).click();
  await expect(dialog).toBeHidden();
}

async function ensureUnlinked(page: Page, row: Locator) {
  const unlinkButton = row.getByRole("button", { name: "解除关联" });
  if ((await unlinkButton.count()) === 0) return;

  // 上一次调试中断也可能留下关联；先恢复到可重复执行的未关联状态。
  await unlinkButton.click();
  await page
    .getByRole("dialog", { name: "解除订单关联" })
    .getByRole("button", { name: "确认解除关联" })
    .click();
  await expect(row).toContainText("未关联");
}

function sectionByHeading(page: Page, heading: string) {
  return page
    .getByRole("heading", { name: heading })
    .locator("xpath=ancestor::section[1]");
}

async function firstNonEmptyOptionValue(select: Locator) {
  const value = await select.locator("option").nth(1).getAttribute("value");
  expect(value).not.toBeNull();
  expect(value).not.toBe("");
  return value ?? "";
}

async function expectResponsiveLayout(page: Page) {
  await expectNoDocumentHorizontalOverflow(page);
  await expectNoCompressedText(page);
  await page.setViewportSize({ height: 844, width: 390 });
  await expectNoDocumentHorizontalOverflow(page);
  await expectNoCompressedText(page);
  await page.setViewportSize({ height: 900, width: 1440 });
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflowPixels).toBeLessThanOrEqual(2);
}

async function expectNoCompressedText(page: Page) {
  const compressedText = await page.evaluate(() => {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>("button, label, th, td"),
    );
    return candidates
      .filter((element) => {
        const text = element.innerText.trim();
        const rect = element.getBoundingClientRect();
        if (!text || rect.width === 0 || rect.height === 0) return false;
        // 正常换行允许两三行；极窄且高度远大于宽度通常表示中文被挤成竖排。
        return rect.width < 24 && rect.height > 48 && rect.height > rect.width * 2.5;
      })
      .map((element) => element.innerText.trim())
      .slice(0, 5);
  });
  expect(compressedText).toEqual([]);
}
