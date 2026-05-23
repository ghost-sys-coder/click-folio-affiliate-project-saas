"use client";

import { AlertCircle, CheckCircle2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AffiliateLinkImportRecord } from "@/lib/affiliate-link-import";

type AffiliateLinkBulkPreviewProps = {
  records: AffiliateLinkImportRecord[];
  onRemove: (index: number) => void;
  onCancel: () => void;
  onImport: () => void;
  isImporting: boolean;
};

export function AffiliateLinkBulkPreview({
  records,
  onRemove,
  onCancel,
  onImport,
  isImporting,
}: AffiliateLinkBulkPreviewProps) {
  const validCount = records.filter((r) => r.isValid).length;
  const invalidCount = records.length - validCount;

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 pb-4">
        <div className="space-y-1">
          <CardTitle>Import Preview</CardTitle>
          <CardDescription>
            {records.length} records found ({validCount} valid, {invalidCount} invalid).
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isImporting}>
            <X className="size-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onImport}
            disabled={isImporting || validCount === 0 || invalidCount > 0}
          >
            <CheckCircle2 className="size-4" />
            {isImporting ? "Importing..." : `Import ${validCount} links`}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/50 text-muted-foreground uppercase text-[0.65rem] font-medium tracking-wider">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Errors</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {records.map((record, index) => (
                <tr key={index} className={record.isValid ? "" : "bg-destructive/5"}>
                  <td className="px-4 py-3">
                    {record.isValid ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <AlertCircle className="size-4 text-destructive" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <div className="max-w-[200px] truncate">{record.values.title || "(Untitled)"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-[200px] truncate text-muted-foreground">
                      {record.values.destinationUrl || "(No URL)"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {record.errors.length > 0 ? (
                      <div className="text-xs text-destructive">
                        {record.errors.join(", ")}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemove(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
