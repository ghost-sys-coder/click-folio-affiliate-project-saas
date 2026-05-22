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
  onboardingContentTones,
  onboardingPlatforms,
  onboardingPrimaryGoals,
  type OnboardingErrors,
  type OnboardingValues,
} from "@/lib/onboarding";

type OnboardingStrategyStepProps = {
  values: OnboardingValues;
  errors?: OnboardingErrors;
};

export function OnboardingStrategyStep({
  values,
  errors,
}: OnboardingStrategyStepProps) {
  return (
    <div className="grid gap-5">
      <Field>
        <FieldLabel htmlFor="targetAudience">Target audience</FieldLabel>
        <Input
          id="targetAudience"
          name="targetAudience"
          defaultValue={values.targetAudience}
          placeholder="Solo SaaS founders"
          aria-invalid={Boolean(errors?.targetAudience)}
          className="h-10"
        />
        <FieldDescription>
          This gives future recommendations and copy a sharper direction.
        </FieldDescription>
        <FieldError>{errors?.targetAudience}</FieldError>
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Primary platform</FieldLabel>
          <Select name="primaryPlatform" defaultValue={values.primaryPlatform}>
            <SelectTrigger
              className="h-10 w-full"
              aria-invalid={Boolean(errors?.primaryPlatform)}
            >
              <SelectValue placeholder="Choose a platform" />
            </SelectTrigger>
            <SelectContent>
              {onboardingPlatforms.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors?.primaryPlatform}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Content tone</FieldLabel>
          <Select name="contentTone" defaultValue={values.contentTone}>
            <SelectTrigger
              className="h-10 w-full"
              aria-invalid={Boolean(errors?.contentTone)}
            >
              <SelectValue placeholder="Choose a tone" />
            </SelectTrigger>
            <SelectContent>
              {onboardingContentTones.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors?.contentTone}</FieldError>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <Field>
          <FieldLabel>Primary goal</FieldLabel>
          <Select name="primaryGoal" defaultValue={values.primaryGoal}>
            <SelectTrigger
              className="h-10 w-full"
              aria-invalid={Boolean(errors?.primaryGoal)}
            >
              <SelectValue placeholder="Choose a goal" />
            </SelectTrigger>
            <SelectContent>
              {onboardingPrimaryGoals.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors?.primaryGoal}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="defaultButtonLabel">Default button label</FieldLabel>
          <Input
            id="defaultButtonLabel"
            name="defaultButtonLabel"
            defaultValue={values.defaultButtonLabel}
            placeholder="View Deal"
            aria-invalid={Boolean(errors?.defaultButtonLabel)}
            className="h-10"
          />
          <FieldError>{errors?.defaultButtonLabel}</FieldError>
        </Field>
      </div>
    </div>
  );
}
