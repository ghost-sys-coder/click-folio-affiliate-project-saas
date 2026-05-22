"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Download, FileJson, Upload } from "lucide-react";

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
  getSampleAffiliateLinkJsonText,
  parseAffiliateLinkJsonImport,
} from "@/lib/affiliate-link-import";

type AffiliateLinkJsonImportProps = {
  currentValues: AffiliateLinkValues;
  onImport: (values: AffiliateLinkValues) => void;
};

export function AffiliateLinkJsonImport({
  currentValues,
  onImport,
}: AffiliateLinkJsonImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const sampleText = getSampleAffiliateLinkJsonText();
  const sampleHref = `data:application/json;charset=utf-8,${encodeURIComponent(
    sampleText
  )}`;

  function importJson(text: string) {
    const result = parseAffiliateLinkJsonImport(text, currentValues);

    if (!result.ok) {
      setError(result.message);
      setMessage("");
      return;
    }

    onImport(result.values);
    setError("");
    setMessage("JSON loaded into the form. Review the fields before saving.");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type &&
      file.type !== "application/json" &&
      !file.name.toLowerCase().endsWith(".json")
    ) {
      setError("Upload a .json file.");
      setMessage("");
      event.target.value = "";
      return;
    }

    const text = await file.text();
    setJsonText(text);
    importJson(text);
    event.target.value = "";
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="border-b border-border/70">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2">
            <FileJson className="size-4" />
            Import JSON
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste or upload one affiliate link JSON object to fill the form.
          </p>
        </div>
        <CardAction className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={sampleHref} download="clickfolio-affiliate-link.sample.json">
              <Download className="size-3.5" />
              Sample
            </a>
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
            <FieldLabel htmlFor="affiliate-link-json">
              Affiliate link JSON
            </FieldLabel>
            <Textarea
              id="affiliate-link-json"
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              aria-invalid={Boolean(error)}
              className="min-h-36 font-mono text-sm"
              placeholder={sampleText}
            />
            <FieldDescription>
              Supported now: one JSON object. The importer is structured so CSV
              and Excel rows can map to the same fields later.
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
              onClick={() => importJson(jsonText)}
            >
              <FileJson className="size-4" />
              Fill form
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setJsonText(sampleText);
                setError("");
                setMessage("Sample JSON loaded. Edit it or fill the form.");
              }}
            >
              Use sample
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
