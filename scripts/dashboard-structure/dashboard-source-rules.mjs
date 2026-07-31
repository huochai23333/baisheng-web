import { readFile } from "node:fs/promises";
import path from "node:path";

import { collectSourceFiles } from "./source-facts.mjs";

const rules = [
  {
    message: "工作台确认操作必须使用 DashboardConfirmProvider，不能再调用 window.confirm。",
    pattern: /window\.confirm\s*\(/,
  },
  {
    allowedFiles: new Set(["dashboard-page-shell.tsx"]),
    message: "页面宽度与间距必须由 DashboardPageShell 提供，领域页面不能复制外壳类名。",
    pattern: /mx-auto flex w-full max-w-\[1320px\] flex-col/,
  },
  {
    allowedFiles: new Set(["dashboard-form-dialog.tsx"]),
    message: "弹窗输入样式必须复用 DashboardFormField 或 dashboardFormInputClassName。",
    pattern: /const\s+(?:input|textarea)ClassName\s*=/,
  },
  {
    allowedFiles: new Set(["dashboard-framework-primitives.tsx"]),
    message: "文件入口必须使用 DashboardFilePicker，领域组件不能直接渲染文件输入框。",
    pattern: /type=["']file["']/,
  },
  {
    message: "旧分页外壳已经移除，请使用 DashboardPaginationFooter。",
    pattern: /dashboard-pagination-controls|DashboardPaginationControls/,
  },
  {
    message: "领域组件不能新增状态标签组件，请直接使用全站 StatusBadge 并只映射 tone。",
    pattern:
      /\b(?:InlineChip|DashboardPill|WholesaleStatusBadge)\b|function\s+StatusBadge\s*\(/,
  },
  {
    allowedFiles: new Set(["dashboard-section-panel.tsx"]),
    message: "搜索图标与输入文字的间距必须由 DashboardSearchInput 统一管理，不能在领域页面绝对定位图标。",
    pattern: /<Search\b[^>]*\babsolute\b/,
  },
  {
    allowedFiles: new Set(["dashboard-resource-filter-section.tsx"]),
    message: "业务筛选区必须使用 DashboardResourceFilterSection，确保移动搜索常驻、条件折叠和恢复入口一致。",
    pattern: /<DashboardFilterPanel\b/,
  },
];

export async function collectDashboardSourceRuleViolations({
  dashboardRoot,
  workspaceRoot,
}) {
  const violations = [];
  for (const absolutePath of await collectSourceFiles(dashboardRoot)) {
    const source = await readFile(absolutePath, "utf8");
    const fileName = path.basename(absolutePath);
    for (const rule of rules) {
      if (rule.allowedFiles?.has(fileName) || !rule.pattern.test(source)) continue;
      violations.push(
        `${path.relative(workspaceRoot, absolutePath)}: ${rule.message}`,
      );
    }
  }
  return violations;
}
