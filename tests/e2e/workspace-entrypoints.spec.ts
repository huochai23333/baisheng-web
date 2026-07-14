import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  expectForbiddenPage,
  expectNotForbiddenPage,
  expectWorkspaceShell,
  loginAs,
  type RegressionRole,
} from "./helpers/auth";
import {
  restoreDefaultAdminBusinessGroups,
  setDesktopBusinessGroupExpanded,
} from "./helpers/workspace-navigation";

type WorkspaceEntry = {
  paths: readonly string[];
  role: RegressionRole;
};

const workspaceEntries: readonly WorkspaceEntry[] = [
  {
    paths: [
      "/admin/accounts",
      "/admin/announcements",
      "/admin/feedback",
      "/admin/reviews",
      "/admin/settings",
      "/admin/tourism/orders",
      "/admin/tourism/customers",
      "/admin/tourism/people",
      "/admin/tourism/records",
      "/admin/wholesale/orders",
      "/admin/wholesale/settlement-releases",
      "/admin/wholesale/customers",
      "/admin/wholesale/people",
    ],
    role: "administrator",
  },
  {
    paths: [
      "/salesman/wholesale/orders",
      "/salesman/wholesale/settlement-releases",
      "/salesman/wholesale/order-claims",
      "/salesman/wholesale/logistics",
      "/salesman/wholesale/customers",
      "/salesman/wholesale/incentives",
    ],
    role: "salesman",
  },
  {
    paths: [
      "/promoter/tourism/orders",
      "/promoter/tourism/tasks",
      "/promoter/tourism/commission",
      "/promoter/tourism/customers",
    ],
    role: "promoter",
  },
  {
    paths: ["/client/tourism/orders", "/client/tourism/referrals"],
    role: "client",
  },
  {
    paths: [
      "/finance/company-expenses",
      "/finance/wholesale/orders",
      "/finance/wholesale/settlement-releases",
      "/finance/wholesale/customers",
      "/finance/wholesale/commission",
    ],
    role: "finance",
  },
];

