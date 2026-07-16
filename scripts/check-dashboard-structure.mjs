import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = process.cwd();
const dashboardRoot = path.join(workspaceRoot, "components", "dashboard");

/**
 * 递归读取工作台源码。结构守卫只检查开发者维护的源文件，不扫描构建产物和测试快照，
 * 这样报错会始终指向需要真正修改的组件。
 */
async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(absolutePath);
      return /\.(?:ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
    }),
  );

  return nestedFiles.flat();
}

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
];

const violations = [];
for (const absolutePath of await collectSourceFiles(dashboardRoot)) {
  const source = await readFile(absolutePath, "utf8");
  const fileName = path.basename(absolutePath);

  for (const rule of rules) {
    if (rule.allowedFiles?.has(fileName)) continue;
    if (!rule.pattern.test(source)) continue;

    const relativePath = path.relative(workspaceRoot, absolutePath);
    violations.push(`${relativePath}: ${rule.message}`);
  }
}

if (violations.length > 0) {
  console.error("工作台共享结构检查失败：\n");
  violations.forEach((violation) => console.error(`- ${violation}`));
  process.exitCode = 1;
} else {
  console.log("工作台共享结构检查通过。");
}
