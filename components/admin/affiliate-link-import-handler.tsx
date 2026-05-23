"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createBulkAffiliateLinks } from "@/actions/affiliate-links";
import { AffiliateLinkBulkPreview } from "@/components/admin/affiliate-link-bulk-preview";
import { AffiliateLinkDataImport } from "@/components/admin/affiliate-link-data-import";
import { AffiliateLinkForm } from "@/components/admin/affiliate-link-form";
import type { AffiliateLinkBulkImportResult, AffiliateLinkImportRecord } from "@/lib/affiliate-link-import";
import type { AffiliateLinkFormState, AffiliateLinkValues } from "@/lib/affiliate-links";

type AffiliateLinkImportHandlerProps = {
  initialValues: AffiliateLinkValues;
  createAction: (
    state: AffiliateLinkFormState,
    formData: FormData
  ) => Promise<AffiliateLinkFormState>;
};

export function AffiliateLinkImportHandler({
  initialValues,
  createAction,
}: AffiliateLinkImportHandlerProps) {
  const [stagedRecords, setStagedRecords] = useState<AffiliateLinkImportRecord[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [singleFormValues, setSingleFormValues] = useState(initialValues);

  function handleImportResult(result: AffiliateLinkBulkImportResult) {
    if (result.summary.total === 0) return;

    if (result.summary.total === 1 && result.records[0].isValid) {
        // For a single valid record, we can just fill the form as before
        setSingleFormValues(result.records[0].values);
        toast.success("Data loaded into the form.");
        return;
    }

    setStagedRecords(result.records);
    setIsBulkMode(true);
  }

  function handleRemoveRecord(index: number) {
    setStagedRecords((prev) => prev.filter((_, i) => i !== index));
    if (stagedRecords.length <= 1) {
      setIsBulkMode(false);
    }
  }

  async function handleBulkImport() {
    setIsImporting(true);
    try {
      const validLinks = stagedRecords
        .filter((r) => r.isValid)
        .map((r) => r.values);
      
      await createBulkAffiliateLinks(validLinks);
      toast.success(`Successfully imported ${validLinks.length} links.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import links.");
      setIsImporting(false);
    }
  }

  if (isBulkMode && stagedRecords.length > 0) {
    return (
      <div className="space-y-4">
        <AffiliateLinkBulkPreview
          records={stagedRecords}
          onRemove={handleRemoveRecord}
          onCancel={() => setIsBulkMode(false)}
          onImport={handleBulkImport}
          isImporting={isImporting}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <AffiliateLinkDataImport
        currentValues={singleFormValues}
        onImportResult={handleImportResult}
      />
      <AffiliateLinkForm
        action={createAction}
        initialValues={singleFormValues}
        submitLabel="Create link"
        title="Link details"
      />
    </div>
  );
}
