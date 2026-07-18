import { expect, test } from "@playwright/test";

import { setTestLocale } from "./helpers/auth";

test.describe("forgot password page", () => {
  test.beforeEach(async ({ page }) => {
    // 浏览器会保留上一个用例切换的语言，因此每个中文文案用例都显式固定语言。
    await setTestLocale(page, "zh");
  });

  test("shows pending, success, and cooldown states without sending a real email", async ({
    page,
  }) => {
    let releaseRequest: (() => void) | undefined;
    const requestGate = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });
    let requestedEmail: string | null = null;
    let requestedRedirect: string | null = null;

    // 拦截本地 Auth 请求，既能验证真实浏览器交互，又不会真的发送重置邮件。
    await page.route("**/auth/v1/recover**", async (route) => {
      const payload = readResetRequestPayload(route.request().postData());
      requestedEmail = payload.email;
      requestedRedirect =
        new URL(route.request().url()).searchParams.get("redirect_to") ??
        payload.redirectTo;

      await requestGate;
      await route.fulfill({
        body: "{}",
        contentType: "application/json",
        status: 200,
      });
    });

    await page.goto("/forgot-password");
    await page.getByLabel("电子邮箱").fill("member@example.com");
    await page.getByRole("button", { name: "发送重置邮件" }).click();

    try {
      await expect(page.getByRole("button", { name: "发送中..." })).toBeDisabled();
      expect(requestedEmail).toBe("member@example.com");
      expect(requestedRedirect).toBe("http://localhost:3000/forgot-password");
    } finally {
      // 即使前面的断言失败，也要释放请求，避免浏览器一直等待未完成的网络调用。
      releaseRequest?.();
    }

    const successNotice = page.locator(
      '[data-slot="feedback-notice"][data-tone="success"]',
    );
    await expect(successNotice).toHaveRole("status");
    await expect(successNotice).toHaveAttribute("aria-live", "polite");
    await expect(successNotice).toContainText("重置密码邮件已开始发送");
    await expect(
      page.getByRole("button", { name: /秒后可重新发送/ }),
    ).toBeDisabled();
  });

  test("announces a rate-limit error immediately", async ({ page }) => {
    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          code: "over_request_rate_limit",
          message: "rate limit exceeded",
        }),
        contentType: "application/json",
        status: 429,
      });
    });

    await page.goto("/forgot-password");
    await page.getByLabel("电子邮箱").fill("member@example.com");
    await page.getByRole("button", { name: "发送重置邮件" }).click();

    const errorNotice = page.locator(
      '[data-slot="feedback-notice"][data-tone="error"]',
    );
    await expect(errorNotice).toHaveRole("alert");
    await expect(errorNotice).toHaveAttribute("aria-live", "assertive");
    await expect(errorNotice).toHaveText("请求过于频繁，请稍后再试。");
  });
});

function readResetRequestPayload(postData: string | null) {
  if (!postData) return { email: null, redirectTo: null };

  try {
    const payload = JSON.parse(postData) as {
      email?: unknown;
      redirect_to?: unknown;
    };

    return {
      email: typeof payload.email === "string" ? payload.email : null,
      redirectTo:
        typeof payload.redirect_to === "string" ? payload.redirect_to : null,
    };
  } catch {
    return { email: null, redirectTo: null };
  }
}
