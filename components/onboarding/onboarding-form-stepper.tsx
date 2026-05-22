import { Check } from "lucide-react";

import { onboardingSteps } from "@/lib/onboarding-flow";

type OnboardingFormStepperProps = {
  currentStepIndex: number;
};

export function OnboardingFormStepper({
  currentStepIndex,
}: OnboardingFormStepperProps) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {onboardingSteps.map((step, index) => {
        const complete = index < currentStepIndex;
        const active = index === currentStepIndex;

        return (
          <li
            key={step.id}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2"
          >
            <span
              className={
                active || complete
                  ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                  : "flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-soft text-xs font-medium text-muted-foreground"
              }
            >
              {complete ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span className="truncate text-xs font-medium">{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}
