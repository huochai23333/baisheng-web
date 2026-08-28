import { expect, test, type Page } from "@playwright/test";

import { setTestLocale } from "./helpers/auth";

test.describe("registration wizard", () => {
  test.beforeEach(async ({ page }) => {
    await setTestLocale(page, "zh");
  });

  test("optional invite and phone can be skipped while step data stays intact", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "下一步" }).click();

    await page.getByRole("textbox", { name: "用户名称" }).fill("注册向导测试");
    await page
      .getByRole("textbox", { name: "电子邮箱" })
      .fill(`wizard-${Date.now()}@example.com`);

    const countryButton = page.getByRole("combobox", {
      name: "国家或地区区号",
    });
    await countryButton.click();
    await page.getByRole("combobox", { name: "搜索国家或地区" }).fill("美国");
    await page.getByRole("option", { name: "美国 +1" }).click();
    await expect(countryButton).toContainText("+1");

    await page.getByRole("button", { name: "下一步" }).click();
    await expect(page.getByRole("button", { name: "立即注册" })).toBeVisible();
    await page.getByRole("button", { name: "上一步" }).click();

    await expect(page.getByRole("textbox", { name: "用户名称" })).toHaveValue(
      "注册向导测试",
    );
    await expect(countryButton).toContainText("+1");
    await expect(page.getByRole("textbox", { name: "手机号码" })).toHaveValue(
      "",
    );
  });

  test("invalid invite stays on the invite step with everyday-language feedback", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByRole("textbox", { name: "邀请码" }).fill("NOTREAL");
    await page.getByRole("button", { name: "下一步" }).click();

    await expect(
      page.getByText("邀请码不存在，请确认后重新输入。"),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "邀请码" }),
    ).toHaveValue("NOTREAL");
  });

  test("wholesale invite continues while tourism invite reports the paused service", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByRole("textbox", { name: "邀请码" }).fill("SALETEST1");
    await page.getByRole("button", { name: "下一步" }).click();
    await expect(page.getByText("填写账号资料")).toBeVisible();
    await expect(page.getByText("选择业务")).toHaveCount(0);

    await page.goto("/register");
    await page.getByRole("textbox", { name: "邀请码" }).fill("PROMO001");
    await page.getByRole("button", { name: "下一步" }).click();
    await expect(
      page.getByText(
        "这个邀请码对应的服务暂时停止注册，请联系管理员了解后续安排。",
      ),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "邀请码" })).toHaveValue(
      "PROMO001",
    );
  });

  test("mobile width and reduced motion keep every step usable without overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/register");
    await page.getByRole("button", { name: "下一步" }).click();

    await expect(
      page.getByRole("combobox", { name: "国家或地区区号" }),
    ).toBeVisible();
    await expectNoDocumentHorizontalOverflow(page);
  });

  test("saved English choice overrides the browser language", async ({
    page,
  }) => {
    await setTestLocale(page, "en");
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: "Create Your Account" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });
});

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflowPixels = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflowPixels).toBeLessThanOrEqual(2);
}
