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

test("parses sample affiliate link JSON into bulk records", () => {
  const result = parseAffiliateLinkJsonImport(getSampleAffiliateLinkJsonText());

  assert.equal(result.summary.total, 1);
  const record = result.records[0];
  assert.equal(record.isValid, true);
  assert.equal(record.values.title, "Creator tool bundle");
  assert.equal(record.values.destinationUrl, "https://example.com/creator-tool-bundle");
  assert.equal(record.values.status, "active");
  assert.equal(record.values.currency, "USD");
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

  assert.equal(result.summary.total, 1);
  const record = result.records[0];
  assert.equal(record.isValid, true);
  assert.equal(record.values.title, "Imported title");
  assert.equal(record.values.destinationUrl, "https://example.com/imported");
  assert.equal(record.values.buttonLabel, "Shop now");
});

test("supports bulk JSON arrays", () => {
  const result = parseAffiliateLinkJsonImport(JSON.stringify([
    { title: "Link 1", destinationUrl: "https://e.com/1" },
    { title: "Link 2", destinationUrl: "https://e.com/2" }
  ]));

  assert.equal(result.summary.total, 2);
  assert.equal(result.records[0].values.title, "Link 1");
  assert.equal(result.records[1].values.title, "Link 2");
});

test("parses sample affiliate link CSV into bulk records", () => {
  const result = parseAffiliateLinkCsvImport(getSampleAffiliateLinkCsvText());

  assert.equal(result.summary.total, 1);
  const record = result.records[0];
  assert.equal(record.isValid, true);
  assert.equal(record.values.title, "Creator tool bundle");
  assert.equal(record.values.destinationUrl, "https://example.com/creator-tool-bundle");
  assert.equal(record.values.status, "active");
  assert.equal(record.values.currency, "USD");
});

test("parses multiple CSV rows", () => {
  const csv = [
    "title,destinationUrl",
    "Link A,https://a.com",
    "Link B,https://b.com"
  ].join("\n");
  const result = parseAffiliateLinkCsvImport(csv);

  assert.equal(result.summary.total, 2);
  assert.equal(result.records[0].values.title, "Link A");
  assert.equal(result.records[1].values.title, "Link B");
});

test("parses quoted CSV fields with commas", () => {
  const result = parseAffiliateLinkCsvImport(
    [
      "title,description,destinationUrl,buttonLabel,status",
      '"Desk setup","Monitor, keyboard, and chair","https://example.com/desk","View Deal",active',
    ].join("\n")
  );

  assert.equal(result.summary.total, 1);
  const record = result.records[0];
  assert.equal(record.isValid, true);
  assert.equal(record.values.title, "Desk setup");
  assert.equal(record.values.description, "Monitor, keyboard, and chair");
  assert.equal(record.values.destinationUrl, "https://example.com/desk");
});

test("parses multiple Excel worksheet rows", async () => {
  const data = [
    {
      title: "Workbook link 1",
      destinationUrl: "https://example.com/1",
      buttonLabel: "Open offer",
      status: "inactive",
      currency: "gbp",
    },
    {
      title: "Workbook link 2",
      destinationUrl: "https://example.com/2",
      buttonLabel: "Open offer",
      status: "active",
      currency: "usd",
    },
  ];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Links");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  const result = await parseAffiliateLinkExcelImport(buffer);

  assert.equal(result.summary.total, 2);
  assert.equal(result.records[0].values.title, "Workbook link 1");
  assert.equal(result.records[1].values.title, "Workbook link 2");
  assert.equal(result.records[0].values.currency, "GBP");
});
