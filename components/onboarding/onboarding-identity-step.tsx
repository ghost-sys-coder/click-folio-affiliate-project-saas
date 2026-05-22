import {
  Field,
  FieldDescription,
  FieldError,
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
import {
  onboardingNiches,
  type OnboardingErrors,
  type OnboardingValues,
} from "@/lib/onboarding";

type OnboardingIdentityStepProps = {
  values: OnboardingValues;
  errors?: OnboardingErrors;
};

export function OnboardingIdentityStep({
  values,
  errors,
}: OnboardingIdentityStepProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <Field>
          <FieldLabel htmlFor="username">Public handle</FieldLabel>
          <div className="flex rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <span className="flex h-10 items-center border-r border-border px-3 text-sm text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              name="username"
              defaultValue={values.username}
              placeholder="growthstack"
              autoComplete="username"
              aria-invalid={Boolean(errors?.username)}
              className="h-10 border-0 focus-visible:ring-0"
            />
          </div>
          <FieldDescription>Used for your public affiliate page URL.</FieldDescription>
          <FieldError>{errors?.username}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="displayName">Display name</FieldLabel>
          <Input
            id="displayName"
            name="displayName"
            defaultValue={values.displayName}
            placeholder="Jordan Lee"
            autoComplete="name"
            aria-invalid={Boolean(errors?.displayName)}
            className="h-10"
          />
          <FieldDescription>
            This appears at the top of your public profile.
          </FieldDescription>
          <FieldError>{errors?.displayName}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel>Niche</FieldLabel>
        <Select name="niche" defaultValue={values.niche}>
          <SelectTrigger
            className="h-10 w-full"
            aria-invalid={Boolean(errors?.niche)}
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
        <FieldError>{errors?.niche}</FieldError>
      </Field>
    </div>
  );
}
