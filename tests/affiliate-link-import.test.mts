import test from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";

import {
  getSampleAffiliateLinkCsvText,
  getSampleAffiliateLinkJsonText,
  parseAffiliateLinkExcelImport,
  parseAffiliateLinkCsvImport,
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

test("parses sample affiliate link CSV into form values", () => {
  const result = parseAffiliateLinkCsvImport(getSampleAffiliateLinkCsvText());

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.values.title, "Creator tool bundle");
    assert.equal(result.values.destinationUrl, "https://example.com/creator-tool-bundle");
    assert.equal(result.values.status, "active");
    assert.equal(result.values.currency, "USD");
  }
});

test("parses quoted CSV fields with commas", () => {
  const result = parseAffiliateLinkCsvImport(
    [
      "title,description,destinationUrl,buttonLabel,status",
      '"Desk setup","Monitor, keyboard, and chair","https://example.com/desk","View Deal",active',
    ].join("\n")
  );

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.values.title, "Desk setup");
    assert.equal(result.values.description, "Monitor, keyboard, and chair");
    assert.equal(result.values.destinationUrl, "https://example.com/desk");
  }
});

test("parses the first Excel worksheet row into form values", async () => {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      title: "Workbook link",
      destinationUrl: "https://example.com/workbook",
      buttonLabel: "Open offer",
      status: "inactive",
      currency: "gbp",
    },
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Links");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  const result = await parseAffiliateLinkExcelImport(buffer);

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.values.title, "Workbook link");
    assert.equal(result.values.destinationUrl, "https://example.com/workbook");
    assert.equal(result.values.buttonLabel, "Open offer");
    assert.equal(result.values.status, "inactive");
    assert.equal(result.values.currency, "GBP");
  }
});
