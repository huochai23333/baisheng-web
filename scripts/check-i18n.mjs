import fs from "node:fs";
import path from "node:path";

import ts from "typescript";

const MESSAGE_FILES = ["messages/zh.json", "messages/en.json"];
const SOURCE_ROOTS = ["app", "components", "lib"];
const VISIBLE_ATTRIBUTE_NAMES = new Set([
  "alt",
  "aria-label",
  "placeholder",
  "title",
]);
const ALLOWED_VISIBLE_IDENTIFIERS = new Set([
  "1688",
  "CNY",
  "blur",
  "example@bs-system.com",
  "name@example.com",
]);
const HUMAN_TEXT_PATTERN = /[A-Za-z\u3400-\u9fff]/;

/**
 * 同时检查消息结构和 TSX 里的直接界面文字。
 *
 * 组件允许出现币种、邮箱示例和 1688 这类不可翻译标识；普通标题、占位文字、
 * 表头与按钮文字必须放入中英文消息文件，避免只在某一种语言下可读。
 */
function main() {
  const [zhMessages, enMessages] = MESSAGE_FILES.map((file) =>
    JSON.parse(fs.readFileSync(file, "utf8")),
  );
  const zhShape = collectMessageShape(zhMessages);
  const enShape = collectMessageShape(enMessages);
  const shapeErrors = compareMessageShapes(zhShape, enShape);
  const sourceErrors = findHardcodedVisibleText();
  const errors = [...shapeErrors, ...sourceErrors];

  if (errors.length > 0) {
    console.error("双语静态检查未通过：");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("双语消息键结构一致，TSX 中未发现未经允许的直接界面文案。");
}

function collectMessageShape(value, prefix = "", output = new Map()) {
  if (Array.isArray(value)) {
    output.set(prefix, "array");
    return output;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      output.set(prefix, "empty-object");
    }

    for (const [key, child] of entries) {
      collectMessageShape(child, prefix ? `${prefix}.${key}` : key, output);
    }

    return output;
  }

  output.set(prefix, typeof value);
  return output;
}

function compareMessageShapes(zhShape, enShape) {
  const errors = [];
  const keys = new Set([...zhShape.keys(), ...enShape.keys()]);

  for (const key of [...keys].sort()) {
    if (!zhShape.has(key)) {
      errors.push(`英文消息存在但中文缺少：${key}`);
      continue;
    }

    if (!enShape.has(key)) {
      errors.push(`中文消息存在但英文缺少：${key}`);
      continue;
    }

    if (zhShape.get(key) !== enShape.get(key)) {
      errors.push(`中英文消息类型不同：${key}`);
    }
  }

  return errors;
}

function findHardcodedVisibleText() {
  const files = [];
  const errors = [];

  for (const root of SOURCE_ROOTS) {
    collectSourceFiles(root, files);
  }

  for (const file of files) {
    if (!file.endsWith(".tsx")) {
      continue;
    }

    const sourceText = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    function visit(node) {
      if (ts.isJsxText(node)) {
        reportIfVisible(node, node.text);
      }

      if (
        ts.isJsxAttribute(node) &&
        VISIBLE_ATTRIBUTE_NAMES.has(node.name.text) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      ) {
        reportIfVisible(node, node.initializer.text);
      }

      // 直接放在 JSX 表达式中的字符串也会呈现在页面上，例如 {"状态"}。
      if (
        (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
        node.parent &&
        ts.isJsxExpression(node.parent)
      ) {
        reportIfVisible(node, node.text);
      }

      ts.forEachChild(node, visit);
    }

    function reportIfVisible(node, rawText) {
      const text = rawText.replace(/\s+/g, " ").trim();

      if (
        !text ||
        !HUMAN_TEXT_PATTERN.test(text) ||
        ALLOWED_VISIBLE_IDENTIFIERS.has(text)
      ) {
        return;
      }

      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      errors.push(`${file}:${position.line + 1} 请把界面文案 ${JSON.stringify(text)} 迁移到消息文件`);
    }

    visit(sourceFile);
  }

  return errors;
}

function collectSourceFiles(directory, files) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectSourceFiles(entryPath, files);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
}

main();
