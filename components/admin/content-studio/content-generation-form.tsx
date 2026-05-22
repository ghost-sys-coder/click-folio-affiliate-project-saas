"use client";

import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ContentStudioLinkOption } from "@/components/admin/content-studio/types";
import {
  contentStudioAudienceAngles,
  contentStudioGoals,
  contentStudioPlatforms,
  contentStudioTones,
  type ContentStudioRequest,
} from "@/lib/content-studio";

export function ContentGenerationForm({
  links,
  isGenerating,
  onGenerate,
}: {
  links: ContentStudioLinkOption[];
  isGenerating: boolean;
  onGenerate: (request: ContentStudioRequest) => Promise<void>;
}) {
  const [linkId, setLinkId] = useState(links[0]?.id ?? "");
  const [platform, setPlatform] =
    useState<ContentStudioRequest["platform"]>("Instagram");
  const [goal, setGoal] =
    useState<ContentStudioRequest["goal"]>("Drive clicks");
  const [audienceAngle, setAudienceAngle] = useState("Creators");
  const [customAudience, setCustomAudience] = useState("");
  const [tone, setTone] = useState<ContentStudioRequest["tone"]>("Friendly");
  const [extraContext, setExtraContext] = useState("");

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onGenerate({
      linkId,
      platform,
      goal,
      audience:
        audienceAngle === "Custom" ? customAudience.trim() : audienceAngle,
      tone,
      extraContext,
    });
  }

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader>
        <CardTitle>Generate content</CardTitle>
        <CardDescription>
          Build a platform-specific content pack from one real affiliate link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={submitForm}>
          <FieldGroup>
            <Field>
              <FieldLabel>Affiliate link</FieldLabel>
              <Select value={linkId} onValueChange={setLinkId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an affiliate link" />
                </SelectTrigger>
                <SelectContent>
                  {links.map((link) => (
                    <SelectItem key={link.id} value={link.id}>
                      {link.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Content will be grounded in this link&apos;s saved details.
              </FieldDescription>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Platform</FieldLabel>
                <Select
                  value={platform}
                  onValueChange={(value) =>
                    setPlatform(value as ContentStudioRequest["platform"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentStudioPlatforms.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Promotion goal</FieldLabel>
                <Select
                  value={goal}
                  onValueChange={(value) =>
                    setGoal(value as ContentStudioRequest["goal"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentStudioGoals.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Audience angle</FieldLabel>
                <Select value={audienceAngle} onValueChange={setAudienceAngle}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentStudioAudienceAngles.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Tone</FieldLabel>
                <Select
                  value={tone}
                  onValueChange={(value) =>
                    setTone(value as ContentStudioRequest["tone"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentStudioTones.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {audienceAngle === "Custom" ? (
              <Field>
                <FieldLabel>Custom audience</FieldLabel>
                <Input
                  value={customAudience}
                  placeholder="Example: solo creators selling digital products"
                  onChange={(event) => setCustomAudience(event.target.value)}
                />
              </Field>
            ) : null}

            <Field>
              <FieldLabel>Extra context</FieldLabel>
              <Textarea
                value={extraContext}
                placeholder="Optional context, campaign details, positioning, or constraints."
                onChange={(event) => setExtraContext(event.target.value)}
              />
              <FieldDescription>
                Do not add discounts, claims, or personal experience unless
                they are true and already known.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isGenerating || !linkId}>
            <Sparkles className="size-4" />
            {isGenerating ? "Generating..." : "Generate content pack"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
