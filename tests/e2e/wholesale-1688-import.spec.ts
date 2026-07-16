import fs from "node:fs/promises";

import { expect, test, type Page } from "@playwright/test";
import { strToU8, zipSync } from "fflate";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test.describe("wholesale 1688 import", () => {
  test("salesman can open claim creation and group adjustment", async ({
    page,
  }) => {
    await loginAs(page, "salesman");
    await page.goto("/salesman/wholesale/order-claims");

    await expect(page.getByRole("button", { name: "上传 1688 文件" })).toBeVisible();
    await page.getByRole("button", { name: /认领大厅/ }).click();
    const hallRow = page.getByRole("row").filter({ hasText: "1688-LOCAL-004" });
    await hallRow.getByRole("button", { name: "认领" }).click();
    await expect(page.getByRole("dialog", { name: "认领采购订单" })).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: /已认领/ }).click();
    await page.getByRole("button", { name: "调整关联" }).first().click();
    await expect(page.getByRole("dialog", { name: "调整关联" })).toBeVisible();
  });

  test("hall claim button stays beside the order number", async ({ page }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/order-claims");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await page.getByRole("button", { name: /认领大厅/ }).click();

    const hallClaimRow = page.getByRole("row").filter({
      hasText: "1688-LOCAL-004",
    });
    // 待认领表格的第一列是批量勾选框，订单号和单条认领按钮位于紧随其后的固定列。
    const hallClaimOrderCell = hallClaimRow.getByRole("cell").nth(1);

    await expect(hallClaimOrderCell.getByText("认领大厅")).toHaveCount(0);
    await expect(
      hallClaimOrderCell.getByRole("button", { name: "认领" }),
    ).toBeVisible();
    await expect(
      hallClaimRow.getByRole("cell").last().getByRole("button", {
        name: "认领",
      }),
    ).toHaveCount(0);
  });

  test("认领弹窗先选客户，再显示带金额的订单", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/order-claims");
    await page.getByRole("button", { name: /认领大厅/ }).click();

    const hallClaimRow = page.getByRole("row").filter({
      hasText: "1688-LOCAL-004",
    });
    await hallClaimRow.getByRole("button", { name: "认领" }).click();

    const dialog = page.getByRole("dialog", { name: "认领采购订单" });
    const customerSelect = dialog.getByLabel("客户");
    const orderSearch = dialog.getByLabel("搜索批发订单");
    await expect(orderSearch).toBeDisabled();

    await customerSelect.selectOption({ label: "Wholesale Alpha" });
    await expect(orderSearch).toBeEnabled();
    const firstOrderCheckbox = dialog.getByRole("checkbox").first();
    await expect(firstOrderCheckbox.locator("xpath=..")).toContainText(" · ");

    await firstOrderCheckbox.check();
    await expect(dialog.getByText("已选择 1 笔")).toBeVisible();
    await customerSelect.selectOption({ label: "Wholesale Beta" });
    await expect(dialog.getByText("已选择 0 笔")).toBeVisible();

    await expectNoDocumentHorizontalOverflow(page);
    await page.setViewportSize({ height: 844, width: 390 });
    await expectNoDocumentHorizontalOverflow(page);
    await expectNoCompressedText(page);
  });

  test("按收货人和采购日期筛选后批量认领", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ height: 900, width: 1440 });

    const suffix = Date.now();
    const recipientName = `批量收货人${suffix}`;
    const orderNumbers = [
      `1688-BULK-E2E-${suffix}-1`,
      `1688-BULK-E2E-${suffix}-2`,
      `1688-BULK-E2E-${suffix}-NO-DATE`,
    ];
    const csvRows = [
      "订单编号,订单创建时间,收货人姓名,货品标题",
      `${orderNumbers[0]},${new Date(Date.now() - 2 * 86_400_000).toISOString()},${recipientName},批量测试商品一`,
      `${orderNumbers[1]},${new Date(Date.now() - 86_400_000).toISOString()},${recipientName},批量测试商品二`,
      `${orderNumbers[2]},,${recipientName},没有采购时间的测试商品`,
    ].join("\n");

    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/order-claims");
    await page.getByRole("button", { name: "上传 1688 文件" }).click();
    const uploadDialog = page.getByRole("dialog", { name: "上传 1688 订单" });
    await uploadDialog.locator('input[type="file"]').setInputFiles({
      buffer: Buffer.from(csvRows),
      mimeType: "text/csv",
      name: `批量认领-${suffix}.csv`,
    });
    await expect(uploadDialog.getByText(/已读取 3 条采购订单/)).toBeVisible();
    await uploadDialog.getByRole("button", { name: "接收采购订单" }).click();
    await expect(page.getByText("1688 采购订单已接收。")).toBeVisible();

    await page.getByRole("button", { name: /认领大厅/ }).click();
    await page.getByLabel("收货人名字").fill(`收货人${suffix}`);
    await expect(page.getByText(orderNumbers[0]).first()).toBeVisible();
    await expect(page.getByText(orderNumbers[1]).first()).toBeVisible();
    await expect(page.getByText(orderNumbers[2])).toBeVisible();

    await page.getByLabel("采购开始日期").fill(shanghaiDateDaysAgo(3));
    await page.getByLabel("采购结束日期").fill(shanghaiDateDaysAgo(0));
    await expect(page.getByText(orderNumbers[0]).first()).toBeVisible();
    await expect(page.getByText(orderNumbers[1]).first()).toBeVisible();
    await expect(page.getByText(orderNumbers[2]).first()).toBeVisible();

    await page
      .getByRole("checkbox", {
        name: "选择当前筛选结果中的全部采购订单",
      })
      .check();
    await expect(page.getByText("已选择 3 条采购订单")).toBeVisible();

    await page.setViewportSize({ height: 844, width: 390 });
    await expectNoDocumentHorizontalOverflow(page);
    await expectNoCompressedText(page);
    await page.getByRole("button", { name: "批量认领" }).click();

    const bulkDialog = page.getByRole("dialog", { name: "认领采购订单" });
    await bulkDialog.getByLabel("客户").selectOption({
      label: "Wholesale Alpha",
    });
    await bulkDialog.getByRole("checkbox").first().check();
    await expectNoDocumentHorizontalOverflow(page);
    await expectNoCompressedText(page);
    await bulkDialog.getByRole("button", { name: "确认认领" }).click();
    await expect(page.getByText("已认领 3 条采购订单。")).toBeVisible();

    await page.setViewportSize({ height: 900, width: 1440 });
    await page.getByRole("button", { name: /已认领/ }).click();
    await expect(page.getByText(orderNumbers[0]).first()).toBeVisible();
    await expect(page.getByText(orderNumbers[1]).first()).toBeVisible();
    await expect(
      page.getByRole("checkbox", {
        name: "选择当前筛选结果中的全部采购订单",
      }),
    ).toHaveCount(0);

    // 调整时增加第二笔批发订单，并把误选的第二笔 1688 订单移出认领组。
    let claimedGroupRow = page.getByRole("row").filter({
      hasText: orderNumbers[0],
    });
    await claimedGroupRow.getByRole("button", { name: "调整关联" }).click();
    let editDialog = page.getByRole("dialog", { name: "调整关联" });
    await expect(editDialog.getByRole("checkbox").first()).toBeVisible();
    expect(await editDialog.getByRole("checkbox").count()).toBeGreaterThan(1);
    await editDialog.getByRole("checkbox").nth(1).check();
    await editDialog
      .getByRole("button", { name: `从本组移出 ${orderNumbers[1]}` })
      .click();
    await editDialog.getByRole("button", { name: "保存调整" }).click();
    await expect(page.getByText("认领关系已更新。")).toBeVisible();
    await expect(page.getByText(orderNumbers[1])).toHaveCount(0);

    // 刷新后确认调整结果持久存在，再撤销整组，让采购订单回到待认领列表。
    await page.reload();
    await page.getByRole("button", { name: /已认领/ }).click();
    claimedGroupRow = page.getByRole("row").filter({
      hasText: orderNumbers[0],
    });
    await expect(claimedGroupRow).toBeVisible();
    await expect(page.getByText(orderNumbers[1])).toHaveCount(0);
    await claimedGroupRow.getByRole("button", { name: "调整关联" }).click();
    editDialog = page.getByRole("dialog", { name: "调整关联" });
    await editDialog.getByRole("button", { name: "撤销整组关联" }).click();
    await editDialog.getByRole("button", { name: "确认撤销" }).click();
    await expect(page.getByText("认领已撤销。")).toBeVisible();

    await page.getByRole("button", { name: /认领大厅/ }).click();
    await page.getByLabel("收货人名字").fill(`收货人${suffix}`);
    for (const orderNumber of orderNumbers.slice(0, 2)) {
      const row = page.getByRole("row").filter({ hasText: orderNumber });
      await row.getByRole("button", { name: "移出" }).click();
      await expect(row).toHaveCount(0);
    }
    const noDateRow = page.getByRole("row").filter({
      hasText: orderNumbers[2],
    });
    await expect(noDateRow).toBeVisible();
    await noDateRow.getByRole("button", { name: "移出" }).click();
    await expect(noDateRow).toHaveCount(0);
  });

  test("administrator can import a 1688 Excel order file", async ({
    page,
  }, testInfo) => {
    const orderNumber = `1688-XLSX-${Date.now()}`;
    const filePath = testInfo.outputPath("1688-orders.xlsx");

    await create1688XlsxFixture(filePath, orderNumber);
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/order-claims");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await page.getByRole("button", { name: "上传 1688 文件" }).click();

    const dialog = page.getByRole("dialog", { name: "上传 1688 订单" });
    await expect(dialog).toBeVisible();
    await dialog.locator('input[type="file"]').setInputFiles(filePath);
    await expect(dialog.getByText(/已读取 1 条采购订单/)).toBeVisible();

    await dialog.getByRole("button", { name: "接收采购订单" }).click();

    await expect(page.getByText("1688 采购订单已接收。")).toBeVisible();
    await page.getByLabel("搜索采购订单").fill(orderNumber);
    await expect(page.getByText(orderNumber)).toBeVisible();
    await expect(page.getByText("自动测试商品")).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);

    const importedRow = page.getByRole("row").filter({ hasText: orderNumber });
    await importedRow.getByRole("button", { name: "移出" }).click();
    await expect(page.getByText("采购订单已移出当前认领列表。")).toBeVisible();

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/admin/wholesale/order-claims");
    await expect(page.getByRole("heading", { name: "订单认领", exact: true }))
      .toBeVisible();
    await page.getByRole("button", { name: "上传 1688 文件" }).click();

    const mobileDialog = page.getByRole("dialog", { name: "上传 1688 订单" });
    await mobileDialog.locator('input[type="file"]').setInputFiles(filePath);
    await expect(mobileDialog.getByText(/已读取 1 条采购订单/)).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });
});

