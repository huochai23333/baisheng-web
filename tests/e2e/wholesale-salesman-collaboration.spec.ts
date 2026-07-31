import { expect, test, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
  loginWithAccount,
} from "./helpers/auth";
import { getPeerSalesmanRegressionAccount } from "./helpers/accounts";
import { expectSelectOptions } from "./helpers/select-control";

const PEER_CUSTOMER_NAME = "业务员协作客户";
const PEER_ORDER_ID = "c2000000-0000-4000-8000-000000000100";
const PEER_ORDER_NUMBER = "WH-PEER-LOCAL-001";
const PENDING_REQUEST_NOTE = "请管理员确认协作订单的备注修改。";

test.describe("批发业务员全员协作", () => {
  test("业务员可以查看、编辑和转派同事的客户与订单", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await loginAs(page, "salesman");

    await page.goto("/salesman/wholesale/customers");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await page.getByLabel("搜索客户").fill(PEER_CUSTOMER_NAME);
    await openVisibleExactText(page, PEER_CUSTOMER_NAME);

    const customerDetails = page.getByRole("dialog", {
      name: PEER_CUSTOMER_NAME,
    });
    await expect(
      customerDetails.getByText("本地协作业务员", { exact: true }),
    ).toBeVisible();
    await expect(
      customerDetails.getByRole("button", { name: "编辑客户" }),
    ).toBeVisible();
    await expect(
      customerDetails.getByRole("button", { name: "删除客户" }),
    ).toBeVisible();
    await expect(
      customerDetails.getByRole("button", { name: "合并账号" }),
    ).toBeVisible();

    await customerDetails.getByRole("button", { name: "编辑客户" }).click();
    const customerEditDialog = page.getByRole("dialog", {
      name: "编辑批发客户",
    });
    const customerSalesSelect = customerEditDialog.getByLabel("关联业务员");
    await expect(customerSalesSelect).toBeEnabled();
    await expectSelectOptions(customerSalesSelect, [
      "本地业务员",
      "本地协作业务员",
    ]);
    await page.keyboard.press("Escape");

    await page.goto("/salesman/wholesale/orders");
    await page.getByLabel("搜索订单").fill(PEER_ORDER_NUMBER);
    const peerOrderRow = page.getByTestId(`wholesale-order-row-${PEER_ORDER_ID}`);
    await expect(peerOrderRow).toBeVisible();
    await expect(peerOrderRow).toContainText("本地协作业务员");
    await expect(
      peerOrderRow.getByRole("button", { name: "修改订单" }),
    ).toBeVisible();
    await expect(
      peerOrderRow.getByRole("button", { name: "管理附件" }),
    ).toBeVisible();

    await peerOrderRow.getByRole("button", { name: "修改订单" }).click();
    const orderEditDialog = page.getByRole("dialog", {
      name: "修改批发订单",
    });
    await expect(orderEditDialog.getByLabel("客户名")).toBeEnabled();
    const orderSalesSelect = orderEditDialog.getByLabel("关联业务员");
    await expect(orderSalesSelect).toBeEnabled();
    await expectSelectOptions(orderSalesSelect, [
      "本地业务员",
      "本地协作业务员",
    ]);
    await expectNoDocumentHorizontalOverflow(page);
  });

  test("第二名业务员能反向协作，但不会出现管理员审批操作", async ({ page }) => {
    const peerAccount = getPeerSalesmanRegressionAccount();
    test.skip(!peerAccount, "本地数据库没有第二个业务员测试账号。");

    await loginWithAccount(page, peerAccount!);
    await page.goto("/salesman/wholesale/customers");
    await page.getByLabel("搜索客户").fill("Wholesale Alpha");
    await expect(
      page.getByText("Wholesale Alpha", { exact: true }).filter({ visible: true }),
    ).toHaveCount(1);

    await page.goto("/salesman/wholesale/orders");
    await page.getByLabel("搜索订单").fill("WH-LOCAL-202607-001");
    // 该夹具用于验证跨业务员协作，日期可能早于默认 30 天范围；
    // 通过产品已有的全历史精确查询找单，不放宽真实页面的默认日期规则。
    await page.getByRole("button", { name: "跨日期查此单号" }).click();
    const firstSalesmanOrder = page.getByTestId(
      "wholesale-order-row-c2000000-0000-4000-8000-000000000001",
    );
    await expect(firstSalesmanOrder).toBeVisible();
    // 夹具订单已超过普通直接修改窗口，业务员应看到申请入口而不是管理员直改入口。
    // 这仍能证明第二名业务员可以反向协作处理第一名业务员的订单。
    await expect(
      firstSalesmanOrder.getByRole("button", { name: "申请修改" }),
    ).toBeVisible();
    await page.getByLabel("搜索订单").fill(PEER_ORDER_NUMBER);
    const requestRow = page.getByRole("row").filter({
      hasText: PENDING_REQUEST_NOTE,
    });
    await expect(requestRow).toBeVisible();
    await expect(
      requestRow.getByRole("button", { name: /通过|退回/ }),
    ).toHaveCount(0);
  });

  test("管理员能看到协作订单的固定待审批申请和审批操作", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");
    await page.getByLabel("搜索订单").fill(PEER_ORDER_NUMBER);

    const requestRow = page.getByRole("row").filter({
      hasText: PENDING_REQUEST_NOTE,
    });
    await expect(requestRow).toBeVisible();
    await expect(requestRow).toContainText(PEER_ORDER_NUMBER);
    await expect(
      requestRow.getByRole("button", { name: "通过" }),
    ).toBeVisible();
    await expect(
      requestRow.getByRole("button", { name: "退回" }),
    ).toBeVisible();
  });

  test("手机宽度下协作订单卡片和编辑弹窗不挤压", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await loginAs(page, "salesman");
    await page.goto("/salesman/wholesale/orders");
    await page.getByLabel("搜索订单").fill(PEER_ORDER_NUMBER);

    const peerOrderCard = page.getByTestId(
      `wholesale-order-card-${PEER_ORDER_ID}`,
    );
    await expect(peerOrderCard).toBeVisible();
    await expect(peerOrderCard).toContainText("本地协作业务员");
    await peerOrderCard.click();

    const detailsDialog = page.getByRole("dialog", {
      name: `订单 ${PEER_ORDER_NUMBER}`,
    });
    await expect(
      detailsDialog.getByRole("button", { name: "修改订单" }),
    ).toBeVisible();
    await expect(
      detailsDialog.getByRole("button", { name: "管理附件" }),
    ).toBeVisible();
    await detailsDialog.getByRole("button", { name: "修改订单" }).click();
    await expect(
      page.getByRole("dialog", { name: "修改批发订单" }),
    ).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });
});

async function openVisibleExactText(page: Page, text: string) {
  await page
    .getByText(text, { exact: true })
    .filter({ visible: true })
    .first()
    .click();
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  // 页面级宽度断言可以同时发现竖排、弹窗外溢和手机卡片撑开视口等问题。
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
