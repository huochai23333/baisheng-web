import { readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

/** 统一解析 TS/TSX，所有规则族共享同一份 AST 事实，避免重复遍历源码。 */
export function collectAstFacts(source, absolutePath) {
  const sourceFile = ts.createSourceFile(
    absolutePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    absolutePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const jsx = [];
  const imports = [];
  const invalidHrefValues = [];
  const statusColorFunctions = [];

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      imports.push(node.moduleSpecifier.getText(sourceFile).slice(1, -1));
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagNode = ts.isJsxElement(node)
        ? node.openingElement.tagName
        : node.tagName;
      const attributes = ts.isJsxElement(node)
        ? node.openingElement.attributes
        : node.attributes;
      const className = getAttribute(attributes, "className");
      jsx.push({
        attributesText: attributes.getText(sourceFile),
        classText: className?.getText(sourceFile) ?? "",
        line: getNodeLine(sourceFile, node),
        tagName: getTagName(tagNode),
      });
      const href = getAttribute(attributes, "href");
      if (href && /var\s*\(--/.test(href.getText(sourceFile))) {
        invalidHrefValues.push({ line: getNodeLine(sourceFile, href) });
      }
    }
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node)
    ) {
      const functionName = getFunctionName(node);
      const returnedExpressions = getReturnedNonJsxExpressions(node, sourceFile);
      if (
        /(?:status|tone|badge)/i.test(functionName) &&
        returnedExpressions.some((expression) =>
          /["'`](?:[^"'`]*\s)?(?:bg|border|text)-(?:red|green|blue|amber|yellow|status|primary|content)/.test(
            expression,
          ),
        )
      ) {
        statusColorFunctions.push({
          line: getNodeLine(sourceFile, node),
          name: functionName,
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { imports, invalidHrefValues, jsx, statusColorFunctions };
}

export async function collectSourceFiles(directory) {
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

function getTagName(tagName) {
  if (ts.isIdentifier(tagName)) return tagName.text;
  if (ts.isPropertyAccessExpression(tagName)) return tagName.getText();
  return tagName.getText();
}

function getAttribute(attributes, name) {
  return attributes.properties.find(
    (property) =>
      ts.isJsxAttribute(property) && property.name.getText() === name,
  );
}

function getNodeLine(sourceFile, node) {
  return (
    sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
  );
}

function getFunctionName(node) {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text;
  if (
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
    ts.isVariableDeclaration(node.parent) &&
    ts.isIdentifier(node.parent.name)
  ) {
    return node.parent.name.text;
  }
  return "";
}

function getReturnedNonJsxExpressions(node, sourceFile) {
  const expressions = [];
  if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
    if (!isJsxExpression(node.body)) {
      expressions.push(node.body.getText(sourceFile));
    }
    return expressions;
  }
  if (!node.body) return expressions;
  for (const statement of node.body.statements) {
    if (
      ts.isReturnStatement(statement) &&
      statement.expression &&
      !isJsxExpression(statement.expression)
    ) {
      expressions.push(statement.expression.getText(sourceFile));
    }
  }
  return expressions;
}

function isJsxExpression(expression) {
  let current = expression;
  while (ts.isParenthesizedExpression(current)) current = current.expression;
  return (
    ts.isJsxElement(current) ||
    ts.isJsxSelfClosingElement(current) ||
    ts.isJsxFragment(current)
  );
}
