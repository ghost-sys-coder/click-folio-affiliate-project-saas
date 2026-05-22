export const onboardingCompleteIntent = "complete";
export const onboardingIntentField = "onboardingIntent";

export function isCompleteOnboardingIntent(formData: FormData) {
  return formData.get(onboardingIntentField) === onboardingCompleteIntent;
}
