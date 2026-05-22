"use client";

import { useActionState } from "react";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";

import { completeOnboarding } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  onboardingNiches,
  onboardingProfileThemes,
  type OnboardingFormState,
  type OnboardingValues,
} from "@/lib/onboarding";

type OnboardingFormProps = {
  initialValues: OnboardingValues;
};

export function OnboardingForm({ initialValues }: OnboardingFormProps) {
  const [state, action, pending] = useActionState<
    OnboardingFormState,
    FormData
  >(completeOnboarding, { values: initialValues });

  const values = state.values;

  return (
    <form action={action} className="grid gap-5">
      <Card className="border-border/70 bg-card shadow-xl">
        <CardHeader className="border-b border-border/70">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Premium workspace setup
          </div>
          <CardTitle className="text-2xl">Build your affiliate identity</CardTitle>
          <Progress value={66} className="mt-3" />
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {state.message ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.message}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <Field>
                <FieldLabel htmlFor="username">Public handle</FieldLabel>
                <div className="flex rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                  <span className="flex h-9 items-center border-r border-border px-3 text-sm text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={values.username}
                    placeholder="growthstack"
                    autoComplete="username"
                    aria-invalid={Boolean(state.errors?.username)}
                    className="h-9 border-0 focus-visible:ring-0"
                  />
                </div>
                <FieldDescription>
                  Used for your public affiliate page URL.
                </FieldDescription>
                <FieldError>{state.errors?.username}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="displayName">Display name</FieldLabel>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={values.displayName}
                  placeholder="Jordan Lee"
                  autoComplete="name"
                  aria-invalid={Boolean(state.errors?.displayName)}
                  className="h-9"
                />
                <FieldDescription>
                  This appears at the top of your public profile.
                </FieldDescription>
                <FieldError>{state.errors?.displayName}</FieldError>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Niche</FieldLabel>
                <Select name="niche" defaultValue={values.niche}>
                  <SelectTrigger
                    className="h-9 w-full"
                    aria-invalid={Boolean(state.errors?.niche)}
                  >
                    <SelectValue placeholder="Choose your niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {onboardingNiches.map((niche) => (
                      <SelectItem key={niche.value} value={niche.value}>
                        {niche.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Helps Clickfolio tune future content suggestions.
                </FieldDescription>
                <FieldError>{state.errors?.niche}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Profile theme</FieldLabel>
                <Select name="theme" defaultValue={values.theme}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Choose a profile theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {onboardingProfileThemes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Sets the first look for your public affiliate page.
                </FieldDescription>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="bio">Short bio</FieldLabel>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={values.bio}
                placeholder="I test practical tools for creators who want cleaner funnels and better conversions."
                aria-invalid={Boolean(state.errors?.bio)}
                className="min-h-24 resize-none"
              />
              <FieldDescription>
                Keep it specific. This should explain who your picks are for.
              </FieldDescription>
              <FieldError>{state.errors?.bio}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="disclosureText">Affiliate disclosure</FieldLabel>
              <Textarea
                id="disclosureText"
                name="disclosureText"
                defaultValue={values.disclosureText}
                aria-invalid={Boolean(state.errors?.disclosureText)}
                className="min-h-20 resize-none"
              />
              <FieldDescription>
                A clear disclosure keeps your recommendations transparent.
              </FieldDescription>
              <FieldError>{state.errors?.disclosureText}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-xl border bg-surface p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span className="inline-flex items-center gap-2">
          <BadgeCheck className="size-4 text-primary" />
          Your dashboard unlocks after this profile is created.
        </span>
        <Button type="submit" disabled={pending} className="h-9">
          {pending ? "Creating profile..." : "Complete onboarding"}
          <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
