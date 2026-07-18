import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = process.cwd();
const dashboardRoot = path.join(workspaceRoot, "components", "dashboard");
const appRoot = path.join(workspaceRoot, "app");
const componentsRoot = path.join(workspaceRoot, "components");
const authMaterialOwners = new Set([
  "components/auth/auth-form-panel.tsx",
  "components/auth/auth-hero-panel.tsx",
  "components/auth/auth-shell.tsx",
]);
const authPagePattern =
  /^app\/\(auth\)\/(?:forgot-password|login|register)\/page\.tsx$/;

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
    message:
      "工作台确认操作必须使用 DashboardConfirmProvider，不能再调用 window.confirm。",
    pattern: /window\.confirm\s*\(/,
  },
  {
    allowedFiles: new Set(["dashboard-page-shell.tsx"]),
    message:
      "页面宽度与间距必须由 DashboardPageShell 提供，领域页面不能复制外壳类名。",
    pattern: /mx-auto flex w-full max-w-\[1320px\] flex-col/,
  },
  {
    allowedFiles: new Set(["dashboard-form-dialog.tsx"]),
    message:
      "弹窗输入样式必须复用 DashboardFormField 或 dashboardFormInputClassName。",
    pattern: /const\s+(?:input|textarea)ClassName\s*=/,
  },
  {
    allowedFiles: new Set(["dashboard-framework-primitives.tsx"]),
    message:
      "文件入口必须使用 DashboardFilePicker，领域组件不能直接渲染文件输入框。",
    pattern: /type=["']file["']/,
  },
  {
    message: "旧分页外壳已经移除，请使用 DashboardPaginationFooter。",
    pattern: /dashboard-pagination-controls|DashboardPaginationControls/,
  },
  {
    message:
      "领域组件不能新增状态标签组件，请直接使用全站 StatusBadge 并只映射 tone。",
    pattern:
      /\b(?:InlineChip|DashboardPill|WholesaleStatusBadge)\b|function\s+StatusBadge\s*\(/,
  },
  {
    allowedFiles: new Set(["dashboard-section-panel.tsx"]),
    message:
      "搜索图标与输入文字的间距必须由 DashboardSearchInput 统一管理，不能在领域页面绝对定位图标。",
    pattern: /<Search\b[^>]*\babsolute\b/,
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

/**
 * 下面的规则覆盖全站，而不只覆盖工作台目录。
 * 色值和控件限制放在结构守卫里，可以在代码评审前立即阻止设计系统再次分叉。
 */
const allSourceFiles = [
  ...(await collectSourceFiles(appRoot)),
  ...(await collectSourceFiles(componentsRoot)),
];

for (const absolutePath of allSourceFiles) {
  const source = await readFile(absolutePath, "utf8");
  const relativePath = path
    .relative(workspaceRoot, absolutePath)
    .replaceAll("\\", "/");

  if (/#[0-9a-fA-F]{3,8}\b|rgba?\s*\(/.test(source)) {
    violations.push(
      `${relativePath}: TS/TSX 禁止硬编码颜色；请改用 theme.css 语义令牌。`,
    );
  }

  const isUiControlFile = relativePath
    .replaceAll("\\", "/")
    .startsWith("components/ui/");
  if (/<(?:select|option)\b/.test(source)) {
    violations.push(
      `${relativePath}: 原生 select/option 会产生系统方形菜单；请使用 components/ui/select。`,
    );
  }

  if (!isUiControlFile && /<(?:input|textarea|button)\b/.test(source)) {
    violations.push(
      `${relativePath}: 原生表单控件只能出现在 components/ui；业务组件必须复用基础控件。`,
    );
  }

  if (/type=["'](?:date|month|datetime-local)["']/.test(source)) {
    violations.push(
      `${relativePath}: 原生日期控件会产生系统弹层；请使用 components/ui/date-picker。`,
    );
  }

  // 图表色权重较高，只能表达数据系列；普通表格分隔线必须使用低强调的边界语义。
  if (/divide-\[var\(--chart-\d\)\]/.test(source)) {
    violations.push(
      `${relativePath}: 图表色不能用作列表或表格分隔线；请使用 divide-border-subtle。`,
    );
  }

  if (/\b(?:WholesaleSelect|taskSelectClassName)\b/.test(source)) {
    violations.push(
      `${relativePath}: 领域 Select 包装和完整样式常量已移除；请直接使用全站 Select。`,
    );
  }

  if (
    !isUiControlFile &&
    /(?:function|const)\s+\w*(?:DatePicker|MonthPicker|DateTimePicker)\b/.test(
      source,
    )
  ) {
    violations.push(
      `${relativePath}: 领域日期包装会重新分叉交互规则；请直接使用全站 DatePicker。`,
    );
  }

  // Select 的 className 只负责宽度、间距或定位；控件外观由共享尺寸与语义令牌统一管理。
  const selectOpeningTags = source.match(/<Select\b[\s\S]*?>/g) ?? [];
  if (
    selectOpeningTags.some(
      (tag) =>
        /className=/.test(tag) &&
        /(?:\bbg-|\bborder(?:-|\b)|\brounded-|\bh-\d|focus:|\bring-)/.test(
          tag,
        ),
    )
  ) {
    violations.push(
      `${relativePath}: Select 的 className 只能控制布局，不能覆盖颜色、高度、圆角或焦点样式。`,
    );
  }

  // DatePicker 与 Select 一样只允许业务层控制布局，日期表面和焦点状态由共享组件统一负责。
  const datePickerOpeningTags = source.match(/<DatePicker\b[\s\S]*?>/g) ?? [];
  if (
    datePickerOpeningTags.some(
      (tag) =>
        /className=/.test(tag) &&
        /(?:\bbg-|\bborder(?:-|\b)|\brounded-|\bh-\d|focus:|\bring-)/.test(
          tag,
        ),
    )
  ) {
    violations.push(
      `${relativePath}: DatePicker 的 className 只能控制布局，不能覆盖颜色、高度、圆角或焦点样式。`,
    );
  }

  // 业务按钮可以保留定位、宽度等布局类，但不能重新定义背景、尺寸、圆角和悬停色。
  // 这些视觉状态必须由 Button 的 variant 与 size 提供，整张卡片点击则改用 InteractiveButton。
  const buttonOpeningTags = source.match(/<Button\b[\s\S]*?>/g) ?? [];
  if (
    buttonOpeningTags.some(
      (tag) =>
        /className=/.test(tag) &&
        /\bbg-(?:primary|white|surface-|status-)/.test(tag) &&
        /(?:\brounded-|\bh-(?:8|9|10|11|12)\b|hover:bg-)/.test(tag),
    )
  ) {
    violations.push(
      `${relativePath}: Button 禁止覆盖完整视觉样式；请使用 variant、size 或 InteractiveButton。`,
    );
  }

  /*
   * 认证照片和玻璃材质是经过确认的页面级变体，但只能由认证中层组件持有。
   * 页面仍然只能组装文案和表单，不能重新复制图片、卡片或基础控件样式。
   */
  const ownsAuthMaterial = authMaterialOwners.has(relativePath);
  const hasAuthMaterialClass =
    /auth-(?:card-surface|grid-dots|aside-overlay|aside-glow|form-surface)/.test(
      source,
    );
  if (hasAuthMaterialClass && !ownsAuthMaterial) {
    violations.push(
      `${relativePath}: 认证材质只能由 AuthShell、AuthHeroPanel 或 AuthFormPanel 持有。`,
    );
  }

  if (
    /zhang-kaiyv-Xqf2ph7vrgc-unsplash/.test(source) &&
    relativePath !== "components/auth/auth-hero-panel.tsx"
  ) {
    violations.push(
      `${relativePath}: 认证背景图片只能由 AuthHeroPanel 引用。`,
    );
  }

  if (authPagePattern.test(relativePath)) {
    if (/@\/components\/ui\/|className=/.test(source)) {
      violations.push(
        `${relativePath}: 认证页面只负责组装 AuthShell 与表单，不能直接持有基础控件或视觉类名。`,
      );
    }
  }

  if (/\b(?:AuthFeedback|PageBanner|NoticeTone)\b/.test(source)) {
    violations.push(
      `${relativePath}: 反馈必须使用全站 FeedbackNotice 与 FeedbackTone。`,
    );
  }

  const lineCount = source.split(/\r?\n/).length;
  if (
    lineCount > 400 &&
    (relativePath.startsWith("components/auth/") ||
      relativePath.startsWith("components/ui/"))
  ) {
    violations.push(
      `${relativePath}: 认证或基础 UI 文件超过 400 行，请按 view-model 或展示区块拆分。`,
    );
  }
}

const responsiveWhitelist = new Set([
  "components/dashboard/admin-shell.tsx",
  "components/dashboard/dashboard-home/dashboard-home-customizer.tsx",
]);

for (const absolutePath of await collectSourceFiles(dashboardRoot)) {
  const source = await readFile(absolutePath, "utf8");
  const relativePath = path
    .relative(workspaceRoot, absolutePath)
    .replaceAll("\\", "/");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > 400) {
    violations.push(
      `${relativePath}: 工作台文件超过 400 行，请先按查询、状态、弹窗或展示区块拆分。`,
    );
  }

  if (
    !responsiveWhitelist.has(relativePath) &&
    /hidden\s+md:block|grid\s+gap-3\s+md:hidden/.test(source)
  ) {
    violations.push(
      `${relativePath}: 数据双形态视图必须使用 ResponsiveDataView。`,
    );
  }
}

const cssFiles = [
  "app/theme.css",
  "app/auth.css",
  "app/root.css",
  "app/workspace.css",
];
for (const relativePath of cssFiles) {
  const source = await readFile(path.join(workspaceRoot, relativePath), "utf8");
  if (/\.dark\b|@custom-variant\s+dark\b/.test(source)) {
    violations.push(
      `${relativePath}: 项目不提供深色模式，禁止重新引入 .dark 或 dark 变体。`,
    );
  }

  if (/\.legal-page-background\b|\.public-state-background\b/.test(source)) {
    violations.push(
      `${relativePath}: 法律页和异常页必须继续复用工作台公共表面。`,
    );
  }

  if (
    relativePath !== "app/auth.css" &&
    /\.auth-(?:card-surface|grid-dots|aside-overlay|aside-glow|form-surface)\b/.test(
      source,
    )
  ) {
    violations.push(
      `${relativePath}: 认证材质类只能定义在 app/auth.css。`,
    );
  }
}

// 认证英雄区依赖这张本地图片；缺失时 Next.js 构建也无法生成稳定的尺寸和模糊占位。
try {
  await access(
    path.join(
      workspaceRoot,
      "public",
      "images",
      "zhang-kaiyv-Xqf2ph7vrgc-unsplash.jpg",
    ),
  );
} catch {
  violations.push(
    "public/images/zhang-kaiyv-Xqf2ph7vrgc-unsplash.jpg: 认证背景图片缺失。",
  );
}

if (violations.length > 0) {
  console.error("工作台共享结构检查失败：\n");
  violations.forEach((violation) => console.error(`- ${violation}`));
  process.exitCode = 1;
} else {
  console.log("工作台共享结构检查通过。");
}
