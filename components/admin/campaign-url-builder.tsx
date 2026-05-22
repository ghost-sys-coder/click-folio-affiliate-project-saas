"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, RotateCcw, WandSparkles } from "lucide-react";
import type { ZodIssue } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import {
  buildCampaignUrl,
  campaignUrlInputSchema,
  suggestedMediums,
  suggestedSources,
} from "@/lib/campaign-url";

type CampaignUrlBuilderProps = {
  publicProfileUrl: string;
};

type CampaignFormState = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
};

type FieldErrors = Partial<Record<keyof CampaignFormState, string>>;

const initialFormState: CampaignFormState = {
  source: "",
  medium: "",
  campaign: "",
  content: "",
  term: "",
};

export function CampaignUrlBuilder({
  publicProfileUrl,
}: CampaignUrlBuilderProps) {
  const [form, setForm] = useState<CampaignFormState>(initialFormState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copiedTarget, setCopiedTarget] = useState<"clean" | "campaign" | null>(
    null
  );

  function updateField(field: keyof CampaignFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setGeneratedUrl("");
  }

  function generateUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = campaignUrlInputSchema.safeParse(form);

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error.issues));
      setGeneratedUrl("");
      return;
    }

    setErrors({});
    setGeneratedUrl(buildCampaignUrl(publicProfileUrl, parsed.data));
  }

  function resetForm() {
    setForm(initialFormState);
    setErrors({});
    setGeneratedUrl("");
    setCopiedTarget(null);
  }

  async function copyValue(value: string, target: "clean" | "campaign") {
    await navigator.clipboard.writeText(value);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1500);
  }

  return (
    <div className="grid gap-5">
      <Card className="border-border/70 bg-card">
        <CardHeader className="gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1">
            <CardTitle>Clean public profile URL</CardTitle>
            <CardDescription>
              Share this when you do not need campaign attribution.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => copyValue(publicProfileUrl, "clean")}
          >
            {copiedTarget === "clean" ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copiedTarget === "clean" ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground break-all">
            {publicProfileUrl}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle>Campaign URL builder</CardTitle>
          <CardDescription>
            Use campaign URLs when sharing your public page on social platforms,
            emails, paid ads, or communities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={generateUrl}>
            <FieldGroup className="grid gap-4 md:grid-cols-3">
              <CampaignField
                label="Source"
                value={form.source}
                error={errors.source}
                placeholder="tiktok"
                description="Where the visitor came from."
                onChange={(value) => updateField("source", value)}
              />
              <CampaignField
                label="Medium"
                value={form.medium}
                error={errors.medium}
                placeholder="social"
                description="The channel type."
                onChange={(value) => updateField("medium", value)}
              />
              <CampaignField
                label="Campaign"
                value={form.campaign}
                error={errors.campaign}
                placeholder="black_friday"
                description="The campaign name."
                onChange={(value) => updateField("campaign", value)}
              />
            </FieldGroup>

            <PresetGroup
              label="Suggested sources"
              values={suggestedSources}
              onSelect={(value) => updateField("source", value)}
            />

            <PresetGroup
              label="Suggested mediums"
              values={suggestedMediums}
              onSelect={(value) => updateField("medium", value)}
            />

            <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Advanced optional fields</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use these when you need to distinguish ads, placements, or
                  search terms inside the same campaign.
                </p>
              </div>
              <CampaignField
                label="Content"
                value={form.content}
                error={errors.content}
                placeholder="bio_link"
                description="Optional placement or creative."
                onChange={(value) => updateField("content", value)}
              />
              <CampaignField
                label="Term"
                value={form.term}
                error={errors.term}
                placeholder="affiliate_tools"
                description="Optional keyword or audience term."
                onChange={(value) => updateField("term", value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">
                <WandSparkles className="size-4" />
                Generate URL
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card">
        <CardHeader className="gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1">
            <CardTitle>Generated campaign URL</CardTitle>
            <CardDescription>
              Copy this URL when sharing your public page for this campaign.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!generatedUrl}
            onClick={() => copyValue(generatedUrl, "campaign")}
          >
            {copiedTarget === "campaign" ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copiedTarget === "campaign" ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          {generatedUrl ? (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground break-all">
              {generatedUrl}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
              Fill in source, medium, and campaign to generate a trackable URL.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignField({
  label,
  value,
  error,
  placeholder,
  description,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  description: string;
  onChange: (value: string) => void;
}) {
  const id = `campaign-${label.toLowerCase()}`;

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldDescription>{description}</FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function PresetGroup({
  label,
  values,
  onSelect,
}: {
  label: string;
  values: readonly string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelect(value)}
          >
            {value}
          </Button>
        ))}
      </div>
    </div>
  );
}

function toFieldErrors(issues: ZodIssue[]) {
  return issues.reduce<FieldErrors>((fieldErrors, issue) => {
    const field = issue.path[0];

    if (typeof field === "string" && field in initialFormState) {
      fieldErrors[field as keyof CampaignFormState] = issue.message;
    }

    return fieldErrors;
  }, {});
}
