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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
