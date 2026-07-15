import { expect, type Locator } from "@playwright/test";

/**
 * Chromium 对 React 受控下拉框执行脚本式 selectOption 时，可能先恢复旧值再派发 change。
 * 浏览器回归改用与真人一致的键盘选择，既能触发真实输入事件，也能验证控件确实可操作。
 */
export async function chooseSelectOption(
  select: Locator,
  target: { label?: string; value?: string },
) {
  const options = await select.locator("option").evaluateAll((elements) =>
    elements.map((element) => {
      const option = element as HTMLOptionElement;
      return { label: option.textContent?.trim() ?? "", value: option.value };
    }),
  );
  const targetIndex = options.findIndex((option) =>
    target.value !== undefined
      ? option.value === target.value
      : option.label === target.label,
  );

  expect(targetIndex, `找不到下拉选项：${target.label ?? target.value}`).toBeGreaterThanOrEqual(0);
  await select.focus();
  await select.press("Home");
  for (let index = 0; index < targetIndex; index += 1) {
    await select.press("ArrowDown");
  }
  await expect(select).toHaveValue(options[targetIndex].value);
}
