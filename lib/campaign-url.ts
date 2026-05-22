import { z } from "zod";

const optionalUtmField = z
  .string()
  .trim()
  .max(100, "Use 100 characters or fewer")
  .optional()
  .transform((value) => value || undefined);

export const campaignUrlInputSchema = z.object({
  source: z.string().trim().min(1, "Source is required").max(100),
  medium: z.string().trim().min(1, "Medium is required").max(100),
  campaign: z.string().trim().min(1, "Campaign is required").max(100),
  content: optionalUtmField,
  term: optionalUtmField,
});

export type CampaignUrlInput = z.infer<typeof campaignUrlInputSchema>;

export const suggestedSources = [
  "tiktok",
  "instagram",
  "facebook",
  "youtube",
  "x",
  "linkedin",
  "whatsapp",
  "email",
  "blog",
  "admin_preview",
] as const;

export const suggestedMediums = [
  "social",
  "video",
  "short_video",
  "email",
  "referral",
  "paid",
  "organic",
  "dashboard",
] as const;

export function buildCampaignUrl(
  publicProfileUrl: string,
  input: CampaignUrlInput
) {
  const parsedInput = campaignUrlInputSchema.parse(input);
  const [baseUrl] = publicProfileUrl.split("?");
  const params = new URLSearchParams();

  params.set("utm_source", parsedInput.source);
  params.set("utm_medium", parsedInput.medium);
  params.set("utm_campaign", parsedInput.campaign);

  if (parsedInput.content) {
    params.set("utm_content", parsedInput.content);
  }

  if (parsedInput.term) {
    params.set("utm_term", parsedInput.term);
  }

  return `${baseUrl}?${params.toString()}`;
}