test.describe("workspace entrypoint regression", () => {
  for (const entry of workspaceEntries) {
    test(`${entry.role} can open key workspace sections`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(entry.role === "administrator" ? 120_000 : 60_000);
      await loginAs(page, entry.role);

      for (const workspacePath of entry.paths) {
        await page.goto(workspacePath);
        await expectWorkspaceShell(page);
        await expectNotForbiddenPage(page);
      }
    });
  }

  test("desktop business group can collapse while the current section is active", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    const sidebar = page.locator("aside").first();
    const wholesaleGroupButton = sidebar.getByRole("button", {
      name: "批发业务",
    });
    const wholesaleOrdersLink = sidebar.getByRole("link", {
      name: "批发订单",
    });

    await expect(wholesaleGroupButton).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(wholesaleOrdersLink).toBeVisible();

    await setDesktopBusinessGroupExpanded(page, "批发业务", false);

    await expect(wholesaleGroupButton).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(wholesaleOrdersLink).toBeHidden();

    await setDesktopBusinessGroupExpanded(page, "批发业务", true);

    await expect(wholesaleGroupButton).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(wholesaleOrdersLink).toBeVisible();

    await page.goto("/admin/home");
    await restoreDefaultAdminBusinessGroups(page);
  });

  for (const entry of [
    {
      copyButtonTestId: "home-invite-copy-link-wholesale",
      role: "salesman" as const,
    },
    {
      copyButtonTestId: "home-invite-copy-link-tourism",
      role: "promoter" as const,
    },
  ]) {
    test(`${entry.role} registration link uses the single invite code`, async ({
      page,
    }) => {
      await mockClipboard(page);
      await loginAs(page, entry.role);

      const inviteCode = (
        await page.getByTestId("home-invite-code").innerText()
      )
        .trim()
        .toUpperCase();

      await page.getByTestId(entry.copyButtonTestId).click();

      const copiedLink = await page.evaluate(() =>
        window.localStorage.getItem("__lastCopiedInviteLink") ?? "",
      );
      const copiedUrl = new URL(copiedLink);

      expect(copiedUrl.pathname).toBe("/register");
      expect(copiedUrl.searchParams.get("ref")).toBe(inviteCode);
      expect(copiedUrl.searchParams.has("board")).toBe(false);
      expect(copiedUrl.searchParams.get("ref")).not.toMatch(/-[TD]$/);
    });
  }

  test("wholesale order list can filter by ordered date range", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/orders");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    const orderedFromInput = page.getByLabel("下单日期从");
    const orderedToInput = page.getByLabel("下单日期到");
    const clearFiltersButton = page.getByRole("button", { name: "清空筛选" });
    const assessmentButton = page.getByRole("button", {
      name: "生成当前范围评估",
    });

    await expect(orderedFromInput).toBeVisible();
    await expect(orderedToInput).toBeVisible();
    await expect(page.getByText("AI订单评估")).toBeVisible();
    await expect(assessmentButton).toBeVisible();

    const currentMonthRange = getCurrentMonthDateRange();

    await expect(orderedFromInput).toHaveValue(currentMonthRange.from);
    await expect(orderedToInput).toHaveValue(currentMonthRange.to);
    await expect(clearFiltersButton).toBeEnabled();

    await fillDateInput(orderedFromInput, "2099-01-01");
    await fillDateInput(orderedToInput, "2099-01-31");

    await expect(orderedFromInput).toHaveValue("2099-01-01");
    await expect(orderedToInput).toHaveValue("2099-01-31");
    await expect(clearFiltersButton).toBeEnabled();
    await expect(assessmentButton).toBeDisabled();
    await expect(
      page.getByText("当前筛选条件下没有订单，调整日期或筛选条件后再生成评估。"),
    ).toBeVisible();

    await clearFiltersButton.click();

    await expect(orderedFromInput).toHaveValue("");
    await expect(orderedToInput).toHaveValue("");

    await page.route("**/api/wholesale/order-assessment", async (route) => {
      await route.fulfill({
        body: "**订单概况**\n* 当前范围共 2 笔订单。\n* 状态分布正常。",
        contentType: "text/plain; charset=utf-8",
      });
    });

    await expect(assessmentButton).toBeEnabled();
    await assessmentButton.click();

    const assessmentOutput = page.getByTestId(
      "wholesale-order-assessment-output",
    );

    await expect(assessmentOutput).toContainText("订单概况");
    await expect(assessmentOutput).toContainText("当前范围共 2 笔订单。");
    await expect(assessmentOutput).not.toContainText("**");
    await expect(assessmentOutput).not.toContainText("*");
  });

  test("admin can see wholesale order edit rule and open edit dialog", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/settings");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await expect(page.getByRole("heading", { name: "订单修改规则" })).toBeVisible();
    await expect(page.getByLabel("可直接修改天数")).toBeVisible();
    await expect(page.getByRole("button", { name: "保存规则" })).toBeVisible();
    await expect(visibleExactText(page, "批发订单业务员佣金")).toHaveCount(1);
    await expect(visibleExactText(page, "批发推荐月订单金额佣金")).toHaveCount(1);
    await expect(page.getByText("采购订单业务员佣金", { exact: true })).toHaveCount(0);

    await page.goto("/admin/tourism/settings");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(visibleExactText(page, "陪同类服务业务员佣金")).toHaveCount(1);
    await expect(page.getByText("采购订单业务员佣金", { exact: true })).toHaveCount(0);
    await expect(page.getByText("采购订单推荐佣金", { exact: true })).toHaveCount(0);
    await expect(page.getByText("批发订单业务员佣金", { exact: true })).toHaveCount(0);

    await page.goto("/admin/wholesale/orders");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    const editButton = page.getByRole("button", { name: "修改订单" }).first();
    await expect(editButton).toBeVisible();
    await editButton.click();

    await expect(page.getByRole("heading", { name: "修改批发订单" })).toBeVisible();
    await expect(page.getByLabel("客户支付金额")).toBeVisible();
    await expect(page.getByRole("button", { name: "保存修改" })).toBeVisible();

    await page.keyboard.press("Escape");
    await page.setViewportSize({ height: 844, width: 390 });

    await page.goto("/admin/tourism/settings");
    await expect(visibleExactText(page, "陪同类服务业务员佣金")).toHaveCount(1);
    await expect(page.getByText("采购订单业务员佣金", { exact: true })).toHaveCount(0);
    await expect(page.getByText("批发订单业务员佣金", { exact: true })).toHaveCount(0);
    await expectNoDocumentHorizontalOverflow(page);

    await page.goto("/admin/wholesale/settings");
    await expect(page.getByRole("heading", { name: "订单修改规则" })).toBeVisible();
    await expect(page.getByLabel("可直接修改天数")).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);

    await page.goto("/admin/wholesale/orders");
    await expect(page.getByRole("heading", { name: "批发订单" })).toBeVisible();
    await page.locator('[data-testid^="wholesale-order-card-"]').first().click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: /修改订单|申请修改/ }),
    ).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });

  test("admin business customer pages are separate from people pages", async ({
    page,
  }) => {
    await loginAs(page, "administrator");

    await page.goto("/admin/tourism/customers");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("heading", { name: "旅游客户管理" })).toBeVisible();
    await expect(page.getByText("地推账户")).toHaveCount(0);

    await page.goto("/admin/tourism/people");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("heading", { name: "旅游人员管理" })).toBeVisible();
    await expect(page.getByText("旅游客户")).toHaveCount(0);
    await expect(page.getByText("地推账户").first()).toBeVisible();

    await page.goto("/admin/wholesale/customers");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("heading", { name: "客户管理" })).toBeVisible();
    await expect(page.getByRole("button", { name: "新增客户" })).toBeVisible();

    await page.goto("/admin/wholesale/people");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);
    await expect(page.getByRole("heading", { name: "人员管理" })).toBeVisible();
    await expect(page.getByText("业务员账户").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "新增客户" })).toHaveCount(0);
  });

  test("wholesale claim page separates assisted, hall, and claimed orders", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/wholesale/order-claims");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await expect(page.getByRole("button", { name: /待分类/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /认领大厅/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /已认领/ })).toBeVisible();
    await expect(page.getByText("1688-LOCAL-003")).toBeVisible();
    await expect(page.getByText("Wholesale Beta").first()).toBeVisible();

    await page.getByRole("button", { name: /认领大厅/ }).click();
    await expect(page.getByText("1688-LOCAL-004")).toBeVisible();
    await expect(page.getByText("Unknown Buyer")).toBeVisible();

    await page.getByRole("button", { name: /已认领/ }).click();
    await expect(page.getByText("1688-LOCAL-001")).toBeVisible();
    await expect(page.getByText("1688-LOCAL-002")).toBeVisible();

    await page.getByRole("button", { name: /待分类/ }).click();
    await page.getByRole("button", { name: "确认归属" }).first().click();
    await expect(
      page.getByText("请确认要关联的批发订单。"),
    ).toBeVisible();
    await expect(page.getByLabel("客户")).toHaveValue(
      "c1000000-0000-4000-8000-000000000002",
    );
    await expect(page.getByLabel("关联批发订单")).toBeEnabled();
  });

  test("salesman wholesale customer page shares customers but hides people management", async ({
    page,
  }) => {
    await loginAs(page, "salesman");
    await page.goto("/salesman/wholesale/customers");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    await expect(page.getByRole("heading", { name: "客户管理" })).toBeVisible();
    await expect(page.getByText("Wholesale Alpha").first()).toBeVisible();
    await expect(page.getByText("Wholesale Beta").first()).toBeVisible();
    // 批发客户是全员协作数据，即使历史客户最初由其他岗位建立，业务员也应能继续跟进。
    await expect(page.getByText("Promoter Wholesale Shop").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "人员管理" })).toHaveCount(0);

    await page.goto("/salesman/wholesale/people");
    await expectForbiddenPage(page);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/salesman/wholesale/customers");
    await expect(page.getByRole("heading", { name: "客户管理" })).toBeVisible();
    await expect(page.getByRole("link", { name: "人员管理" })).toHaveCount(0);
    await expectNoDocumentHorizontalOverflow(page);
  });

  test("tourism order list can filter by ordered date range", async ({
    page,
  }) => {
    await loginAs(page, "administrator");
    await page.goto("/admin/tourism/orders");
    await expectWorkspaceShell(page);
    await expectNotForbiddenPage(page);

    const createdFromInput = page.getByLabel("下单日期从");
    const createdToInput = page.getByLabel("下单日期到");
    const clearFiltersButton = page.getByRole("button", { name: "清空筛选" });

    await expect(createdFromInput).toBeVisible();
    await expect(createdToInput).toBeVisible();
    await page.waitForTimeout(1000);

    await fillDateInput(createdFromInput, "2099-01-01");
    await fillDateInput(createdToInput, "2099-01-31");

    await expect(createdFromInput).toHaveValue("2099-01-01");
    await expect(createdToInput).toHaveValue("2099-01-31");
    await expect(page.getByText("没有匹配结果")).toBeVisible();
    await expect(clearFiltersButton).toBeEnabled();

    await clearFiltersButton.click();

    await expect(createdFromInput).toHaveValue("");
    await expect(createdToInput).toHaveValue("");
  });
});

function visibleExactText(page: Page, text: string) {
  return page.getByText(text, { exact: true }).filter({ visible: true });
}

async function mockClipboard(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          window.localStorage.setItem("__lastCopiedInviteLink", value);
        },
      },
    });
  });
}

async function fillDateInput(locator: Locator, value: string) {
  await locator.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

function getCurrentMonthDateRange() {
  const today = new Date(Date.now() + 8 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthText = String(month).padStart(2, "0");

  return {
    from: `${year}-${monthText}-01`,
    to: `${year}-${monthText}-${String(lastDay).padStart(2, "0")}`,
  };
}

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
