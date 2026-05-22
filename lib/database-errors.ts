export type DatabaseReadErrorKind = "missing-table" | "unknown";

export type DatabaseReadError = {
  ok: false;
  kind: DatabaseReadErrorKind;
};

export function getDatabaseReadError(error: unknown): DatabaseReadError {
  return {
    ok: false,
    kind: isMissingTableError(error) ? "missing-table" : "unknown",
  };
}

export function isMissingTableError(error: unknown) {
  const text = collectErrorText(error).toLowerCase();

  return (
    text.includes("42p01") ||
    (text.includes("failed query") && text.includes('from "affiliate_links"')) ||
    (text.includes("affiliate_links") &&
      text.includes("relation") &&
      text.includes("does not exist"))
  );
}

function collectErrorText(error: unknown, seen = new Set<unknown>()): string {
  if (!error || seen.has(error)) {
    return "";
  }

  seen.add(error);

  if (typeof error === "string") {
    return error;
  }

  if (!(error instanceof Error)) {
    return "";
  }

  const cause = "cause" in error ? collectErrorText(error.cause, seen) : "";

  return [error.name, error.message, cause].filter(Boolean).join(" ");
}
