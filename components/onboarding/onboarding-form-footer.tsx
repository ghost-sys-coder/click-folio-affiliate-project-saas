import { ArrowLeft, ArrowRight, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  onboardingCompleteIntent,
  onboardingIntentField,
} from "@/lib/onboarding-submit";

type OnboardingFormFooterProps = {
  isFirstStep: boolean;
  canSubmit: boolean;
  pending: boolean;
  submitLocked: boolean;
  submitAction: (formData: FormData) => void;
  onBack: () => void;
  onNext: () => void;
};

export function OnboardingFormFooter({
  isFirstStep,
  canSubmit,
  pending,
  submitLocked,
  submitAction,
  onBack,
  onNext,
}: OnboardingFormFooterProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-surface p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <span className="inline-flex items-center gap-2">
        <BadgeCheck className="size-4 text-primary" />
        Your dashboard unlocks after this profile is created.
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isFirstStep || pending}
          className="h-10"
          onClick={onBack}
        >
          <ArrowLeft />
          Back
        </Button>
        {canSubmit ? (
          <>
            <input
              type="hidden"
              name={onboardingIntentField}
              value={onboardingCompleteIntent}
              disabled={submitLocked}
            />
            <Button
              type="submit"
              formAction={submitAction}
              data-onboarding-submit="true"
              disabled={pending || submitLocked}
              className="h-10"
            >
              {pending ? "Creating profile..." : "Complete onboarding"}
              <ArrowRight />
            </Button>
          </>
        ) : (
          <Button type="button" disabled={pending} className="h-10" onClick={onNext}>
            Continue
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
