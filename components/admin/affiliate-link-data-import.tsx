"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { AffiliateLinkValues } from "@/lib/affiliate-links";
import {
  getSampleAffiliateLinkCsvText,
  getSampleAffiliateLinkJsonText,
  parseAffiliateLinkCsvImport,
  parseAffiliateLinkExcelImport,
  parseAffiliateLinkJsonImport,
  sampleAffiliateLinkJson,
} from "@/lib/affiliate-link-import";

type AffiliateLinkDataImportProps = {
  currentValues: AffiliateLinkValues;
  onImport: (values: AffiliateLinkValues) => void;
};

export function AffiliateLinkDataImport({
  currentValues,
  onImport,
}: AffiliateLinkDataImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const sampleJsonText = getSampleAffiliateLinkJsonText();
  const sampleCsvText = getSampleAffiliateLinkCsvText();
  const sampleJsonHref = `data:application/json;charset=utf-8,${encodeURIComponent(
    sampleJsonText
  )}`;
  const sampleCsvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(
    sampleCsvText
  )}`;

  function applyImportResult(
    result: ReturnType<
      typeof parseAffiliateLinkJsonImport | typeof parseAffiliateLinkCsvImport
    >
  ) {

    if (!result.ok) {
      setError(result.message);
      setMessage("");
      return;
    }

    onImport(result.values);
    setError("");
    setMessage("Import loaded into the form. Review the fields before saving.");
  }

  function importPastedData(text: string) {
    const trimmed = text.trim();
    const result =
      trimmed.startsWith("{") || trimmed.startsWith("[")
        ? parseAffiliateLinkJsonImport(text, currentValues)
        : parseAffiliateLinkCsvImport(text, currentValues);

    applyImportResult(result);
  }

  async function importExcelData(data: ArrayBuffer) {
    const result = await parseAffiliateLinkExcelImport(data, currentValues);
    applyImportResult(result);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".json")) {
      const text = await file.text();
      setImportText(text);
      applyImportResult(parseAffiliateLinkJsonImport(text, currentValues));
      event.target.value = "";
      return;
    }

    if (fileName.endsWith(".csv")) {
      const text = await file.text();
      setImportText(text);
      applyImportResult(parseAffiliateLinkCsvImport(text, currentValues));
      event.target.value = "";
      return;
    }

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      await importExcelData(await file.arrayBuffer());
      event.target.value = "";
      return;
    }

    setError("Upload a .json, .csv, .xlsx, or .xls file.");
    setMessage("");
    event.target.value = "";
  }

  async function downloadSampleWorkbook() {
    const xlsx = await import("xlsx");
    const worksheet = xlsx.utils.json_to_sheet([sampleAffiliateLinkJson]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Links");
    const workbookArray = xlsx.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([workbookArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = href;
    link.download = "clickfolio-affiliate-link.sample.xlsx";
    link.click();
    URL.revokeObjectURL(href);
  }

  function loadSampleText(format: "json" | "csv") {
    setImportText(format === "json" ? sampleJsonText : sampleCsvText);
    setError("");
    setMessage(
      `${format.toUpperCase()} sample loaded. Edit it or fill the form.`
    );
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="border-b border-border/70">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-4" />
            Import data
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste JSON or CSV, or upload a JSON, CSV, or Excel file to fill the
            form.
          </p>
        </div>
        <CardAction className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a
              href={sampleJsonHref}
              download="clickfolio-affiliate-link.sample.json"
            >
              <Download className="size-3.5" />
              JSON
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={sampleCsvHref} download="clickfolio-affiliate-link.sample.csv">
              <Download className="size-3.5" />
              CSV
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadSampleWorkbook}
          >
            <Download className="size-3.5" />
            Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Upload
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="affiliate-link-import">
              Affiliate link data
            </FieldLabel>
            <Textarea
              id="affiliate-link-import"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              aria-invalid={Boolean(error)}
              className="min-h-36 font-mono text-sm"
              placeholder={sampleCsvText}
            />
            <FieldDescription>
              Supported now: one JSON object, one CSV row, or the first row from
              the first Excel worksheet.
            </FieldDescription>
            <FieldError>{error}</FieldError>
            {message ? (
              <p className="text-sm text-muted-foreground">{message}</p>
            ) : null}
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => importPastedData(importText)}
            >
              <FileSpreadsheet className="size-4" />
              Fill form
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => loadSampleText("json")}
            >
              Use JSON sample
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => loadSampleText("csv")}
            >
              Use CSV sample
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json,text/csv,.csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
