import { ImageUploader } from "@/components/onboarding/image-uploader";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  onboardingProfileThemes,
  type OnboardingErrors,
  type OnboardingValues,
} from "@/lib/onboarding";

type OnboardingMediaStepProps = {
  values: OnboardingValues;
  errors?: OnboardingErrors;
};

export function OnboardingMediaStep({
  values,
  errors,
}: OnboardingMediaStepProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-[0.55fr_1.45fr]">
        <ImageUploader
          name="avatarUrl"
          label="Avatar"
          description="Use a clear creator photo or brand mark."
          initialUrl={values.avatarUrl}
          error={errors?.avatarUrl}
          aspect="avatar"
        />
        <ImageUploader
          name="coverImageUrl"
          label="Cover image"
          description="A wide visual banner for the top of your public profile."
          initialUrl={values.coverImageUrl}
          error={errors?.coverImageUrl}
          aspect="cover"
        />
      </div>

      <Field>
        <FieldLabel>Profile theme</FieldLabel>
        <Select name="theme" defaultValue={values.theme}>
          <SelectTrigger className="h-10 w-full">
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
  );
}
