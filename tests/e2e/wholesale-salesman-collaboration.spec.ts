import { expect, test, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
  loginWithAccount,
} from "./helpers/auth";
import { getPeerSalesmanRegressionAccount } from "./helpers/accounts";

const PEER_CUSTOMER_NAME = "业务员协作客户";
const PEER_ORDER_ID = "c2000000-0000-4000-8000-000000000100";
const PEER_ORDER_NUMBER = "WH-PEER-LOCAL-001";

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
    await expect(
      customerSalesSelect.getByRole("option", { name: "本地业务员" }),
    ).toHaveCount(1);
    await expect(
      customerSalesSelect.getByRole("option", { name: "本地协作业务员" }),
    ).toHaveCount(1);
    await page.keyboard.press("Escape");
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
    await expect(
      orderSalesSelect.getByRole("option", { name: "本地业务员" }),
    ).toHaveCount(1);
    await expect(
      orderSalesSelect.getByRole("option", { name: "本地协作业务员" }),
    ).toHaveCount(1);
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
    const firstSalesmanOrder = page.getByTestId(
      "wholesale-order-row-c2000000-0000-4000-8000-000000000001",
    );
    await expect(firstSalesmanOrder).toBeVisible();
    await expect(
      firstSalesmanOrder.getByRole("button", { name: "修改订单" }),
    ).toBeVisible();
    await firstSalesmanOrder
      .getByRole("button", { name: "修改订单" })
      .click();

    const editDialog = page.getByRole("dialog", {
      name: "修改批发订单",
    });
    await expect(editDialog.getByLabel("客户名")).toBeEnabled();
    await expect(editDialog.getByLabel("关联业务员")).toBeEnabled();
    await expect(
      page.getByRole("button", { name: /同意修改|拒绝修改/ }),
    ).toHaveCount(0);
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
