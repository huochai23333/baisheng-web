import { expect, type Locator } from "@playwright/test";

/**
 * 自定义 Select 的选项通过 Portal 放到页面末尾，因此不能再使用原生 selectOption。
 * 这个辅助函数会像用户一样打开菜单并点击选项，同时检查触发器文案和隐藏表单值，
 * 从而同时覆盖可见交互与 FormData 提交语义。
 */
export async function chooseSelectOption(
  select: Locator,
  target: { label?: string; value?: string },
) {
  await select.click();
  const page = select.page();
  const option =
    target.value !== undefined
      ? page.locator(
          `[role="option"][data-value=${JSON.stringify(target.value)}]`,
        ).filter({ visible: true })
      : page.getByRole("option", { exact: true, name: target.label });

  await expect(
    option,
    `找不到下拉选项：${target.label ?? target.value}`,
  ).toBeVisible();
  const optionValue = await option.getAttribute("data-value");
  const optionLabel = (await option.textContent())?.trim() ?? "";
  await option.click();
  await expect(select).toContainText(optionLabel);
  await expectSelectValue(select, optionValue ?? "");
  // 退出动画期间旧 Portal 会短暂保留；等它卸载后再操作下一个 Select，避免同值选项互相干扰。
  await expect(page.getByRole("option")).toHaveCount(0);
}

/**
 * Base UI 会把选中值写进同一控件根节点下的隐藏 input，提交表单时浏览器读取的就是它。
 * 单独封装断言后，业务测试无需了解组件内部 DOM，也不会误把按钮当作原生 select。
 */
export async function expectSelectValue(select: Locator, value: string) {
  await expect(selectHiddenInput(select)).toHaveValue(value);
}

export async function getSelectValue(select: Locator) {
  return selectHiddenInput(select).inputValue();
}

/**
 * 少数写入失败测试需要先读取种子数据生成的动态 value，再执行选择。
 * 菜单只在打开时渲染选项，所以这里负责打开、读取并关闭，不把 Portal 细节泄漏给测试。
 */
export async function getSelectOptionValueAt(select: Locator, index: number) {
  await select.click();
  const option = select.page().getByRole("option").nth(index);
  await expect(option).toBeVisible();
  const value = await option.getAttribute("data-value");
  await select.page().keyboard.press("Escape");
  await expect(select.page().getByRole("option")).toHaveCount(0);
  expect(value).not.toBeNull();
  return value ?? "";
}

export async function getSelectOptionValueByText(
  select: Locator,
  text: string,
) {
  await select.click();
  const option = select.page().getByRole("option").filter({ hasText: text });
  await expect(option).toHaveCount(1);
  const value = await option.getAttribute("data-value");
  await select.page().keyboard.press("Escape");
  await expect(select.page().getByRole("option")).toHaveCount(0);
  expect(value).not.toBeNull();
  return value ?? "";
}

export async function expectSelectOptions(
  select: Locator,
  labels: readonly string[],
) {
  await select.click();
  for (const label of labels) {
    await expect(
      select.page().getByRole("option", { exact: true, name: label }),
    ).toHaveCount(1);
  }
  await select.page().keyboard.press("Escape");
  await expect(select.page().getByRole("option")).toHaveCount(0);
}

function selectHiddenInput(select: Locator) {
  const root = select.locator(
    'xpath=ancestor::*[@data-slot="select-root"][1]',
  );
  return root.locator("input").first();
}
