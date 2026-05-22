import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingErrors, OnboardingValues } from "@/lib/onboarding";

type OnboardingPublishingStepProps = {
  values: OnboardingValues;
  errors?: OnboardingErrors;
};

export function OnboardingPublishingStep({
  values,
  errors,
}: OnboardingPublishingStepProps) {
  return (
    <div className="grid gap-5">
      <Field>
        <FieldLabel htmlFor="bio">Short bio</FieldLabel>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={values.bio}
          placeholder="I test practical tools for creators who want cleaner funnels and better conversions."
          aria-invalid={Boolean(errors?.bio)}
          className="min-h-28 resize-none"
        />
        <FieldDescription>
          Keep it specific. This should explain who your picks are for.
        </FieldDescription>
        <FieldError>{errors?.bio}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="disclosureText">Affiliate disclosure</FieldLabel>
        <Textarea
          id="disclosureText"
          name="disclosureText"
          defaultValue={values.disclosureText}
          aria-invalid={Boolean(errors?.disclosureText)}
          className="min-h-24 resize-none"
        />
        <FieldDescription>
          A clear disclosure keeps your recommendations transparent.
        </FieldDescription>
        <FieldError>{errors?.disclosureText}</FieldError>
      </Field>
    </div>
  );
}
