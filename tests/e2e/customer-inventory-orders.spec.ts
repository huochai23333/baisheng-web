import { expect, test, type Page } from "@playwright/test";

import { chooseSelectOption } from "./helpers/select-control";
import {
  expectForbiddenPage,
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe.configure({ mode: "serial" });

test.describe("库存订单与专属信贷", () => {
  test("管理员通过页面创建一笔待支付库存订单", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/inventory-orders");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(
      page.getByRole("heading", { level: 2, name: "库存订单" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "INV-LOCAL-001" }),
    ).toBeVisible();

    // 先覆盖关键词、状态和无结果恢复，确认筛选不会影响后续订单操作。
    const orderSearch =
      page.getByPlaceholder("订单编号、客户、业务员、币种或备注");
    await orderSearch.fill("INV-LOCAL-002");
    await expect(
      page.getByRole("cell", { name: "INV-LOCAL-002" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "INV-LOCAL-001" })).toHaveCount(
      0,
    );
    await orderSearch.fill("不存在的库存订单");
    await expect(page.getByText("没有符合筛选条件的记录")).toBeVisible();
    await page.getByRole("button", { name: "清空筛选" }).click();
    await chooseSelectOption(page.getByLabel("状态"), {
      label: "已付清",
    });
    await expect(
      page.getByRole("cell", { name: "INV-LOCAL-002" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "INV-LOCAL-001" })).toHaveCount(
      0,
    );
    await page.getByRole("button", { name: "清空筛选" }).click();

    await page.getByRole("button", { name: "创建库存订单" }).click();
    const dialog = page.getByRole("dialog", { name: "创建库存订单" });
    await chooseSelectOption(dialog.getByLabel("客户"), {
      label: "Wholesale Beta",
    });
    await chooseSelectOption(dialog.getByLabel("业务员"), {
      label: "本地业务员",
    });
    await dialog.getByLabel("购买金额").fill("350");
    await dialog.getByLabel("币种").fill("USD");
    await dialog.getByLabel("备注或说明").fill("浏览器库存信贷回归订单");
    await dialog.getByRole("button", { name: "创建订单" }).click();

    await expect(dialog).toHaveCount(0);
    await expect(page.getByText("库存订单已创建。")).toBeVisible();
    const newOrderRow = page.locator("tbody tr").filter({ hasText: "350.00" });
    await expect(newOrderRow).toContainText("Wholesale Beta");
    await expect(newOrderRow).toContainText("待支付");
    await expectNoDocumentHorizontalOverflow(page);
  });

  test("客户只能读取订单并申请固定信贷", async ({ page }) => {
    await loginAs(page, "client");
    await page.goto("/client/wholesale/inventory-orders");
    await expectNotForbiddenPage(page);

    await expect(
      page.getByRole("button", { name: "创建库存订单" }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "全额实付" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "作废" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "修改" })).toHaveCount(0);
    await expect(
      page.getByPlaceholder("订单编号、客户、业务员、币种或备注"),
    ).toBeVisible();
    const orderFilters = page.getByTestId("customer-inventory-order-filters");
    await expect(orderFilters.getByLabel("客户")).toHaveCount(0);
    await expect(orderFilters.getByLabel("业务员")).toHaveCount(0);

    const targetRow = page.locator("tbody tr").filter({ hasText: "350.00" });
    await targetRow.getByRole("button", { name: "申请信贷" }).click();
    const applyDialog = page.getByRole("dialog", { name: "申请订单信贷" });
    await applyDialog.getByLabel("固定200美元").check();
    await applyDialog.getByLabel("备注或说明").fill("申请固定档位");
    await applyDialog.getByRole("button", { name: "提交申请" }).click();

    await expect(applyDialog).toHaveCount(0);
    await expect(page.getByText("信贷申请已提交。")).toBeVisible();
  });

  test("财务统一批准信贷但没有订单写入按钮", async ({ page }) => {
    await loginAs(page, "finance");
    await page.goto("/finance/wholesale/inventory-orders");
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("button", { name: "统一审核" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "创建库存订单" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "统一审核" }).click();
    const reviewDialog = page.getByRole("dialog", {
      name: "统一审核订单信贷",
    });
    await chooseSelectOption(reviewDialog.getByLabel("审核结果"), {
      label: "批准",
    });
    await expect(reviewDialog.getByLabel("批准金额（美元）")).toBeDisabled();
    await expect(reviewDialog.getByLabel("订单剩余实付金额")).toHaveValue(
      "150",
    );
    await reviewDialog.getByRole("button", { name: "确认审核" }).click();

    await expect(reviewDialog).toHaveCount(0);
    await expect(page.getByText("订单信贷已审核。")).toBeVisible();
    await expect(page.getByText("使用中")).toBeVisible();

    await page.getByRole("button", { name: "库存订单" }).click();
    await expect(page.getByRole("button", { name: "全额实付" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "作废" })).toHaveCount(0);
    await expect(page.getByText("350.00").first()).toBeVisible();
  });

  test("客户申请延期，财务批准后一次还清", async ({ page }) => {
    await loginAs(page, "client");
    await page.goto("/client/wholesale/inventory-orders");
    await page.getByRole("button", { name: "信贷管理" }).click();
    await page.getByRole("button", { name: "申请延期" }).click();

    const extensionDialog = page.getByRole("dialog", { name: "申请延期" });
    await chooseSelectOption(extensionDialog.getByLabel("延期时长"), {
      label: "2 个月",
    });
    await extensionDialog.getByRole("button", { name: "提交延期申请" }).click();
    await expect(extensionDialog).toHaveCount(0);
    await expect(page.getByText("延期申请已提交。")).toBeVisible();
  });

  test("财务审核延期并登记还款", async ({ page }) => {
    await loginAs(page, "finance");
    await page.goto("/finance/wholesale/inventory-orders");
    await page.getByRole("button", { name: "审核延期" }).click();

    const reviewExtensionDialog = page.getByRole("dialog", {
      name: "审核延期申请",
    });
    await expect(reviewExtensionDialog.getByLabel("审核结果")).toContainText(
      "批准",
    );
    await reviewExtensionDialog
      .getByRole("button", { name: "确认审核" })
      .click();
    await expect(page.getByText("延期申请已审核。")).toBeVisible();

    await page.getByRole("button", { name: "登记一次还清" }).click();
    const repaymentDialog = page.getByRole("dialog", {
      name: "登记一次还清",
    });
    await expect(repaymentDialog.getByLabel("实际还款日期")).not.toHaveValue(
      "",
    );
    await repaymentDialog.getByRole("button", { name: "确认还清" }).click();

    await expect(repaymentDialog).toHaveCount(0);
    await expect(page.getByText("信贷已一次还清。")).toBeVisible();
    await expect(page.getByText("已还清")).toBeVisible();

    // 信贷筛选同时覆盖档位、状态和无结果后的恢复入口。
    await chooseSelectOption(page.getByLabel("信贷状态"), {
      label: "已还清",
    });
    await expect(page.getByText("共 1 条，当前显示 1 条")).toBeVisible();
    await chooseSelectOption(page.getByLabel("信贷档位"), {
      label: "一单库存订单金额的50%",
    });
    await expect(page.getByText("没有符合筛选条件的记录")).toBeVisible();
    await page.getByRole("button", { name: "清空筛选" }).click();
    await expect(
      page.getByRole("article").filter({ hasText: "固定200美元" }),
    ).toContainText("已还清");
  });

  test("业务员可维护订单，经理没有入口", async ({ browser }) => {
    const salesmanContext = await browser.newContext();
    const salesmanPage = await salesmanContext.newPage();
    await loginAs(salesmanPage, "salesman");
    await salesmanPage.goto("/salesman/wholesale/inventory-orders");
    await expect(
      salesmanPage.getByRole("button", { name: "创建库存订单" }),
    ).toBeVisible();
    await expect(
      salesmanPage.getByRole("button", { name: "维护备注" }).first(),
    ).toBeVisible();
    await salesmanContext.close();

    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();
    await loginAs(managerPage, "manager");
    await managerPage.goto("/manager/wholesale/inventory-orders");
    await expectForbiddenPage(managerPage);
    await managerContext.close();
  });

  test("客户移动端没有订单或附件写入口且排版不溢出", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await loginAs(page, "client");
    await page.goto("/client/wholesale/inventory-orders");

    await expect(
      page.locator('[data-slot="responsive-data-view"]'),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "创建库存订单" }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "全额实付" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "作废" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "修改" })).toHaveCount(0);
    const mobileOrderFilters = page.getByTestId(
      "customer-inventory-order-filters",
    );
    await expect(
      mobileOrderFilters.getByPlaceholder("订单编号、客户、业务员、币种或备注"),
    ).toBeVisible();
    await mobileOrderFilters
      .getByRole("button", { name: "更多筛选条件" })
      .click();
    await expect(mobileOrderFilters.getByLabel("状态")).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);

    await page.getByRole("button", { name: "查看 Order List" }).first().click();
    const attachmentDialog = page.getByRole("dialog", {
      name: /的 Order List$/,
    });
    await expect(
      attachmentDialog.getByText("选择表格", { exact: true }),
    ).toHaveCount(0);
    await expect(
      attachmentDialog.getByRole("button", { name: "上传所选文件" }),
    ).toHaveCount(0);
    await expect(
      attachmentDialog.getByRole("button", { name: "删除" }),
    ).toHaveCount(0);
    await attachmentDialog
      .getByRole("button", { exact: true, name: "关闭" })
      .click();

    await page.getByRole("button", { name: "信贷管理" }).click();
    await expect(
      page.getByPlaceholder("订单编号、客户、信贷档位或说明"),
    ).toBeVisible();
    await expect(
      page.getByTestId("customer-inventory-credit-filters").getByLabel("客户"),
    ).toHaveCount(0);
    const mobileCreditFilters = page.getByTestId(
      "customer-inventory-credit-filters",
    );
    await mobileCreditFilters
      .getByRole("button", { name: "更多筛选条件" })
      .click();
    await expect(mobileCreditFilters.getByLabel("信贷档位")).toBeVisible();

    await expectNoDocumentHorizontalOverflow(page);
    await expectNoVerticalText(page);
    await expectVisibleButtonsHaveTouchSize(page);
  });
});

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflowPixels).toBeLessThanOrEqual(2);
}

async function expectNoVerticalText(page: Page) {
  const verticalElements = await page.locator("main *:visible").evaluateAll(
    (elements) =>
      elements.filter((element) => {
        const style = window.getComputedStyle(element);
        return style.writingMode !== "horizontal-tb";
      }).length,
  );
  expect(verticalElements).toBe(0);
}

async function expectVisibleButtonsHaveTouchSize(page: Page) {
  const undersizedLabels = await page
    .locator("main button:visible")
    .evaluateAll((buttons) =>
      buttons
        .filter((button) => {
          const box = button.getBoundingClientRect();
          return box.width < 40 || box.height < 40;
        })
        .map(
          (button) =>
            button.textContent?.trim() || button.getAttribute("aria-label"),
        ),
    );
  expect(undersizedLabels).toEqual([]);
}
