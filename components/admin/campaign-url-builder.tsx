"use client";

import { useActionState, useState } from "react";
import { BarChart3, Check, Copy, RotateCcw, WandSparkles } from "lucide-react";

import { saveCampaignUrl, type CampaignBuilderState } from "@/actions/campaigns";
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
  suggestedMediums,
  suggestedSources,
} from "@/lib/campaign-url";
import type { SavedCampaignSummary } from "@/db/campaigns";

type CampaignUrlBuilderProps = {
  publicProfileUrl: string;
  savedCampaigns: SavedCampaignSummary[];
};

type CampaignFormState = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
};

const initialFormValues: CampaignFormState = {
  source: "",
  medium: "",
  campaign: "",
  content: "",
  term: "",
};

const initialState: CampaignBuilderState = {
  values: initialFormValues,
};

export function CampaignUrlBuilder({
  publicProfileUrl,
  savedCampaigns: initialSavedCampaigns,
}: CampaignUrlBuilderProps) {
  const [state, formAction, pending] = useActionState<CampaignBuilderState, FormData>(
    saveCampaignUrl,
    initialState
  );
  const [form, setForm] = useState<CampaignFormState>(initialFormValues);
  const [copiedTarget, setCopiedTarget] = useState<"clean" | "campaign" | null>(
    null
  );
  const savedCampaigns = state.savedCampaign
    ? [
        state.savedCampaign,
        ...initialSavedCampaigns.filter(
          (campaign) => campaign.id !== state.savedCampaign?.id
        ),
      ]
    : initialSavedCampaigns;
  const generatedUrl =
    state.generatedUrl && state.generatedUrl.length > 0
      ? state.generatedUrl
      : buildDraftUrl(publicProfileUrl, form);

  function updateField(field: keyof CampaignFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(initialFormValues);
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
            Save campaign URLs when sharing your public page on social platforms,
            emails, paid ads, or communities so analytics can track them cleanly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="campaign-url-builder-form" className="grid gap-5" action={formAction}>
            <input type="hidden" name="publicProfileUrl" value={publicProfileUrl} />
            <FieldGroup className="grid gap-4 md:grid-cols-3">
              <CampaignField
                label="Source"
                value={form.source}
                error={state.errors?.source}
                placeholder="tiktok"
                description="Where the visitor came from."
                onChange={(value) => updateField("source", value)}
              />
              <CampaignField
                label="Medium"
                value={form.medium}
                error={state.errors?.medium}
                placeholder="social"
                description="The channel type."
                onChange={(value) => updateField("medium", value)}
              />
              <CampaignField
                label="Campaign"
                value={form.campaign}
                error={state.errors?.campaign}
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
                error={state.errors?.content}
                placeholder="bio_link"
                description="Optional placement or creative."
                onChange={(value) => updateField("content", value)}
              />
              <CampaignField
                label="Term"
                value={form.term}
                error={state.errors?.term}
                placeholder="affiliate_tools"
                description="Optional keyword or audience term."
                onChange={(value) => updateField("term", value)}
              />
            </div>

            {state.message ? (
              <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {state.message}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                <WandSparkles className="size-4" />
                {pending ? "Saving..." : "Save campaign URL"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={pending}>
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

      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle>Saved campaigns</CardTitle>
          <CardDescription>
            Campaigns saved from this builder, with click totals matched by source, medium, and campaign name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedCampaigns.length > 0 ? (
            <div className="grid gap-3">
              {savedCampaigns.map((campaign) => {
                const campaignUrl = buildCampaignUrl(publicProfileUrl, {
                  source: campaign.source,
                  medium: campaign.medium,
                  campaign: campaign.name,
                  content: undefined,
                  term: undefined,
                });

                return (
                  <div key={campaign.id} className="rounded-lg border bg-muted/20 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{campaign.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {campaign.source} • {campaign.medium}
                        </p>
                        <div className="mt-3 rounded-md border bg-background px-2.5 py-2 font-mono text-xs text-muted-foreground break-all">
                          {campaignUrl}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <BarChart3 className="mr-1 inline size-3" />
                          {campaign.clicks.toLocaleString()} clicks
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyValue(campaignUrl, "campaign")}
                        >
                          <Copy className="size-4" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
              Save your first campaign URL to start tracking named campaigns in analytics.
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
  value?: string;
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
        name={label.toLowerCase()}
        value={value ?? ""}
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

function buildDraftUrl(publicProfileUrl: string, values: CampaignFormState) {
  if (!values.source || !values.medium || !values.campaign) {
    return "";
  }

  return buildCampaignUrl(publicProfileUrl, values);
}