async function create1688XlsxFixture(filePath: string, orderNumber: string) {
  const sheetXml = buildSheetXml([
    { column: "A", header: "订单编号", value: orderNumber },
    { column: "D", header: "卖家公司名", value: "自动测试供应商" },
    { column: "I", header: "实付款(元)", type: "n", value: "158.6" },
    { column: "J", header: "订单状态", value: "等待买家确认收货" },
    { column: "K", header: "订单创建时间", type: "n", value: "46203.57986111111" },
    { column: "N", header: "收货人姓名", value: "Wholesale Beta" },
    { column: "S", header: "货品标题", value: "自动测试商品" },
    { column: "U", header: "数量", type: "n", value: "2" },
  ]);

  const files = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    "xl/workbook.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="订单" sheetId="1" r:id="rId1"/></sheets>
</workbook>`),
    "xl/_rels/workbook.xml.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`),
    "xl/worksheets/sheet1.xml": strToU8(sheetXml),
  };

  await fs.writeFile(filePath, Buffer.from(zipSync(files)));
}

type XlsxColumn = {
  column: string;
  header: string;
  type?: "n" | "inlineStr";
  value: string;
};

function buildSheetXml(columns: XlsxColumn[]) {
  const headerCells = columns
    .map(({ column, header }) => buildCell(`${column}1`, header))
    .join("");
  const bodyCells = columns
    .map(({ column, type, value }) => buildCell(`${column}2`, value, type))
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">${headerCells}</row>
    <row r="2">${bodyCells}</row>
  </sheetData>
</worksheet>`;
}

function buildCell(reference: string, value: string, type: "n" | "inlineStr" = "inlineStr") {
  if (type === "n") {
    return `<c r="${reference}" t="n"><v>${escapeXml(value)}</v></c>`;
  }

  return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}

async function expectNoCompressedText(page: Page) {
  const compressedText = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("button, label, option"))
      .filter((element) => {
        const text = element.innerText.trim();
        const rect = element.getBoundingClientRect();
        return (
          text &&
          rect.width > 0 &&
          rect.width < 24 &&
          rect.height > 48 &&
          rect.height > rect.width * 2.5
        );
      })
      .map((element) => element.innerText.trim())
      .slice(0, 5),
  );

  expect(compressedText).toEqual([]);
}

function shanghaiDateDaysAgo(daysAgo: number) {
  const date = new Date(Date.now() - daysAgo * 86_400_000);
  const values = new Map(
    new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "Asia/Shanghai",
      year: "numeric",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}
