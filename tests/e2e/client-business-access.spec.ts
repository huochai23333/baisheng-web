import { expect, test, type Page } from "@playwright/test";

import {
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
} from "./helpers/auth";

test("administrator can add eligible clients from both business customer pages", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await loginAs(page, "administrator");

  await addClientFromBusinessPage({
    candidateEmail: "local.wholesale-client@bs.test",
    dialogName: "添加到旅游业务",
    page,
    path: "/admin/tourism/customers",
    successMessage: "客户已添加到旅游业务。",
  });

  await addClientFromBusinessPage({
    candidateEmail: "local.promoter-client@bs.test",
    dialogName: "添加到批发业务",
    page,
    path: "/admin/wholesale/customers",
    successMessage: "客户已添加到批发业务。",
  });

  await expect(
    page
      .getByText("Local promoter client", { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page);
});

async function addClientFromBusinessPage({
  candidateEmail,
  dialogName,
  page,
  path,
  successMessage,
}: {
  candidateEmail: string;
  dialogName: string;
  page: Page;
  path: string;
  successMessage: string;
}) {
  await page.goto(path);
  await expectWorkspaceShell(page);
  await expectNotForbiddenPage(page);
  await page.getByRole("button", { name: "添加客户", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: dialogName });
  await dialog
    .getByRole("searchbox", { name: "搜索客户" })
    .fill(candidateEmail);
  await expect(
    dialog.getByText(candidateEmail, { exact: false }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "添加客户", exact: true }).click();

  await expect(page.getByText(successMessage)).toBeVisible();
  await expect(dialog).toHaveCount(0);
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
