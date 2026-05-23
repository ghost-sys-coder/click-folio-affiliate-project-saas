import {
  affiliateLinkStatuses,
  getDefaultAffiliateLinkValues,
  type AffiliateLinkStatus,
  type AffiliateLinkValues,
} from "./affiliate-links.ts";

export type AffiliateLinkImportRecord = {
  values: AffiliateLinkValues;
  isValid: boolean;
  errors: string[];
};

export type AffiliateLinkBulkImportResult = {
  records: AffiliateLinkImportRecord[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
};

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

export const sampleAffiliateLinks = [
  {
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
  },
  {
    title: "Design essentials pack",
    description: "Everything you need for high-quality visuals.",
    destinationUrl: "https://example.com/design-essentials",
    imageUrl: "https://example.com/assets/design-pack.png",
    category: "Design",
    network: "Impact",
    buttonLabel: "Grab Offer",
    status: "active",
    sortOrder: "10",
    commissionType: "CPA",
    commissionValue: "15.00",
    price: "49.00",
    currency: "USD",
  },
  {
    title: "Productivity masterclass",
    description: "Advanced workflows for digital creators.",
    destinationUrl: "https://example.com/productivity-class",
    imageUrl: "https://example.com/assets/productivity.png",
    category: "Education",
    network: "Direct",
    buttonLabel: "Join Now",
    status: "inactive",
    sortOrder: "20",
    commissionType: "Percentage",
    commissionValue: "30.00",
    price: "199.00",
    currency: "USD",
  },
] satisfies AffiliateLinkValues[];

export function parseAffiliateLinkJsonImport(
  jsonText: string,
  fallbackValues = getDefaultAffiliateLinkValues()
): AffiliateLinkBulkImportResult {
  if (!jsonText.trim()) {
    return createEmptyBulkResult();
  }

  try {
    const parsed = JSON.parse(jsonText) as unknown;

    if (Array.isArray(parsed)) {
      return normalizeBulkImportRecords(parsed, fallbackValues);
    }

    if (!isPlainObject(parsed)) {
      return createEmptyBulkResult();
    }

    return normalizeBulkImportRecords([parsed], fallbackValues);
  } catch {
    return createEmptyBulkResult();
  }
}

export function parseAffiliateLinkCsvImport(
  csvText: string,
  fallbackValues = getDefaultAffiliateLinkValues()
): AffiliateLinkBulkImportResult {
  if (!csvText.trim()) {
    return createEmptyBulkResult();
  }

  const rows = parseCsvRows(csvText);

  if (rows.length < 2) {
    return createEmptyBulkResult();
  }

  const [headers, ...dataRows] = rows;
  const records: Record<string, unknown>[] = [];

  dataRows.forEach((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      const field = normalizeHeader(header);
      if (field) {
        record[field] = row[index] ?? "";
      }
    });
    records.push(record);
  });

  return normalizeBulkImportRecords(records, fallbackValues);
}

export async function parseAffiliateLinkExcelImport(
  data: ArrayBuffer | Uint8Array,
  fallbackValues = getDefaultAffiliateLinkValues()
): Promise<AffiliateLinkBulkImportResult> {
  const xlsx = await import("xlsx");
  const workbook = xlsx.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return createEmptyBulkResult();
  }

  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[firstSheetName],
    {
      defval: "",
    }
  );

  return normalizeBulkImportRecords(rows, fallbackValues);
}

export function normalizeBulkImportRecords(
  rawRecords: unknown[],
  fallbackValues = getDefaultAffiliateLinkValues()
): AffiliateLinkBulkImportResult {
  const records: AffiliateLinkImportRecord[] = [];
  let validCount = 0;
  let invalidCount = 0;

  rawRecords.forEach((raw) => {
    if (!isPlainObject(raw)) {
      return;
    }

    const record = normalizeAffiliateLinkImportRecord(raw, fallbackValues);
    records.push(record);

    if (record.isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
  });

  return {
    records,
    summary: {
      total: records.length,
      valid: validCount,
      invalid: invalidCount,
    },
  };
}

export function normalizeAffiliateLinkImportRecord(
  record: Record<string, unknown>,
  fallbackValues = getDefaultAffiliateLinkValues()
): AffiliateLinkImportRecord {
  const values: Record<keyof AffiliateLinkValues, string> = {
    ...fallbackValues,
  };
  const errors: string[] = [];

  for (const field of affiliateLinkImportFieldNames) {
    if (!(field in record)) {
      continue;
    }

    const value = normalizeImportedValue(record[field]);

    if (value === null) {
      errors.push(`${field} must be a string, number, or boolean`);
      continue;
    }

    values[field] = normalizeFieldValue(field, value, fallbackValues);
  }

  // Basic validation for mandatory fields in import
  if (!values.title) {
    errors.push("Title is required");
  }
  if (!values.destinationUrl) {
    errors.push("Destination URL is required");
  }

  return {
    values: values as AffiliateLinkValues,
    isValid: errors.length === 0,
    errors,
  };
}

function createEmptyBulkResult(): AffiliateLinkBulkImportResult {
  return {
    records: [],
    summary: { total: 0, valid: 0, invalid: 0 },
  };
}

export function getSampleAffiliateLinkJsonText() {
  return JSON.stringify(sampleAffiliateLinks, null, 2);
}

export function getSampleAffiliateLinkCsvText() {
  const headers = affiliateLinkImportFieldNames;
  const headerRow = headers.join(",");
  const dataRows = sampleAffiliateLinks.map((link) =>
    headers.map((field) => formatCsvCell(link[field])).join(",")
  );

  return `${headerRow}\n${dataRows.join("\n")}\n`;
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
