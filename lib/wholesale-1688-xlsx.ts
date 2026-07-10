import { unzipSync } from "fflate";

import {
  normalizeWholesale1688TableRows,
  type Wholesale1688IngestRow,
} from "./wholesale-1688-ingest";

type XlsxFiles = Record<string, Uint8Array>;

const textDecoder = new TextDecoder("utf-8");

export function parseWholesale1688Xlsx(
  buffer: ArrayBuffer,
): Wholesale1688IngestRow[] {
  const files = unzipSync(new Uint8Array(buffer));
  const sheetPath = getFirstSheetPath(files);
  const sheetXml = readTextFile(files, sheetPath);
  const sharedStrings = parseSharedStrings(readOptionalTextFile(files, "xl/sharedStrings.xml"));
  const tableRows = parseSheetRows(sheetXml, sharedStrings);

  return normalizeWholesale1688TableRows(tableRows);
}

function getFirstSheetPath(files: XlsxFiles) {
  const workbookXml = readTextFile(files, "xl/workbook.xml");
  const workbookDocument = parseXml(workbookXml);
  const firstSheet = getElements(workbookDocument, "sheet")[0];
  const relationshipId = firstSheet?.getAttribute("r:id");

  if (!relationshipId) {
    throw new Error("missing_sheet");
  }

  const relationshipsXml = readTextFile(files, "xl/_rels/workbook.xml.rels");
  const relationshipsDocument = parseXml(relationshipsXml);
  const relationship = getElements(relationshipsDocument, "Relationship").find(
    (entry) => entry.getAttribute("Id") === relationshipId,
  );
  const target = relationship?.getAttribute("Target");

  if (!target) {
    throw new Error("missing_sheet_target");
  }

  return normalizeWorkbookTarget(target);
}

function parseSharedStrings(xml: string | null) {
  if (!xml) {
    return [];
  }

  const document = parseXml(xml);

  return getElements(document, "si").map(readTextRuns);
}

function parseSheetRows(xml: string, sharedStrings: string[]) {
  const document = parseXml(xml);

  return getElements(document, "row")
    .map((row) => parseSheetRow(row, sharedStrings))
    .filter((row) => row.some((cell) => cell.trim()));
}

function parseSheetRow(row: Element, sharedStrings: string[]) {
  const values: string[] = [];

  for (const cell of getElements(row, "c")) {
    const cellIndex = getCellIndex(cell, values.length);
    values[cellIndex] = readCellValue(cell, sharedStrings);
  }

  return trimEmptyTail(
    Array.from({ length: values.length }, (_, index) => values[index] ?? ""),
  );
}

function readCellValue(cell: Element, sharedStrings: string[]) {
  const type = cell.getAttribute("t");

  if (type === "inlineStr") {
    return readTextRuns(cell);
  }

  const rawValue = getFirstText(cell, "v");

  if (!rawValue) {
    return "";
  }

  if (type === "s") {
    return sharedStrings[Number(rawValue)] ?? "";
  }

  if (type === "b") {
    return rawValue === "1" ? "是" : "否";
  }

  // 数字也先保留成文本，避免 1688 的长订单号被 JavaScript 数字精度截断。
  return rawValue;
}

function getCellIndex(cell: Element, fallbackIndex: number) {
  const reference = cell.getAttribute("r");
  const columnName = reference?.match(/^[A-Z]+/)?.[0];

  if (!columnName) {
    return fallbackIndex;
  }

  return columnName
    .split("")
    .reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function readTextRuns(element: Element) {
  return getElements(element, "t")
    .map((entry) => entry.textContent ?? "")
    .join("");
}

function getFirstText(element: Element, tagName: string) {
  return getElements(element, tagName)[0]?.textContent?.trim() ?? "";
}

function trimEmptyTail(row: string[]) {
  let endIndex = row.length;

  while (endIndex > 0 && !row[endIndex - 1]) {
    endIndex -= 1;
  }

  return row.slice(0, endIndex);
}

function normalizeWorkbookTarget(target: string) {
  const normalizedTarget = target.replace(/^\/+/, "");

  if (normalizedTarget.startsWith("xl/")) {
    return normalizedTarget;
  }

  return `xl/${normalizedTarget}`;
}

function readTextFile(files: XlsxFiles, path: string) {
  const content = files[path];

  if (!content) {
    throw new Error(`missing_xlsx_file:${path}`);
  }

  return textDecoder.decode(content);
}

function readOptionalTextFile(files: XlsxFiles, path: string) {
  const content = files[path];

  return content ? textDecoder.decode(content) : null;
}

function parseXml(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");

  if (getElements(document, "parsererror").length > 0) {
    throw new Error("invalid_xlsx_xml");
  }

  return document;
}

function getElements(parent: Document | Element, tagName: string) {
  const directMatches = Array.from(parent.getElementsByTagName(tagName));

  if (directMatches.length > 0) {
    return directMatches;
  }

  return Array.from(parent.getElementsByTagNameNS("*", tagName));
}
