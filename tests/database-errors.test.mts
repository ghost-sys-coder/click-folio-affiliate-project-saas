import test from "node:test";
import assert from "node:assert/strict";

import { isMissingTableError } from "../lib/database-errors.ts";

test("detects missing affiliate links table errors without exposing query text", () => {
  const error = new Error("Failed query");
  error.cause = new Error('relation "affiliate_links" does not exist');

  assert.equal(isMissingTableError(error), true);
});

test("does not classify unrelated database errors as missing table", () => {
  const error = new Error("connection timeout");

  assert.equal(isMissingTableError(error), false);
});
