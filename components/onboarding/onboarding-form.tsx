"use client";

import { useActionState, useState } from "react";
import type { FormEvent } from "react";
import { Sparkles } from "lucide-react";

import { completeOnboarding } from "@/actions/onboarding";
import { OnboardingFormFooter } from "@/components/onboarding/onboarding-form-footer";
import { OnboardingFormStepper } from "@/components/onboarding/onboarding-form-stepper";
import { OnboardingIdentityStep } from "@/components/onboarding/onboarding-identity-step";
import { OnboardingMediaStep } from "@/components/onboarding/onboarding-media-step";
import { OnboardingPublishingStep } from "@/components/onboarding/onboarding-publishing-step";
import { OnboardingStrategyStep } from "@/components/onboarding/onboarding-strategy-step";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import {
  canSubmitOnboardingStep,
  getStepIndexForErrors,
  onboardingSteps,
} from "@/lib/onboarding-flow";
import type { OnboardingFormState, OnboardingValues } from "@/lib/onboarding";

type OnboardingFormProps = {
  initialValues: OnboardingValues;
};

export function OnboardingForm({ initialValues }: OnboardingFormProps) {
  const [state, action, pending] = useActionState<
    OnboardingFormState,
    FormData
  >(completeOnboarding, { values: initialValues });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [ignoredErrorSignature, setIgnoredErrorSignature] = useState("");
  const [submitLocked, setSubmitLocked] = useState(false);
  const values = state.values;
  const errorSignature = state.errors ? JSON.stringify(state.errors) : "";
  const visibleStepIndex =
    errorSignature && errorSignature !== ignoredErrorSignature
      ? getStepIndexForErrors(state.errors)
      : currentStepIndex;
  const currentStep = onboardingSteps[visibleStepIndex];
  const isFirstStep = visibleStepIndex === 0;
  const canSubmit = canSubmitOnboardingStep(visibleStepIndex);
  const progress = ((visibleStepIndex + 1) / onboardingSteps.length) * 100;

  function goBack() {
    setIgnoredErrorSignature(errorSignature);
    setSubmitLocked(false);
    setCurrentStepIndex(Math.max(visibleStepIndex - 1, 0));
  }

  function goNext() {
    const nextStepIndex = Math.min(
      visibleStepIndex + 1,
      onboardingSteps.length - 1
    );

    setIgnoredErrorSignature(errorSignature);
    setCurrentStepIndex(nextStepIndex);

    if (canSubmitOnboardingStep(nextStepIndex)) {
      setSubmitLocked(true);
      window.setTimeout(() => setSubmitLocked(false), 600);
    }
  }

  function preventNonFinalSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;

    if (
      !(submitter instanceof HTMLElement) ||
      submitter.dataset.onboardingSubmit !== "true"
    ) {
      event.preventDefault();
    }
  }

  return (
    <form className="grid gap-5" onSubmit={preventNonFinalSubmit}>
      <Card className="border-border/70 bg-card shadow-xl">
        <CardHeader className="gap-4 border-b border-border/70">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Premium workspace setup
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {currentStep.description}
            </p>
          </div>
          <OnboardingFormStepper currentStepIndex={visibleStepIndex} />
          <Progress value={progress} className="mt-1" />
        </CardHeader>
        <CardContent>
          <FieldGroup key={JSON.stringify(values)}>
            {state.message ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.message}
              </div>
            ) : null}

            <section hidden={currentStep.id !== "identity"}>
              <OnboardingIdentityStep values={values} errors={state.errors} />
            </section>
            <section hidden={currentStep.id !== "media"}>
              <OnboardingMediaStep values={values} errors={state.errors} />
            </section>
            <section hidden={currentStep.id !== "strategy"}>
              <OnboardingStrategyStep values={values} errors={state.errors} />
            </section>
            <section hidden={currentStep.id !== "publishing"}>
              <OnboardingPublishingStep values={values} errors={state.errors} />
            </section>
          </FieldGroup>
        </CardContent>
      </Card>

      <OnboardingFormFooter
        isFirstStep={isFirstStep}
        canSubmit={canSubmit}
        pending={pending}
        submitLocked={submitLocked}
        submitAction={action}
        onBack={goBack}
        onNext={goNext}
      />
    </form>
  );
}
