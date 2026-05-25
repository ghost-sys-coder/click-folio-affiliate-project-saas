"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Save, Eye, Copy, Type, Layout, List, HelpCircle, CheckCircle, AlertCircle, Repeat, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { updateLandingPageAction } from "@/actions/landing-pages";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GeneratedLandingPage } from "@/db/schema";
import {
  createDefaultLandingPageSection,
  faqVariants,
  landingPageSectionTypes,
  normalizeLandingPageOutput,
  type LandingPageSection,
} from "@/lib/landing-pages";
import { getBaseUrl } from "@/lib/utils";

type LandingPageEditorProps = {
  landingPage: GeneratedLandingPage;
  username: string;
};

export function LandingPageEditor({ landingPage, username }: LandingPageEditorProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateLandingPageAction, {
    success: false,
    message: "",
  });
  const [aiInstructions, setAiInstructions] = useState("");
  const [isApplyingAi, setIsApplyingAi] = useState(false);
  const [newSections, setNewSections] = useState<Array<{ id: string; section: LandingPageSection }>>([]);
  const [sectionTypeToAdd, setSectionTypeToAdd] = useState<
    Exclude<(typeof landingPageSectionTypes)[number], "hero">
  >("faq");

  const output = normalizeLandingPageOutput(landingPage.outputJson);
  const sections = output.sections;
  const combinedSections = [
    ...sections.map((section, index) => ({ id: `existing-${index}`, section, isNew: false })),
    ...newSections.map((entry) => ({ ...entry, isNew: true })),
  ];

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Landing page updated.");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  async function applyAiEdit() {
    const instructions = aiInstructions.trim();

    if (instructions.length < 10) {
      toast.error("Describe the edit in a little more detail.");
      return;
    }

    setIsApplyingAi(true);

    try {
      const response = await fetch("/api/ai/edit-landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landingPageId: landingPage.id,
          instructions,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "AI edit failed.");
      }

      toast.success("AI changes applied.");
      setAiInstructions("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI edit failed.");
    } finally {
      setIsApplyingAi(false);
    }
  }

  function addSection() {
    setNewSections((current) => [
      ...current,
      {
        id: `new-${current.length}-${Date.now()}`,
        section: createDefaultLandingPageSection(sectionTypeToAdd),
      },
    ]);
  }

  function removeNewSection(id: string) {
    setNewSections((current) => current.filter((entry) => entry.id !== id));
  }

  function copyPublicUrl() {
    const url = `${getBaseUrl()}/l/${username}/${landingPage.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public URL copied to clipboard");
  }

  return (
    <form action={formAction} className="space-y-8 pb-10">
      <input type="hidden" name="id" value={landingPage.id} />
      <input type="hidden" name="sectionCount" value={combinedSections.length} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Landing Page</h1>
          <p className="text-muted-foreground">
            Refine the generated copy and SEO settings for your page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={copyPublicUrl}>
            <Copy className="mr-2 size-4" />
            Copy Public URL
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href={`/admin/landing-pages/${landingPage.id}/preview`}>
              <Eye className="mr-2 size-4" />
              Preview
            </Link>
          </Button>
          <Button type="submit" disabled={isPending} className="px-8 shadow-lg shadow-primary/20">
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Metadata & Settings */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                <span className="text-sm font-medium">AI Editor</span>
              </div>
              <CardTitle className="text-lg">Edit With AI</CardTitle>
              <CardDescription>
                Ask for copy rewrites, section changes, layout shifts, or hero media repositioning.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="aiInstructions">Edit Instructions</FieldLabel>
                  <Textarea
                    id="aiInstructions"
                    value={aiInstructions}
                    onChange={(event) => setAiInstructions(event.target.value)}
                    placeholder="Examples: Turn the hero video into a full background behind the text, shorten the headline, add a comparison section after benefits, and make the tone more premium."
                    className="min-h-32 resize-none bg-background"
                  />
                  <FieldDescription>
                    The AI edits the structured landing page JSON and saves the result directly to this draft.
                  </FieldDescription>
                </Field>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Move the hero image to the left and tighten the headline.",
                    "Turn the hero image into a full background behind the text.",
                    "Turn this into a more premium, high-trust page for professionals.",
                    "Add a comparison section after the benefits section.",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAiInstructions(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={applyAiEdit}
                  disabled={isApplyingAi}
                  className="shadow-lg shadow-primary/20"
                >
                  {isApplyingAi ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 size-4" />
                  )}
                  Apply AI Edit
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Page Settings</CardTitle>
              <CardDescription>Internal identifier and slug.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Admin Title</FieldLabel>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={landingPage.title}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="slug">Public Slug</FieldLabel>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={landingPage.slug}
                    className="bg-background font-mono text-xs"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">SEO Metadata</CardTitle>
              <CardDescription>Optimize for search engines.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="seoTitle">SEO Title</FieldLabel>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    defaultValue={landingPage.seoTitle || ""}
                    className="bg-background"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seoDescription">SEO Description</FieldLabel>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    defaultValue={landingPage.seoDescription || ""}
                    className="bg-background min-h-25 resize-none text-sm"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Legal & Transparency</CardTitle>
              <CardDescription>Affiliate disclosures and risk warnings.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>Affiliate Disclosure</FieldLabel>
                  <Textarea
                    name="disclosure"
                    defaultValue={output.disclosure}
                    className="bg-background min-h-20 resize-none text-xs"
                  />
                </Field>
                <Field>
                  <FieldLabel>Risk Warnings (One per line)</FieldLabel>
                  <Textarea
                    name="riskWarnings"
                    defaultValue={output.riskWarnings?.join("\n") || ""}
                    className="bg-background min-h-25 resize-none text-xs"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right: Dynamic Content Editor */}
        <div className="space-y-8 lg:col-span-2">
          <Card className="border-dashed border-border/80 shadow-sm">
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="text-lg">Add Section</CardTitle>
              <CardDescription>
                Insert a structured section that still works with AI editing and the page renderer.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Select
                  value={sectionTypeToAdd}
                  onValueChange={(value) =>
                    setSectionTypeToAdd(value as Exclude<(typeof landingPageSectionTypes)[number], "hero">)
                  }
                >
                  <SelectTrigger className="bg-background sm:flex-1">
                    <SelectValue placeholder="Choose a section type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {landingPageSectionTypes
                        .filter((type) => type !== "hero")
                        .map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1")}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addSection}>
                  <Plus className="mr-2 size-4" />
                  Add Section
                </Button>
              </div>
            </CardContent>
          </Card>

          {combinedSections.map(({ id, section, isNew }, index) => (
            <SectionEditorItem 
              key={id} 
              section={section}
              index={index}
              isNew={isNew}
              onRemove={isNew ? () => removeNewSection(id) : undefined}
            />
          ))}
        </div>
      </div>
    </form>
  );
}

function SectionEditorItem({
  section,
  index,
  isNew = false,
  onRemove,
}: {
  section: LandingPageSection;
  index: number;
  isNew?: boolean;
  onRemove?: () => void;
}) {
  const prefix = `section.${index}.`;
  const [heroMediaLayout, setHeroMediaLayout] = useState(
    section.type === "hero" ? section.content.mediaLayout || "right" : "right"
  );
  const [faqVariant, setFaqVariant] = useState(
    section.type === "faq" ? section.content.variant || "cards" : "cards"
  );
  
  const getIcon = () => {
    switch (section.type) {
      case "hero": return <Layout className="size-5 text-primary" />;
      case "problem": return <AlertCircle className="size-5 text-destructive" />;
      case "solution": return <CheckCircle className="size-5 text-green-500" />;
      case "benefits": return <SparklesIcon className="size-5 text-primary" />;
      case "useCases": return <Repeat className="size-5 text-primary" />;
      case "productHighlights": return <List className="size-5 text-primary" />;
      case "audience": return <Type className="size-5 text-primary" />;
      case "comparison": return <Layout className="size-5 text-primary" />;
      case "howItWorks": return <List className="size-5 text-primary" />;
      case "faq": return <HelpCircle className="size-5 text-primary" />;
      case "finalCta": return <SparklesIcon className="size-5 text-primary" />;
      default: return <Type className="size-5 text-primary" />;
    }
  };

  const getTitle = () => {
    const type = section.type;
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <input type="hidden" name={`${prefix}type`} value={section.type} />
      <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">{getTitle()}</CardTitle>
          </div>
          {isNew && onRemove ? (
            <Button type="button" variant="outline" size="sm" onClick={onRemove}>
              <Trash2 className="mr-2 size-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {Object.entries(section.content).map(([key, value]) => {
            if (key === "imageUrl" || key === "videoUrl" || key === "mediaLayout") return null;

            if (section.type === "faq" && key === "variant" && typeof value === "string") {
              return (
                <Field key={key}>
                  <FieldLabel>FAQ Layout</FieldLabel>
                  <input
                    type="hidden"
                    name={`${prefix}${key}`}
                    value={faqVariant}
                  />
                  <Select
                    value={faqVariant}
                    onValueChange={(nextValue) =>
                      setFaqVariant(nextValue as (typeof faqVariants)[number])
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose FAQ layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {faqVariants.map((variant) => (
                          <SelectItem key={variant} value={variant}>
                            {variant === "cards" ? "Cards" : "Accordion"}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Choose how FAQ entries are presented while keeping the same structured content.
                  </FieldDescription>
                </Field>
              );
            }
            
            if (Array.isArray(value)) {
              // Handle simple string arrays (bullets, items as strings)
              if (value.length === 0 || typeof value[0] === "string") {
                return (
                  <Field key={key}>
                    <FieldLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</FieldLabel>
                    <Textarea
                      name={`${prefix}${key}`}
                      defaultValue={value.join("\n")}
                      className="bg-background min-h-20 resize-none"
                    />
                  </Field>
                );
              }
              // Complex arrays (items with title/description)
              return <ObjectArrayEditor key={key} section={section} fieldKey={key} prefix={prefix} />;
            }

            if (typeof value === "string") {
              const isLong = value.length > 100;
              return (
                <Field key={key}>
                  <FieldLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</FieldLabel>
                  {isLong ? (
                    <Textarea
                      name={`${prefix}${key}`}
                      defaultValue={value}
                      className="bg-background min-h-20 resize-none"
                    />
                  ) : (
                    <Input
                      name={`${prefix}${key}`}
                      defaultValue={value}
                      className="bg-background"
                    />
                  )}
                </Field>
              );
            }

            return null;
          })}

          {section.type === "hero" && (
            <div className="space-y-6 border-t border-border/40 pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Hero Image URL</FieldLabel>
                  <Input
                    name={`${prefix}imageUrl`}
                    defaultValue={section.content.imageUrl || ""}
                    className="bg-background text-xs"
                  />
                </Field>

                <Field>
                  <FieldLabel>Hero Video URL</FieldLabel>
                  <Input
                    name={`${prefix}videoUrl`}
                    defaultValue={section.content.videoUrl || ""}
                    className="bg-background text-xs"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Hero Media Layout</FieldLabel>
                <input
                  type="hidden"
                  name={`${prefix}mediaLayout`}
                  value={heroMediaLayout}
                />
                <Select
                  value={heroMediaLayout}
                  onValueChange={(value) =>
                    setHeroMediaLayout(
                      value as "left" | "right" | "stacked" | "background"
                    )
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="left">Media left</SelectItem>
                      <SelectItem value="right">Media right</SelectItem>
                      <SelectItem value="stacked">Stacked / centered</SelectItem>
                      <SelectItem value="background">Background behind text</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  This controls whether the hero media sits beside the copy, below it, or behind the text as a full-bleed background.
                </FieldDescription>
              </Field>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ObjectArrayEditor({
  section,
  fieldKey,
  prefix,
}: {
  section: LandingPageSection;
  fieldKey: string;
  prefix: string;
}) {
  const value = section.content[fieldKey as keyof typeof section.content];
  const items = Array.isArray(value) ? value : [];
  const config = getObjectArrayConfig(section.type, fieldKey);
  const [entries, setEntries] = useState<Array<Record<string, unknown>>>(
    items.map((item) => ({ ...(item as Record<string, unknown>) }))
  );

  if (!config) {
    return (
      <div className="space-y-2">
        <FieldLabel className="capitalize">{fieldKey.replace(/([A-Z])/g, " $1")} (Read-only for now)</FieldLabel>
        <div className="p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground italic border border-dashed border-border">
          This section structure is not editable in this view yet.
        </div>
      </div>
    );
  }

  const resolvedConfig = config;

  function addEntry() {
    setEntries((current) => [...current, { ...resolvedConfig.defaultItem }]);
  }

  function removeEntry(index: number) {
    setEntries((current) => current.filter((_item, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <FieldLabel className="capitalize">{fieldKey.replace(/([A-Z])/g, " $1")}</FieldLabel>
        <Button type="button" variant="outline" size="sm" onClick={addEntry}>
          <Plus className="mr-2 size-4" />
          Add Item
        </Button>
      </div>
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={`${fieldKey}-${index}`} className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Item {index + 1}
              </p>
              {entries.length > 1 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeEntry(index)}>
                  <Trash2 className="mr-2 size-4" />
                  Remove
                </Button>
              ) : null}
            </div>
            {resolvedConfig.fields.map((field) => {
              const fieldValue = String(entry[field.name] ?? "");
              const inputName = `${prefix}${fieldKey}.${index}.${field.name}`;

              if (field.type === "textarea") {
                return (
                  <Field key={field.name}>
                    <FieldLabel>{field.label}</FieldLabel>
                    <Textarea
                      name={inputName}
                      defaultValue={fieldValue}
                      className="bg-background min-h-20 resize-none"
                    />
                  </Field>
                );
              }

              return (
                <Field key={field.name}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <Input
                    name={inputName}
                    defaultValue={fieldValue}
                    className="bg-background"
                  />
                </Field>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function getObjectArrayConfig(sectionType: LandingPageSection["type"], fieldKey: string) {
  if (fieldKey === "items") {
    if (sectionType === "faq") {
      return {
        fields: [
          { name: "question", label: "Question", type: "input" as const },
          { name: "answer", label: "Answer", type: "textarea" as const },
        ],
        defaultItem: {
          question: "Question",
          answer: "Answer",
        },
      };
    }

    if (
      sectionType === "benefits" ||
      sectionType === "useCases" ||
      sectionType === "productHighlights"
    ) {
      return {
        fields: [
          { name: "title", label: "Title", type: "input" as const },
          { name: "description", label: "Description", type: "textarea" as const },
        ],
        defaultItem: {
          title: "Title",
          description: "Description",
        },
      };
    }
  }

  if (fieldKey === "steps" && sectionType === "howItWorks") {
    return {
      fields: [
        { name: "title", label: "Step title", type: "input" as const },
        { name: "description", label: "Step description", type: "textarea" as const },
      ],
      defaultItem: {
        title: "Step title",
        description: "Describe this step.",
      },
    };
  }

  if (fieldKey === "rows" && sectionType === "comparison") {
    return {
      fields: [
        { name: "feature", label: "Feature", type: "input" as const },
        { name: "leftValue", label: "Left value", type: "input" as const },
        { name: "rightValue", label: "Right value", type: "input" as const },
      ],
      defaultItem: {
        feature: "Feature",
        leftValue: "Current option",
        rightValue: "Recommended option",
      },
    };
  }

  return null;
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
