import test from "node:test";
import assert from "node:assert/strict";

import {
  getSampleAffiliateLinkJsonText,
  parseAffiliateLinkJsonImport,
} from "../lib/affiliate-link-import.ts";
import { getDefaultAffiliateLinkValues } from "../lib/affiliate-links.ts";

test("parses sample affiliate link JSON into form values", () => {
  const result = parseAffiliateLinkJsonImport(getSampleAffiliateLinkJsonText());

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.values.title, "Creator tool bundle");
    assert.equal(result.values.destinationUrl, "https://example.com/creator-tool-bundle");
    assert.equal(result.values.status, "active");
    assert.equal(result.values.currency, "USD");
  }
});

test("merges imported fields over existing form values", () => {
  const currentValues = {
    ...getDefaultAffiliateLinkValues(),
    buttonLabel: "Shop now",
  };
  const result = parseAffiliateLinkJsonImport(
    JSON.stringify({
      title: "Imported title",
      destinationUrl: "https://example.com/imported",
    }),
    currentValues
  );

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.values.title, "Imported title");
    assert.equal(result.values.destinationUrl, "https://example.com/imported");
    assert.equal(result.values.buttonLabel, "Shop now");
  }
});

test("rejects bulk JSON arrays on the single link form", () => {
  const result = parseAffiliateLinkJsonImport("[]");

  assert.equal(result.ok, false);
});
