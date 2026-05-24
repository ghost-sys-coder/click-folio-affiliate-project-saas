"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateProfile, type ProfileUpdateState } from "@/actions/profile";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  onboardingContentTones,
  onboardingNiches,
  onboardingPlatforms,
  onboardingPrimaryGoals,
  onboardingProfileThemes,
} from "@/lib/onboarding";
import type { Profile } from "@/db/schema";
import { ProfileImageUploader } from "./profile-image-uploader";

type ProfileEditorProps = {
  profile: Profile;
};

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const [state, formAction, isPending] = useActionState<ProfileUpdateState, FormData>(updateProfile, {
    success: false,
    message: "",
  });

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [coverImageUrl, setCoverImageUrl] = useState(profile.coverImageUrl || "");

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Profile updated successfully");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your public profile information and appearance.
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="px-8 shadow-lg shadow-primary/20">
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Visuals */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Brand Visuals</CardTitle>
              <CardDescription>Upload your avatar and cover image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <ProfileImageUploader
                label="Avatar"
                value={avatarUrl}
                onChange={setAvatarUrl}
                aspect="avatar"
              />
              <input type="hidden" name="avatarUrl" value={avatarUrl} />

              <ProfileImageUploader
                label="Cover Image"
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                aspect="cover"
              />
              <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Choose your public profile theme.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Field>
                <FieldLabel>Profile Theme</FieldLabel>
                <Select name="theme" defaultValue={profile.theme || "growth-mint"}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {onboardingProfileThemes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{state.errors?.theme}</FieldError>
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right Column: Identity & Strategy */}
        <div className="space-y-8 lg:col-span-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Identity</CardTitle>
              <CardDescription>Tell your audience who you are.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">@</span>
                      <Input
                        id="username"
                        name="username"
                        defaultValue={profile.username}
                        className="pl-7 bg-background"
                        placeholder="yourname"
                      />
                    </div>
                    <FieldDescription>Your unique public handle.</FieldDescription>
                    <FieldError>{state.errors?.username}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
                    <Input
                      id="displayName"
                      name="displayName"
                      defaultValue={profile.displayName}
                      className="bg-background"
                      placeholder="Jane Doe"
                    />
                    <FieldDescription>Name shown on your profile.</FieldDescription>
                    <FieldError>{state.errors?.displayName}</FieldError>
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="niche">Niche</FieldLabel>
                    <Select name="niche" defaultValue={profile.niche || "creator-tools"}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select a niche" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {onboardingNiches.map((niche) => (
                            <SelectItem key={niche.value} value={niche.value}>
                              {niche.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError>{state.errors?.niche}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="default_button_label">Default Button Label</FieldLabel>
                    <Input
                      id="defaultButtonLabel"
                      name="defaultButtonLabel"
                      defaultValue={profile.defaultButtonLabel || "View Deal"}
                      className="bg-background"
                    />
                    <FieldError>{state.errors?.defaultButtonLabel}</FieldError>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={profile.bio || ""}
                    className="min-h-[100px] bg-background resize-none"
                    placeholder="Briefly describe what you do..."
                  />
                  <FieldDescription>Keep it short and engaging (max 180 chars).</FieldDescription>
                  <FieldError>{state.errors?.bio}</FieldError>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Strategy & Compliance</CardTitle>
              <CardDescription>Optimize for your audience and staying compliant.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="primaryPlatform">Primary Platform</FieldLabel>
                    <Select name="primaryPlatform" defaultValue={profile.primaryPlatform}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {onboardingPlatforms.map((platform) => (
                            <SelectItem key={platform.value} value={platform.value}>
                              {platform.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError>{state.errors?.primaryPlatform}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="contentTone">Content Tone</FieldLabel>
                    <Select name="contentTone" defaultValue={profile.contentTone}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {onboardingContentTones.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError>{state.errors?.contentTone}</FieldError>
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="primaryGoal">Primary Goal</FieldLabel>
                    <Select name="primaryGoal" defaultValue={profile.primaryGoal}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {onboardingPrimaryGoals.map((goal) => (
                            <SelectItem key={goal.value} value={goal.value}>
                              {goal.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError>{state.errors?.primaryGoal}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="targetAudience">Target Audience</FieldLabel>
                    <Input
                      id="targetAudience"
                      name="targetAudience"
                      defaultValue={profile.targetAudience}
                      className="bg-background"
                    />
                    <FieldError>{state.errors?.targetAudience}</FieldError>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="disclosureText">Affiliate Disclosure</FieldLabel>
                  <Textarea
                    id="disclosureText"
                    name="disclosureText"
                    defaultValue={profile.disclosureText}
                    className="min-h-[80px] bg-background resize-none"
                  />
                  <FieldDescription>
                    Transparency is key. This text appears at the bottom of your profile.
                  </FieldDescription>
                  <FieldError>{state.errors?.disclosureText}</FieldError>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
