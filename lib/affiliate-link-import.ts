import {
  affiliateLinkStatuses,
  getDefaultAffiliateLinkValues,
  type AffiliateLinkStatus,
  type AffiliateLinkValues,
} from "./affiliate-links.ts";

export type AffiliateLinkImportResult =
  | { ok: true; values: AffiliateLinkValues }
  | { ok: false; message: string };

export const affiliateLinkImportFieldNames = [
  "title",
  "description",
  "destinationUrl",
  "imageUrl",
  "category",
  "network",
  "buttonLabel",
  "status",
  "sortOrder",
  "commissionType",
  "commissionValue",
  "price",
  "currency",
] as const satisfies readonly (keyof AffiliateLinkValues)[];

export const sampleAffiliateLinkJson = {
  title: "Creator tool bundle",
  description: "A practical toolkit for building and monetizing content.",
  destinationUrl: "https://example.com/creator-tool-bundle",
  imageUrl: "https://example.com/assets/creator-tool-bundle.png",
  category: "Creator tools",
  network: "PartnerStack",
  buttonLabel: "View Deal",
  status: "active",
  sortOrder: "0",
  commissionType: "recurring",
  commissionValue: "25.00",
  price: "99.00",
  currency: "USD",
} satisfies AffiliateLinkValues;

export function parseAffiliateLinkJsonImport(
  jsonText: string,
  fallbackValues = getDefaultAffiliateLinkValues()
): AffiliateLinkImportResult {
  if (!jsonText.trim()) {
    return {
      ok: false,
      message: "Paste a JSON object or upload a .json file first.",
    };
  }

  try {
    const parsed = JSON.parse(jsonText) as unknown;

    if (Array.isArray(parsed)) {
      return {
        ok: false,
        message:
          "This form imports one link at a time. Bulk JSON, CSV, and Excel imports can use this parser later.",
      };
    }

    if (!isPlainObject(parsed)) {
      return {
        ok: false,
        message: "The JSON must be a single object with affiliate link fields.",
      };
    }

    return normalizeAffiliateLinkImportRecord(parsed, fallbackValues);
  } catch {
    return {
      ok: false,
      message: "The pasted content is not valid JSON.",
    };
  }
}

export function parseAffiliateLinkCsvImport(
  csvText: string,
  fallbackValues = getDefaultAffiliateLinkValues()
): AffiliateLinkImportResult {
  if (!csvText.trim()) {
    return {
      ok: false,
      message: "Paste CSV content or upload a .csv file first.",
    };
  }

  const rows = parseCsvRows(csvText);

  if (rows.length < 2) {
    return {
      ok: false,
      message: "The CSV must include a header row and one affiliate link row.",
    };
  }

  const [headers, firstRow] = rows;
  const record: Record<string, unknown> = {};

  headers.forEach((header, index) => {
    const field = normalizeHeader(header);

    if (field) {
      record[field] = firstRow[index] ?? "";
    }
  });

  return normalizeAffiliateLinkImportRecord(record, fallbackValues);
}

export async function parseAffiliateLinkExcelImport(
  data: ArrayBuffer | Uint8Array,
  fallbackValues = getDefaultAffiliateLinkValues()
): Promise<AffiliateLinkImportResult> {
  const xlsx = await import("xlsx");
  const workbook = xlsx.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      ok: false,
      message: "The workbook does not contain any sheets.",
    };
  }

  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[firstSheetName],
    {
      defval: "",
    }
  );

  if (rows.length === 0) {
    return {
      ok: false,
      message:
        "The first worksheet must include headers and one affiliate link row.",
    };
  }

  return normalizeAffiliateLinkImportRecord(rows[0], fallbackValues);
}

export function normalizeAffiliateLinkImportRecord(
  record: Record<string, unknown>,
  fallbackValues = getDefaultAffiliateLinkValues()
): AffiliateLinkImportResult {
  const values: Record<keyof AffiliateLinkValues, string> = {
    ...fallbackValues,
  };
  const invalidFields: string[] = [];

  for (const field of affiliateLinkImportFieldNames) {
    if (!(field in record)) {
      continue;
    }

    const value = normalizeImportedValue(record[field]);

    if (value === null) {
      invalidFields.push(field);
      continue;
    }

    values[field] = normalizeFieldValue(field, value, fallbackValues);
  }

  if (invalidFields.length > 0) {
    return {
      ok: false,
      message: `These fields must be strings, numbers, booleans, or null: ${invalidFields.join(
        ", "
      )}.`,
    };
  }

  return { ok: true, values: values as AffiliateLinkValues };
}

export function getSampleAffiliateLinkJsonText() {
  return JSON.stringify(sampleAffiliateLinkJson, null, 2);
}

export function getSampleAffiliateLinkCsvText() {
  const headers = affiliateLinkImportFieldNames;
  const values = headers.map((field) =>
    formatCsvCell(sampleAffiliateLinkJson[field])
  );

  return `${headers.join(",")}\n${values.join(",")}\n`;
}

function normalizeFieldValue(
  field: keyof AffiliateLinkValues,
  value: string,
  fallbackValues: AffiliateLinkValues
) {
  if (field === "status") {
    return normalizeStatus(value, fallbackValues.status);
  }

  if (field === "currency") {
    return value.toUpperCase();
  }

  return value;
}

function normalizeImportedValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).trim();
  }

  return null;
}

function normalizeStatus(value: string, fallback: AffiliateLinkStatus) {
  return affiliateLinkStatuses.includes(value as AffiliateLinkStatus)
    ? (value as AffiliateLinkStatus)
    : fallback;
}

function normalizeHeader(header: string) {
  const normalized = header.trim();

  return affiliateLinkImportFieldNames.find((field) => field === normalized);
}

function parseCsvRows(csvText: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(cell.trim());

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  row.push(cell.trim());

  if (row.some((value) => value !== "")) {
    rows.push(row);
  }

  return rows;
}

function formatCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
